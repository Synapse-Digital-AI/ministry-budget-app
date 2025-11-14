// server/server.js
// The Voice Church - Ministry Budget System Backend

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Database connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✓ Database connected successfully');
  }
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again later'
});

// ============================================
// MIDDLEWARE: JWT Authentication
// ============================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authorization middleware - check role
const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// ============================================
// ROUTES: Authentication
// ============================================

// POST /api/auth/login - Login with email and PIN
app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const { email, pin } = req.body;

    if (!email || !pin) {
      return res.status(400).json({ error: 'Email and PIN are required' });
    }

    // Query user
    const result = await pool.query(
      'SELECT id, email, pin, role, name, ministry, active FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or PIN' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.active) {
      return res.status(401).json({ error: 'Account is inactive. Contact administrator.' });
    }

    // Simple PIN comparison (in production, use bcrypt)
    if (user.pin !== pin) {
      return res.status(401).json({ error: 'Invalid email or PIN' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details, ip_address) VALUES ($1, $2, $3, $4)',
      [user.id, 'login', `User logged in`, req.ip]
    );

    // Return token and user info (without PIN)
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        ministry: user.ministry
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET /api/auth/verify - Verify JWT token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// PUT /api/auth/change-pin - Change user PIN
app.put('/api/auth/change-pin', authenticateToken, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;

    if (!currentPin || !newPin) {
      return res.status(400).json({ error: 'Current PIN and new PIN are required' });
    }

    if (newPin.length < 4 || newPin.length > 6) {
      return res.status(400).json({ error: 'PIN must be 4-6 digits' });
    }

    // Verify current PIN
    const result = await pool.query(
      'SELECT pin FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows[0].pin !== currentPin) {
      return res.status(401).json({ error: 'Current PIN is incorrect' });
    }

    // Update PIN
    await pool.query(
      'UPDATE users SET pin = $1 WHERE id = $2',
      [newPin, req.user.id]
    );

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'pin_change', 'User changed PIN']
    );

    res.json({ message: 'PIN updated successfully' });

  } catch (error) {
    console.error('Change PIN error:', error);
    res.status(500).json({ error: 'Server error during PIN change' });
  }
});

// ============================================
// ROUTES: Users (Admin only)
// ============================================

// GET /api/users - List all users
app.get('/api/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, name, ministry, active, created_at FROM users ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// POST /api/users - Create new user
app.post('/api/users', authenticateToken, authorizeRole('admin'), async (req, res) => {
  try {
    const { email, pin, role, name, ministry } = req.body;

    if (!email || !pin || !role || !name) {
      return res.status(400).json({ error: 'Email, PIN, role, and name are required' });
    }

    const result = await pool.query(
      'INSERT INTO users (email, pin, role, name, ministry) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role, name, ministry',
      [email.toLowerCase(), pin, role, name, ministry]
    );

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'user_create', `Created user: ${email}`]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
});

// ============================================
// ROUTES: Forms (Coming in Phase 2)
// ============================================

// Placeholder - will implement in Phase 2
app.get('/api/forms', authenticateToken, (req, res) => {
  res.json({ message: 'Forms endpoint - Coming in Phase 2', forms: [] });
});

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'ministry-budget-api'
  });
});

// ============================================
// Error Handling
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================
// Start Server
// ============================================
app.listen(PORT, () => {
  console.log('=================================');
  console.log('🚀 The Voice Church - Ministry Budget API');
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('=================================');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  pool.end();
  process.exit(0);
});

module.exports = app;
