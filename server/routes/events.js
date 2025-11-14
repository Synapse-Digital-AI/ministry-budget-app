// server/routes/events.js
// Events management routes for forms

const express = require('express');
const router = express.Router();
const { canEditForm } = require('../middleware/validation');

// Initialize with pool from server.js
let pool;
const initializeRouter = (dbPool) => {
  pool = dbPool;
};

// ============================================
// GET /api/forms/:formId/events - Get all events for a form
// ============================================
router.get('/:formId/events', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    const { role, id: userId } = req.user;

    // Verify form exists and user has permission to view
    const formCheck = await pool.query(
      'SELECT ministry_leader_id, status FROM ministry_forms WHERE id = $1',
      [formId]
    );

    if (formCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const form = formCheck.rows[0];

    // Check permissions
    if (role === 'ministry_leader' && form.ministry_leader_id !== userId) {
      return res.status(403).json({ error: 'You can only view events for your own forms' });
    }

    const result = await pool.query(
      'SELECT * FROM events WHERE form_id = $1 ORDER BY event_date',
      [formId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Server error fetching events' });
  }
});

// ============================================
// POST /api/forms/:formId/events - Create new event
// ============================================
router.post('/:formId/events', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    const { id: userId, role } = req.user;
    const { event_date, event_name, event_type, purpose, description, estimated_expenses, notes } = req.body;

    // Check if user can edit this form
    const editCheck = await canEditForm(pool, userId, role, formId);
    if (!editCheck.allowed) {
      return res.status(403).json({ error: editCheck.reason });
    }

    const result = await pool.query(
      `INSERT INTO events (form_id, event_date, event_name, event_type, purpose, description, estimated_expenses, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [formId, event_date || null, event_name || null, event_type || null, purpose || null, description || null, estimated_expenses || 0, notes || null]
    );

    await pool.query(
      'INSERT INTO audit_log (form_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [formId, userId, 'event_created', `Created event: ${event_name || 'Untitled'}`]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Server error creating event' });
  }
});

// ============================================
// PUT /api/forms/:formId/events/:id - Update event
// ============================================
router.put('/:formId/events/:id', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    const eventId = parseInt(req.params.id);
    const { id: userId, role } = req.user;
    const { event_date, event_name, event_type, purpose, description, estimated_expenses, notes } = req.body;

    // Check if user can edit this form
    const editCheck = await canEditForm(pool, userId, role, formId);
    if (!editCheck.allowed) {
      return res.status(403).json({ error: editCheck.reason });
    }

    // Verify event belongs to this form
    const eventCheck = await pool.query(
      'SELECT id FROM events WHERE id = $1 AND form_id = $2',
      [eventId, formId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const result = await pool.query(
      `UPDATE events 
       SET event_date = $1, event_name = $2, event_type = $3, purpose = $4, 
           description = $5, estimated_expenses = $6, notes = $7
       WHERE id = $8 AND form_id = $9
       RETURNING *`,
      [event_date || null, event_name || null, event_type || null, purpose || null, description || null, estimated_expenses || 0, notes || null, eventId, formId]
    );

    await pool.query(
      'INSERT INTO audit_log (form_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [formId, userId, 'event_updated', `Updated event: ${event_name || 'Untitled'}`]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Server error updating event' });
  }
});

// ============================================
// DELETE /api/forms/:formId/events/:id - Delete event
// ============================================
router.delete('/:formId/events/:id', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    const eventId = parseInt(req.params.id);
    const { id: userId, role } = req.user;

    // Check if user can edit this form
    const editCheck = await canEditForm(pool, userId, role, formId);
    if (!editCheck.allowed) {
      return res.status(403).json({ error: editCheck.reason });
    }

    // Verify event belongs to this form
    const eventCheck = await pool.query(
      'SELECT id, event_name FROM events WHERE id = $1 AND form_id = $2',
      [eventId, formId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await pool.query(
      'DELETE FROM events WHERE id = $1 AND form_id = $2',
      [eventId, formId]
    );

    await pool.query(
      'INSERT INTO audit_log (form_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [formId, userId, 'event_deleted', `Deleted event: ${eventCheck.rows[0].event_name || 'Untitled'}`]
    );

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Server error deleting event' });
  }
});

module.exports = { router, initializeRouter };

