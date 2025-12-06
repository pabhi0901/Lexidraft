const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));

// Test Gemini API route
app.get('/api/test-gemini', async (req, res) => {
  try {
    const { getGeminiModel } = require('./config/gemini');
    const model = getGeminiModel();
    const result = await model.generateContent('Say hello in one sentence');
    const response = await result.response;
    const text = response.text();
    res.json({ success: true, message: text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, details: error.toString() });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
