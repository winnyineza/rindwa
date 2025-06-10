const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Rindwa Backend is running!' });
});

// Test auth endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'test@example.com' && password === '123456') {
    res.json({
      success: true,
      token: 'test-jwt-token',
      user: { id: 1, email, firstName: 'Test', lastName: 'User' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  res.json({
    success: true,
    token: 'test-jwt-token',
    user: { id: 1, email, firstName, lastName }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Rindwa Backend Test Server running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/login`);
}); 