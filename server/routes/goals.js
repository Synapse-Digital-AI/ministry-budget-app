// server/routes/goals.js
// Goals management routes for forms

const express = require('express');
const router = express.Router();
const { canEditForm } = require('../middleware/validation');

// Initialize with pool from server.js
let pool;
const initializeRouter = (dbPool) => {
  pool = dbPool;
};

// ============================================
// GET /api/forms/:formId/goals - Get all goals for a form
// ============================================
router.get('/:formId/goals', async (req, res) => {
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
      return res.status(403).json({ error: 'You can only view goals for your own forms' });
    }

    const result = await pool.query(
      'SELECT * FROM goals WHERE form_id = $1 ORDER BY created_at',
      [formId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Server error fetching goals' });
  }
});

// ============================================
// POST /api/forms/:formId/goals - Create new goal
// ============================================
router.post('/:formId/goals', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    const { id: userId, role } = req.user;
    const { goal, measure_target, due_date } = req.body;

    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    // Check if user can edit this form
    const editCheck = await canEditForm(pool, userId, role, formId);
    if (!editCheck.allowed) {
      return res.status(403).json({ error: editCheck.reason });
    }

    const result = await pool.query(
      `INSERT INTO goals (form_id, goal, measure_target, due_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [formId, goal, measure_target || null, due_date || null]
    );

    await pool.query(
      'INSERT INTO audit_log (form_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [formId, userId, 'goal_created', `Created goal: ${goal.substring(0, 50)}...`]
    );

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Server error creating goal' });
  }
});

// ============================================
// PUT /api/forms/:formId/goals/:id - Update goal
// ============================================
router.put('/:formId/goals/:id', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    const goalId = parseInt(req.params.id);
    const { id: userId, role } = req.user;
    const { goal, measure_target, due_date } = req.body;

    if (!goal) {
      return res.status(400).json({ error: 'Goal is required' });
    }

    // Check if user can edit this form
    const editCheck = await canEditForm(pool, userId, role, formId);
    if (!editCheck.allowed) {
      return res.status(403).json({ error: editCheck.reason });
    }

    // Verify goal belongs to this form
    const goalCheck = await pool.query(
      'SELECT id FROM goals WHERE id = $1 AND form_id = $2',
      [goalId, formId]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const result = await pool.query(
      `UPDATE goals 
       SET goal = $1, measure_target = $2, due_date = $3
       WHERE id = $4 AND form_id = $5
       RETURNING *`,
      [goal, measure_target || null, due_date || null, goalId, formId]
    );

    await pool.query(
      'INSERT INTO audit_log (form_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [formId, userId, 'goal_updated', `Updated goal: ${goal.substring(0, 50)}...`]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Server error updating goal' });
  }
});

// ============================================
// DELETE /api/forms/:formId/goals/:id - Delete goal
// ============================================
router.delete('/:formId/goals/:id', async (req, res) => {
  try {
    const formId = parseInt(req.params.formId);
    const goalId = parseInt(req.params.id);
    const { id: userId, role } = req.user;

    // Check if user can edit this form
    const editCheck = await canEditForm(pool, userId, role, formId);
    if (!editCheck.allowed) {
      return res.status(403).json({ error: editCheck.reason });
    }

    // Verify goal belongs to this form
    const goalCheck = await pool.query(
      'SELECT id, goal FROM goals WHERE id = $1 AND form_id = $2',
      [goalId, formId]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    await pool.query(
      'DELETE FROM goals WHERE id = $1 AND form_id = $2',
      [goalId, formId]
    );

    await pool.query(
      'INSERT INTO audit_log (form_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [formId, userId, 'goal_deleted', `Deleted goal: ${goalCheck.rows[0].goal.substring(0, 50)}...`]
    );

    res.json({ message: 'Goal deleted successfully' });

  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Server error deleting goal' });
  }
});

module.exports = { router, initializeRouter };

