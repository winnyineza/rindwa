const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:19006', 'http://localhost:3000', 'http://localhost:8081'],
  credentials: true
}));
app.use(express.json());

// Test data
let users = [
  { id: 1, email: 'test@example.com', password: '123456', firstName: 'Test', lastName: 'User' }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Rindwa Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt:', { email, password });
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({
      success: true,
      token: 'test-jwt-token-' + Date.now(),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Register endpoint
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  console.log('Register attempt:', { email, firstName, lastName });
  
  // Check if user exists
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    email,
    password,
    firstName,
    lastName
  };
  
  users.push(newUser);
  
  res.json({
    success: true,
    token: 'test-jwt-token-' + Date.now(),
    user: {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Rindwa Backend Server Started!');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
  console.log(`📝 Register: POST http://localhost:${PORT}/api/auth/register`);
  console.log('✅ Ready to test your mobile app!');
}); 