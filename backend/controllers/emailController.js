const Email = require('../models/Email');
const { getGeminiModel } = require('../config/gemini');

// @desc    Generate polished email content
// @route   POST /api/emails/generate
// @access  Private
const generateEmail = async (req, res) => {
  try {
    const {
      recipientEmail,
      recipientName,
      companyName,
      position,
      userContent,
      tone,
    } = req.body;

    // Validation
    if (!recipientEmail || !userContent) {
      return res.status(400).json({
        message: 'Please provide recipient email and email content',
      });
    }

    // Tone instructions
    const toneInstructions = {
      confident: 'Use confident and assertive language that shows strong self-belief while remaining respectful. Show enthusiasm and capability.',
      professional: 'Use formal, business-appropriate language that is polished, respectful, and follows professional email etiquette.',
      'hiring-friendly': 'Use warm yet professional language that appeals to recruiters and hiring managers. Emphasize value, cultural fit, and genuine interest.',
      technical: 'Use clear technical language when relevant, demonstrate expertise, and maintain professionalism with technical depth where appropriate.',
      creative: 'Use engaging and memorable language that stands out while maintaining professionalism. Show personality and innovation.',
    };

    const selectedTone = tone || 'professional';
    const toneInstruction = toneInstructions[selectedTone] || toneInstructions.professional;

    // Create context for better email generation
    const contextInfo = [];
    if (recipientName) contextInfo.push(`Recipient Name: ${recipientName}`);
    if (companyName) contextInfo.push(`Company: ${companyName}`);
    if (position) contextInfo.push(`Position/Purpose: ${position}`);

    const prompt = `
You are a professional email writing assistant. Generate a polished, professional email based on the user's draft content.

${contextInfo.length > 0 ? contextInfo.join('\n') : ''}

User's Draft Content:
${userContent}

Tone: ${selectedTone}
${toneInstruction}

Requirements:
1. Generate a compelling email subject line (just the subject, no "Subject:" prefix)
2. Write the complete email body with proper structure:
   - Professional greeting (use recipient name if provided, otherwise use appropriate generic greeting)
   - Well-structured paragraphs with clear flow
   - Include all key points from the user's draft but refined and professional
   - Proper closing with professional sign-off
3. Make it concise yet comprehensive
4. Ensure proper email etiquette
5. Make it impactful and engaging
6. Keep it human and genuine, not robotic
7. Do not use placeholder text like [Your Name] - leave signature area blank for user to add

Format your response EXACTLY as follows:
SUBJECT: [your subject line here]

BODY:
[your email body here]

Generate the email now:
`;

    // Call Gemini API
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // Parse the response
    const subjectMatch = generatedText.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = generatedText.match(/BODY:\s*([\s\S]+?)$/i);

    let subject = '';
    let body = '';

    if (subjectMatch && bodyMatch) {
      subject = subjectMatch[1].trim();
      body = bodyMatch[1].trim();
    } else {
      // Fallback parsing if format is different
      const lines = generatedText.split('\n');
      subject = lines[0].replace(/^SUBJECT:\s*/i, '').trim();
      body = lines.slice(2).join('\n').replace(/^BODY:\s*/i, '').trim();
    }

    // Save to database
    const email = await Email.create({
      user: req.user._id,
      recipientEmail,
      recipientName: recipientName || '',
      companyName: companyName || '',
      position: position || '',
      userContent,
      tone: selectedTone,
      generatedSubject: subject,
      generatedContent: body,
      status: 'draft',
    });

    res.status(201).json({
      success: true,
      data: email,
      email: {
        subject: subject,
        body: body,
      },
    });
  } catch (error) {
    console.error('=== ERROR IN GENERATE EMAIL ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    console.error('=== END ERROR ===');
    
    res.status(500).json({
      message: 'Error generating email',
      error: error.message,
    });
  }
};

// @desc    Regenerate email with different tone or modifications
// @route   POST /api/emails/regenerate/:id
// @access  Private
const regenerateEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user owns the email
    if (email.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { tone, userContent } = req.body;
    const selectedTone = tone || email.tone;
    const contentToUse = userContent || email.userContent;

    const toneInstructions = {
      confident: 'Use confident and assertive language that shows strong self-belief while remaining respectful. Show enthusiasm and capability.',
      professional: 'Use formal, business-appropriate language that is polished, respectful, and follows professional email etiquette.',
      'hiring-friendly': 'Use warm yet professional language that appeals to recruiters and hiring managers. Emphasize value, cultural fit, and genuine interest.',
      technical: 'Use clear technical language when relevant, demonstrate expertise, and maintain professionalism with technical depth where appropriate.',
      creative: 'Use engaging and memorable language that stands out while maintaining professionalism. Show personality and innovation.',
    };

    const toneInstruction = toneInstructions[selectedTone] || toneInstructions.professional;

    const contextInfo = [];
    if (email.recipientName) contextInfo.push(`Recipient Name: ${email.recipientName}`);
    if (email.companyName) contextInfo.push(`Company: ${email.companyName}`);
    if (email.position) contextInfo.push(`Position/Purpose: ${email.position}`);

    const prompt = `
You are a professional email writing assistant. Generate a NEW and DIFFERENT polished, professional email based on the user's draft content.

${contextInfo.length > 0 ? contextInfo.join('\n') : ''}

User's Draft Content:
${contentToUse}

Tone: ${selectedTone}
${toneInstruction}

Requirements:
1. Generate a compelling email subject line (just the subject, no "Subject:" prefix)
2. Write the complete email body with proper structure:
   - Professional greeting (use recipient name if provided, otherwise use appropriate generic greeting)
   - Well-structured paragraphs with clear flow
   - Include all key points from the user's draft but refined and professional
   - Proper closing with professional sign-off
3. Make it concise yet comprehensive
4. Ensure proper email etiquette
5. Make it impactful and engaging
6. Keep it human and genuine, not robotic
7. Do not use placeholder text like [Your Name] - leave signature area blank for user to add
8. Generate a DIFFERENT version from the previous generation

Format your response EXACTLY as follows:
SUBJECT: [your subject line here]

BODY:
[your email body here]

Generate the email now:
`;

    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    // Parse the response
    const subjectMatch = generatedText.match(/SUBJECT:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = generatedText.match(/BODY:\s*([\s\S]+?)$/i);

    let subject = '';
    let body = '';

    if (subjectMatch && bodyMatch) {
      subject = subjectMatch[1].trim();
      body = bodyMatch[1].trim();
    } else {
      const lines = generatedText.split('\n');
      subject = lines[0].replace(/^SUBJECT:\s*/i, '').trim();
      body = lines.slice(2).join('\n').replace(/^BODY:\s*/i, '').trim();
    }

    // Update email
    email.generatedSubject = subject;
    email.generatedContent = body;
    email.tone = selectedTone;
    if (userContent) email.userContent = userContent;
    await email.save();

    res.json({
      success: true,
      data: email,
      email: {
        subject: subject,
        body: body,
      },
    });
  } catch (error) {
    console.error('Error regenerating email:', error);
    res.status(500).json({
      message: 'Error regenerating email',
      error: error.message,
    });
  }
};

// @desc    Get all emails for logged in user
// @route   GET /api/emails
// @access  Private
const getEmails = async (req, res) => {
  try {
    const emails = await Email.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      count: emails.length,
      data: emails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single email
// @route   GET /api/emails/:id
// @access  Private
const getEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user owns the email
    if (email.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      success: true,
      data: email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update email (manually edit content)
// @route   PUT /api/emails/:id
// @access  Private
const updateEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user owns the email
    if (email.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedEmail = await Email.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      data: updatedEmail,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete email
// @route   DELETE /api/emails/:id
// @access  Private
const deleteEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Check if user owns the email
    if (email.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await email.deleteOne();

    res.json({
      success: true,
      message: 'Email deleted',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  generateEmail,
  regenerateEmail,
  getEmails,
  getEmail,
  updateEmail,
  deleteEmail,
};
