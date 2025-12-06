const Project = require('../models/Project');
const { getGeminiModel } = require('../config/gemini');

// @desc    Generate bullet points for project
// @route   POST /api/projects/generate
// @access  Private
const generateBulletPoints = async (req, res) => {
  console.log('=== Generate Bullet Points Request ===');
  console.log('User:', req.user?._id);
  console.log('Body:', req.body);
  
  try {
    const {
      projectTitle,
      projectDescription,
      technologies,
      role,
      keyFeatures,
      tone,
    } = req.body;

    // Validation
    if (!projectTitle || !projectDescription) {
      return res.status(400).json({
        message: 'Please provide project title and description',
      });
    }

    // Create prompt for Gemini
    const toneInstructions = {
      confident: 'Use confident and assertive language that showcases strong capabilities and achievements.',
      professional: 'Use formal, business-appropriate language that is clear and polished.',
      'hiring-friendly': 'Use language that appeals to recruiters and hiring managers, emphasizing impact and results.',
      technical: 'Use technical terminology and focus on implementation details and methodologies.',
      creative: 'Use engaging and innovative language that stands out while remaining professional.',
    };

    const selectedTone = tone || 'professional';
    const toneInstruction = toneInstructions[selectedTone] || toneInstructions.professional;

    const prompt = `
You are a professional resume writer. Generate exactly 4-5 impactful bullet points for a project based on the following details:

Project Title: ${projectTitle}
Description: ${projectDescription}
${technologies ? `Technologies Used: ${technologies}` : ''}
${role ? `Your Role: ${role}` : ''}
${keyFeatures ? `Key Features: ${keyFeatures}` : ''}

Tone: ${selectedTone}
${toneInstruction}

Requirements:
- Generate exactly 4-5 bullet points
- Each bullet point should be concise (1-2 lines)
- Start each point with a strong action verb
- Quantify achievements where possible
- Highlight impact and results
- Make it suitable for a resume or portfolio
- Do not include bullet point symbols (•, -, *) just plain text
- Each point should be on a new line

Generate the bullet points now:
`;

    // Call Gemini API
    console.log('Calling Gemini API...');
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();
    console.log('Gemini response received:', generatedText.substring(0, 100));

    // Parse bullet points (split by newlines and filter empty lines)
    const bulletPoints = generatedText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line !== '');

    console.log('Parsed bullet points:', bulletPoints.length);

    // Save to database
    const project = await Project.create({
      user: req.user._id,
      projectTitle,
      projectDescription,
      technologies: technologies || '',
      role: role || '',
      keyFeatures: keyFeatures || '',
      tone: selectedTone,
      generatedBulletPoints: bulletPoints,
    });

    res.status(201).json({
      success: true,
      data: project,
      bulletPoints: bulletPoints,
    });
  } catch (error) {
    console.error('=== ERROR IN GENERATE BULLET POINTS ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('=== END ERROR ===');
    
    res.status(500).json({
      message: 'Error generating bullet points',
      error: error.message,
      details: error.toString(),
    });
  }
};

// @desc    Regenerate bullet points for existing project
// @route   POST /api/projects/regenerate/:id
// @access  Private
const regenerateBulletPoints = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { tone } = req.body;
    const selectedTone = tone || project.tone;

    const toneInstructions = {
      confident: 'Use confident and assertive language that showcases strong capabilities and achievements.',
      professional: 'Use formal, business-appropriate language that is clear and polished.',
      'hiring-friendly': 'Use language that appeals to recruiters and hiring managers, emphasizing impact and results.',
      technical: 'Use technical terminology and focus on implementation details and methodologies.',
      creative: 'Use engaging and innovative language that stands out while remaining professional.',
    };

    const toneInstruction = toneInstructions[selectedTone] || toneInstructions.professional;

    const prompt = `
You are a professional resume writer. Generate exactly 4-5 NEW and DIFFERENT impactful bullet points for a project based on the following details:

Project Title: ${project.projectTitle}
Description: ${project.projectDescription}
${project.technologies ? `Technologies Used: ${project.technologies}` : ''}
${project.role ? `Your Role: ${project.role}` : ''}
${project.keyFeatures ? `Key Features: ${project.keyFeatures}` : ''}

Tone: ${selectedTone}
${toneInstruction}

Requirements:
- Generate exactly 4-5 bullet points
- Each bullet point should be concise (1-2 lines)
- Start each point with a strong action verb
- Quantify achievements where possible
- Highlight impact and results
- Make it suitable for a resume or portfolio
- Do not include bullet point symbols (•, -, *) just plain text
- Each point should be on a new line
- Generate DIFFERENT bullet points from previous generation

Generate the bullet points now:
`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    const bulletPoints = generatedText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && line !== '');

    // Update project
    project.generatedBulletPoints = bulletPoints;
    project.tone = selectedTone;
    await project.save();

    res.json({
      success: true,
      data: project,
      bulletPoints: bulletPoints,
    });
  } catch (error) {
    console.error('Error regenerating bullet points:', error);
    res.status(500).json({
      message: 'Error regenerating bullet points',
      error: error.message,
    });
  }
};

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await project.deleteOne();

    res.json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateBulletPoints,
  regenerateBulletPoints,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
