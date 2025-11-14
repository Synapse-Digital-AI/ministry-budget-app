// server/middleware/validation.js
// Validation and permission checking middleware for forms

/**
 * Check if a user can edit a form
 * @param {Pool} pool - Database connection pool
 * @param {number} userId - User ID
 * @param {string} role - User role
 * @param {number} formId - Form ID
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
const canEditForm = async (pool, userId, role, formId) => {
  try {
    // Admins can edit any form
    if (role === 'admin') {
      return { allowed: true };
    }

    // Get form details
    const formResult = await pool.query(
      'SELECT ministry_leader_id, status FROM ministry_forms WHERE id = $1',
      [formId]
    );

    if (formResult.rows.length === 0) {
      return { allowed: false, reason: 'Form not found' };
    }

    const form = formResult.rows[0];

    // Ministry leaders can only edit their own forms
    if (role === 'ministry_leader') {
      if (form.ministry_leader_id !== userId) {
        return { allowed: false, reason: 'You can only edit your own forms' };
      }
      // Can only edit drafts
      if (form.status !== 'draft') {
        return { allowed: false, reason: 'You can only edit draft forms' };
      }
      return { allowed: true };
    }

    // Pillars and pastors cannot edit forms
    return { allowed: false, reason: 'You do not have permission to edit forms' };

  } catch (error) {
    console.error('canEditForm error:', error);
    return { allowed: false, reason: 'Error checking edit permissions' };
  }
};

/**
 * Check if a role can approve a form
 * @param {Pool} pool - Database connection pool
 * @param {string} role - User role
 * @param {number} formId - Form ID
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
const canApproveForm = async (pool, role, formId) => {
  try {
    // Admins can approve any form
    if (role === 'admin') {
      return { allowed: true };
    }

    // Get form status
    const formResult = await pool.query(
      'SELECT status FROM ministry_forms WHERE id = $1',
      [formId]
    );

    if (formResult.rows.length === 0) {
      return { allowed: false, reason: 'Form not found' };
    }

    const { status } = formResult.rows[0];

    // Pillars can approve forms pending pillar approval
    if (role === 'pillar') {
      if (status === 'pending_pillar') {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Form is not pending pillar approval' };
    }

    // Pastors can approve forms pending pastor approval
    if (role === 'pastor') {
      if (status === 'pending_pastor') {
        return { allowed: true };
      }
      return { allowed: false, reason: 'Form is not pending pastor approval' };
    }

    return { allowed: false, reason: 'You do not have permission to approve forms' };

  } catch (error) {
    console.error('canApproveForm error:', error);
    return { allowed: false, reason: 'Error checking approval permissions' };
  }
};

/**
 * Generate a unique form number in format TVC-YYYY-NNNN
 * @param {Pool} pool - Database connection pool
 * @returns {Promise<string>} Form number
 */
const generateFormNumber = async (pool) => {
  try {
    const year = new Date().getFullYear();
    const prefix = `TVC-${year}-`;

    // Get the highest form number for this year
    const result = await pool.query(
      `SELECT form_number 
       FROM ministry_forms 
       WHERE form_number LIKE $1 
       ORDER BY form_number DESC 
       LIMIT 1`,
      [`${prefix}%`]
    );

    let sequence = 1;

    if (result.rows.length > 0) {
      // Extract the sequence number from the last form number
      const lastNumber = result.rows[0].form_number;
      const lastSequence = parseInt(lastNumber.split('-')[2]);
      sequence = lastSequence + 1;
    }

    // Format with leading zeros (4 digits)
    const formNumber = `${prefix}${sequence.toString().padStart(4, '0')}`;

    return formNumber;

  } catch (error) {
    console.error('generateFormNumber error:', error);
    throw new Error('Failed to generate form number');
  }
};

/**
 * Middleware to validate approval request body
 */
const validateApproval = (req, res, next) => {
  const { action } = req.body;

  if (!action) {
    return res.status(400).json({ error: 'Action is required (approve or reject)' });
  }

  if (action !== 'approve' && action !== 'reject') {
    return res.status(400).json({ error: 'Action must be either "approve" or "reject"' });
  }

  // Signature is optional for approve, comments optional for both
  next();
};

/**
 * Validate form creation request (currently not used but exported for future use)
 */
const validateFormCreation = (req, res, next) => {
  const { ministry_id } = req.body;

  if (!ministry_id) {
    return res.status(400).json({ error: 'Ministry ID is required' });
  }

  next();
};

module.exports = {
  canEditForm,
  canApproveForm,
  generateFormNumber,
  validateApproval,
  validateFormCreation
};

