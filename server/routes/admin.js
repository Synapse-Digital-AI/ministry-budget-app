// server/routes/admin.js
// Admin management routes for ministries and event types

const express = require('express');
const router = express.Router();

// Initialize with pool from server.js
let pool;
const initializeRouter = (dbPool) => {
  pool = dbPool;
};

// ============================================
// MINISTRIES MANAGEMENT
// ============================================

// GET /api/admin/ministries - List all ministries
router.get('/ministries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        m.id,
        m.name,
        m.pillar_id,
        m.description,
        m.active,
        m.created_at,
        m.updated_at,
        u.name as pillar_name,
        u.email as pillar_email
      FROM ministries m
      LEFT JOIN users u ON m.pillar_id = u.id
      ORDER BY m.name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get ministries error:', error);
    res.status(500).json({ error: 'Server error fetching ministries' });
  }
});

// POST /api/admin/ministries - Create new ministry
router.post('/ministries', async (req, res) => {
  try {
    const { name, pillar_id, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Ministry name is required' });
    }

    // Verify pillar exists
    if (pillar_id) {
      const pillarCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'pillar'",
        [pillar_id]
      );
      if (pillarCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid pillar ID' });
      }
    }

    const result = await pool.query(
      `INSERT INTO ministries (name, pillar_id, description)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name.trim(), pillar_id || null, description || null]
    );

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'ministry_created', `Created ministry: ${name}`]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Ministry name already exists' });
    }
    console.error('Create ministry error:', error);
    res.status(500).json({ error: 'Server error creating ministry' });
  }
});

// PUT /api/admin/ministries/:id - Update ministry
router.put('/ministries/:id', async (req, res) => {
  try {
    const ministryId = parseInt(req.params.id);
    const { name, pillar_id, description, active } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Ministry name is required' });
    }

    // Verify pillar exists if provided
    if (pillar_id) {
      const pillarCheck = await pool.query(
        "SELECT id FROM users WHERE id = $1 AND role = 'pillar'",
        [pillar_id]
      );
      if (pillarCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid pillar ID' });
      }
    }

    const result = await pool.query(
      `UPDATE ministries 
       SET name = $1,
           pillar_id = $2,
           description = $3,
           active = $4,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [
        name.trim(),
        pillar_id || null,
        description || null,
        active !== undefined ? active : true,
        ministryId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'ministry_updated', `Updated ministry: ${name}`]
    );

    res.json(result.rows[0]);

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Ministry name already exists' });
    }
    console.error('Update ministry error:', error);
    res.status(500).json({ error: 'Server error updating ministry' });
  }
});

// DELETE /api/admin/ministries/:id - Delete ministry
router.delete('/ministries/:id', async (req, res) => {
  try {
    const ministryId = parseInt(req.params.id);

    // Check if any forms use this ministry
    const formsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM ministry_forms WHERE ministry_id = $1',
      [ministryId]
    );

    if (parseInt(formsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete ministry with existing forms. Deactivate it instead.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM ministries WHERE id = $1 RETURNING name',
      [ministryId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ministry not found' });
    }

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'ministry_deleted', `Deleted ministry: ${result.rows[0].name}`]
    );

    res.json({ message: 'Ministry deleted successfully' });

  } catch (error) {
    console.error('Delete ministry error:', error);
    res.status(500).json({ error: 'Server error deleting ministry' });
  }
});

// ============================================
// EVENT TYPES MANAGEMENT
// ============================================

// GET /api/admin/event-types - List all event types
router.get('/event-types', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM event_types ORDER BY name'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get event types error:', error);
    res.status(500).json({ error: 'Server error fetching event types' });
  }
});

// POST /api/admin/event-types - Create new event type
router.post('/event-types', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Event type name is required' });
    }

    const result = await pool.query(
      `INSERT INTO event_types (name, description)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), description || null]
    );

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'event_type_created', `Created event type: ${name}`]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Event type already exists' });
    }
    console.error('Create event type error:', error);
    res.status(500).json({ error: 'Server error creating event type' });
  }
});

// PUT /api/admin/event-types/:id - Update event type
router.put('/event-types/:id', async (req, res) => {
  try {
    const eventTypeId = parseInt(req.params.id);
    const { name, description, active } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Event type name is required' });
    }

    const result = await pool.query(
      `UPDATE event_types 
       SET name = $1,
           description = $2,
           active = $3
       WHERE id = $4
       RETURNING *`,
      [
        name.trim(),
        description || null,
        active !== undefined ? active : true,
        eventTypeId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'event_type_updated', `Updated event type: ${name}`]
    );

    res.json(result.rows[0]);

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Event type name already exists' });
    }
    console.error('Update event type error:', error);
    res.status(500).json({ error: 'Server error updating event type' });
  }
});

// DELETE /api/admin/event-types/:id - Delete event type
router.delete('/event-types/:id', async (req, res) => {
  try {
    const eventTypeId = parseInt(req.params.id);

    // Check if any events use this type
    const eventsCheck = await pool.query(
      'SELECT COUNT(*) as count FROM events WHERE event_type = (SELECT name FROM event_types WHERE id = $1)',
      [eventTypeId]
    );

    if (parseInt(eventsCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete event type in use. Deactivate it instead.' 
      });
    }

    const result = await pool.query(
      'DELETE FROM event_types WHERE id = $1 RETURNING name',
      [eventTypeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event type not found' });
    }

    // Log audit
    await pool.query(
      'INSERT INTO audit_log (user_id, action, details) VALUES ($1, $2, $3)',
      [req.user.id, 'event_type_deleted', `Deleted event type: ${result.rows[0].name}`]
    );

    res.json({ message: 'Event type deleted successfully' });

  } catch (error) {
    console.error('Delete event type error:', error);
    res.status(500).json({ error: 'Server error deleting event type' });
  }
});

// ============================================
// GET PILLAR LIST (for dropdowns)
// ============================================
router.get('/pillars', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email 
       FROM users 
       WHERE role = 'pillar' AND active = true
       ORDER BY name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get pillars error:', error);
    res.status(500).json({ error: 'Server error fetching pillars' });
  }
});

module.exports = { router, initializeRouter };
