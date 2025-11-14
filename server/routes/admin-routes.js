// server/routes/admin.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// All admin routes require admin role
router.use(authenticate);
router.use(authorize(['admin']));

// GET /api/admin/stats - Get system statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total forms
    const formsResult = await db.query('SELECT COUNT(*) as count FROM forms');
    const totalForms = parseInt(formsResult.rows[0].count);

    // Get pending forms
    const pendingResult = await db.query(
      "SELECT COUNT(*) as count FROM forms WHERE status IN ('pending_pillar', 'pending_pastor')"
    );
    const pendingForms = parseInt(pendingResult.rows[0].count);

    // Get approved forms
    const approvedResult = await db.query(
      "SELECT COUNT(*) as count FROM forms WHERE status = 'approved'"
    );
    const approvedForms = parseInt(approvedResult.rows[0].count);

    // Get total budget (sum of all approved forms)
    const budgetResult = await db.query(`
      SELECT 
        COALESCE(SUM((sections->>'total_budget')::numeric), 0) as total
      FROM forms
      WHERE status = 'approved'
        AND sections->>'total_budget' IS NOT NULL
    `);
    const totalBudget = parseFloat(budgetResult.rows[0].total);

    // Get total users
    const usersResult = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total ministries
    const ministriesResult = await db.query('SELECT COUNT(*) as count FROM ministries');
    const totalMinistries = parseInt(ministriesResult.rows[0].count);

    // Get active ministries
    const activeMinistriesResult = await db.query(
      'SELECT COUNT(*) as count FROM ministries WHERE active = true'
    );
    const activeMinistries = parseInt(activeMinistriesResult.rows[0].count);

    // Get total event types
    const eventTypesResult = await db.query('SELECT COUNT(*) as count FROM event_types');
    const totalEventTypes = parseInt(eventTypesResult.rows[0].count);

    // Get active users
    const activeUsersResult = await db.query(
      'SELECT COUNT(*) as count FROM users WHERE active = true'
    );
    const activeUsers = parseInt(activeUsersResult.rows[0].count);

    // Get recent activity
    const activityResult = await db.query(`
      SELECT 
        'Form Submitted' as description,
        u.full_name as user,
        f.submitted_at as created_at,
        'submission' as type
      FROM forms f
      JOIN users u ON f.created_by = u.id
      WHERE f.submitted_at IS NOT NULL
      ORDER BY f.submitted_at DESC
      LIMIT 10
    `);

    res.json({
      totalForms,
      pendingForms,
      approvedForms,
      totalBudget,
      totalUsers,
      totalMinistries,
      activeMinistries,
      totalEventTypes,
      activeUsers,
      recentActivity: activityResult.rows
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ message: 'Error retrieving statistics' });
  }
});

// ========== MINISTRIES ==========

// GET /api/admin/ministries - Get all ministries
router.get('/ministries', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        m.*,
        u.full_name as pillar_name
      FROM ministries m
      LEFT JOIN users u ON m.pillar_id = u.id
      ORDER BY m.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting ministries:', error);
    res.status(500).json({ message: 'Error retrieving ministries' });
  }
});

// POST /api/admin/ministries - Create ministry
router.post('/ministries', [
  body('name').trim().notEmpty().withMessage('Ministry name is required'),
  body('pillar_id').optional().isInt(),
  body('description').optional().trim(),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, pillar_id, description, active } = req.body;

  try {
    // Check for duplicate name
    const existing = await db.query(
      'SELECT id FROM ministries WHERE LOWER(name) = LOWER($1)',
      [name]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'A ministry with this name already exists' });
    }

    const result = await db.query(
      `INSERT INTO ministries (name, pillar_id, description, active)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, pillar_id || null, description || null, active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating ministry:', error);
    res.status(500).json({ message: 'Error creating ministry' });
  }
});

// PUT /api/admin/ministries/:id - Update ministry
router.put('/ministries/:id', [
  body('name').trim().notEmpty().withMessage('Ministry name is required'),
  body('pillar_id').optional().isInt(),
  body('description').optional().trim(),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, pillar_id, description, active } = req.body;

  try {
    // Check for duplicate name (excluding current ministry)
    const existing = await db.query(
      'SELECT id FROM ministries WHERE LOWER(name) = LOWER($1) AND id != $2',
      [name, id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'A ministry with this name already exists' });
    }

    const result = await db.query(
      `UPDATE ministries 
       SET name = $1, pillar_id = $2, description = $3, active = $4
       WHERE id = $5
       RETURNING *`,
      [name, pillar_id || null, description || null, active !== false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ministry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating ministry:', error);
    res.status(500).json({ message: 'Error updating ministry' });
  }
});

// DELETE /api/admin/ministries/:id - Delete ministry
router.delete('/ministries/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if ministry is used in any forms
    const formsCheck = await db.query(
      'SELECT COUNT(*) as count FROM forms WHERE ministry_id = $1',
      [id]
    );

    if (parseInt(formsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete ministry. It has associated forms.' 
      });
    }

    const result = await db.query(
      'DELETE FROM ministries WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Ministry not found' });
    }

    res.json({ message: 'Ministry deleted successfully' });
  } catch (error) {
    console.error('Error deleting ministry:', error);
    res.status(500).json({ message: 'Error deleting ministry' });
  }
});

// ========== EVENT TYPES ==========

// GET /api/admin/event-types - Get all event types
router.get('/event-types', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM event_types ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting event types:', error);
    res.status(500).json({ message: 'Error retrieving event types' });
  }
});

// POST /api/admin/event-types - Create event type
router.post('/event-types', [
  body('name').trim().notEmpty().withMessage('Event type name is required'),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, active } = req.body;

  try {
    // Check for duplicate name
    const existing = await db.query(
      'SELECT id FROM event_types WHERE LOWER(name) = LOWER($1)',
      [name]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'An event type with this name already exists' });
    }

    const result = await db.query(
      `INSERT INTO event_types (name, active)
       VALUES ($1, $2)
       RETURNING *`,
      [name, active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating event type:', error);
    res.status(500).json({ message: 'Error creating event type' });
  }
});

// PUT /api/admin/event-types/:id - Update event type
router.put('/event-types/:id', [
  body('name').trim().notEmpty().withMessage('Event type name is required'),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, active } = req.body;

  try {
    // Check for duplicate name (excluding current event type)
    const existing = await db.query(
      'SELECT id FROM event_types WHERE LOWER(name) = LOWER($1) AND id != $2',
      [name, id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'An event type with this name already exists' });
    }

    const result = await db.query(
      `UPDATE event_types 
       SET name = $1, active = $2
       WHERE id = $3
       RETURNING *`,
      [name, active !== false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event type:', error);
    res.status(500).json({ message: 'Error updating event type' });
  }
});

// DELETE /api/admin/event-types/:id - Delete event type
router.delete('/event-types/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if event type is used in any events
    const eventsCheck = await db.query(
      'SELECT COUNT(*) as count FROM events WHERE event_type = (SELECT name FROM event_types WHERE id = $1)',
      [id]
    );

    if (parseInt(eventsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete event type. It is used by existing events.' 
      });
    }

    const result = await db.query(
      'DELETE FROM event_types WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Event type not found' });
    }

    res.json({ message: 'Event type deleted successfully' });
  } catch (error) {
    console.error('Error deleting event type:', error);
    res.status(500).json({ message: 'Error deleting event type' });
  }
});

// ========== USERS ==========

// GET /api/admin/users - Get all users
router.get('/users', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id, full_name, email, role, active, created_at
      FROM users
      ORDER BY full_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ message: 'Error retrieving users' });
  }
});

// POST /api/admin/users - Create user
router.post('/users', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('role').isIn(['ministry', 'pillar', 'pastor', 'admin']).withMessage('Valid role is required'),
  body('pin').isLength({ min: 4, max: 4 }).isNumeric().withMessage('PIN must be 4 digits'),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { full_name, email, role, pin, active } = req.body;

  try {
    // Check for duplicate email
    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const result = await db.query(
      `INSERT INTO users (full_name, email, role, pin, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, email, role, active, created_at`,
      [full_name, email, role, pin, active !== false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', [
  body('full_name').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('role').isIn(['ministry', 'pillar', 'pastor', 'admin']).withMessage('Valid role is required'),
  body('pin').optional().isLength({ min: 4, max: 4 }).isNumeric().withMessage('PIN must be 4 digits'),
  body('active').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { full_name, email, role, pin, active } = req.body;

  try {
    // Check for duplicate email (excluding current user)
    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) AND id != $2',
      [email, id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    let query, params;
    
    if (pin) {
      // Update with new PIN
      query = `UPDATE users 
               SET full_name = $1, email = $2, role = $3, pin = $4, active = $5
               WHERE id = $6
               RETURNING id, full_name, email, role, active, created_at`;
      params = [full_name, email, role, pin, active !== false, id];
    } else {
      // Update without changing PIN
      query = `UPDATE users 
               SET full_name = $1, email = $2, role = $3, active = $4
               WHERE id = $5
               RETURNING id, full_name, email, role, active, created_at`;
      params = [full_name, email, role, active !== false, id];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// PUT /api/admin/users/:id/pin - Update user PIN
router.put('/users/:id/pin', [
  body('pin').isLength({ min: 4, max: 4 }).isNumeric().withMessage('PIN must be 4 digits')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { pin } = req.body;

  try {
    const result = await db.query(
      'UPDATE users SET pin = $1 WHERE id = $2 RETURNING id',
      [pin, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'PIN updated successfully' });
  } catch (error) {
    console.error('Error updating PIN:', error);
    res.status(500).json({ message: 'Error updating PIN' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if user created any forms
    const formsCheck = await db.query(
      'SELECT COUNT(*) as count FROM forms WHERE created_by = $1',
      [id]
    );

    if (parseInt(formsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user. They have created forms in the system.' 
      });
    }

    const result = await db.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// ========== PILLARS ==========

// GET /api/admin/pillars - Get all pillar users (for dropdown)
router.get('/pillars', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, full_name, email
      FROM users
      WHERE role = 'pillar' AND active = true
      ORDER BY full_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting pillars:', error);
    res.status(500).json({ message: 'Error retrieving pillars' });
  }
});

module.exports = router;
