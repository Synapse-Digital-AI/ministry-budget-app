// server/routes/lov.js
// List of Values (LOV) routes - for dropdowns in frontend

const express = require('express');
const router = express.Router();

// Initialize with pool from server.js
let pool;
const initializeRouter = (dbPool) => {
  pool = dbPool;
};

// ============================================
// GET /api/lov/ministries - Active ministries list
// ============================================
router.get('/ministries', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        name,
        description
      FROM ministries
      WHERE active = true
      ORDER BY name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get ministries LOV error:', error);
    res.status(500).json({ error: 'Server error fetching ministries' });
  }
});

// ============================================
// GET /api/lov/event-types - Active event types list
// ============================================
router.get('/event-types', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        id,
        name,
        description
      FROM event_types
      WHERE active = true
      ORDER BY name`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get event types LOV error:', error);
    res.status(500).json({ error: 'Server error fetching event types' });
  }
});

// ============================================
// GET /api/lov/roles - User roles list
// ============================================
router.get('/roles', async (req, res) => {
  try {
    const roles = [
      { value: 'ministry_leader', label: 'Ministry Leader' },
      { value: 'pillar', label: 'Pillar' },
      { value: 'pastor', label: 'Pastor' },
      { value: 'admin', label: 'Administrator' }
    ];
    res.json(roles);
  } catch (error) {
    console.error('Get roles LOV error:', error);
    res.status(500).json({ error: 'Server error fetching roles' });
  }
});

// ============================================
// GET /api/lov/statuses - Form status list
// ============================================
router.get('/statuses', async (req, res) => {
  try {
    const statuses = [
      { value: 'draft', label: 'Draft', color: 'gray' },
      { value: 'pending_pillar', label: 'Pending Pillar Approval', color: 'yellow' },
      { value: 'pending_pastor', label: 'Pending Pastor Approval', color: 'orange' },
      { value: 'approved', label: 'Approved', color: 'green' },
      { value: 'rejected', label: 'Rejected', color: 'red' }
    ];
    res.json(statuses);
  } catch (error) {
    console.error('Get statuses LOV error:', error);
    res.status(500).json({ error: 'Server error fetching statuses' });
  }
});

// ============================================
// GET /api/lov/my-ministry - Get current user's ministry
// ============================================
router.get('/my-ministry', async (req, res) => {
  try {
    const { id: userId } = req.user;

    const result = await pool.query(
      `SELECT ministry FROM users WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0 || !result.rows[0].ministry) {
      return res.json({ ministry: null });
    }

    // Try to find matching ministry in ministries table
    const ministryResult = await pool.query(
      `SELECT id, name FROM ministries WHERE name = $1 AND active = true`,
      [result.rows[0].ministry]
    );

    if (ministryResult.rows.length > 0) {
      res.json(ministryResult.rows[0]);
    } else {
      res.json({ ministry: result.rows[0].ministry, id: null });
    }

  } catch (error) {
    console.error('Get my ministry error:', error);
    res.status(500).json({ error: 'Server error fetching user ministry' });
  }
});

module.exports = { router, initializeRouter };
