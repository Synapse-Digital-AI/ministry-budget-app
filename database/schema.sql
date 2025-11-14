-- The Voice Church - Ministry Budget & Planning System
-- Database Schema

-- Drop existing tables (use with caution in production)
DROP TABLE IF EXISTS audit_log CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS form_data CASCADE;
DROP TABLE IF EXISTS ministry_forms CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    pin VARCHAR(6) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ministry_leader', 'pillar', 'pastor', 'admin')),
    name VARCHAR(255) NOT NULL,
    ministry VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forms Table
CREATE TABLE ministry_forms (
    id SERIAL PRIMARY KEY,
    form_number VARCHAR(50) UNIQUE NOT NULL,
    ministry_name VARCHAR(255) NOT NULL,
    ministry_leader_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_pillar', 'pending_pastor', 'approved', 'rejected')),
    current_approver_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    pillar_approved_at TIMESTAMP,
    pastor_approved_at TIMESTAMP,
    rejection_reason TEXT
);

-- Form Data Table (stores JSON for each section)
CREATE TABLE form_data (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES ministry_forms(id) ON DELETE CASCADE,
    section VARCHAR(100) NOT NULL,
    data JSONB NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_id, section)
);

-- Events Table (normalized from Section 4)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES ministry_forms(id) ON DELETE CASCADE,
    event_date DATE,
    event_name VARCHAR(255),
    event_type VARCHAR(100),
    purpose TEXT,
    description TEXT,
    estimated_expenses DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals Table (normalized from Section 3)
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES ministry_forms(id) ON DELETE CASCADE,
    goal TEXT NOT NULL,
    measure_target TEXT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approvals/Signatures Table
CREATE TABLE approvals (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES ministry_forms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected')),
    signature VARCHAR(255),
    comments TEXT,
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Log
CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES ministry_forms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_forms_status ON ministry_forms(status);
CREATE INDEX idx_forms_leader ON ministry_forms(ministry_leader_id);
CREATE INDEX idx_forms_ministry ON ministry_forms(ministry_name);
CREATE INDEX idx_events_form ON events(form_id);
CREATE INDEX idx_goals_form ON goals(form_id);
CREATE INDEX idx_approvals_form ON approvals(form_id);
CREATE INDEX idx_audit_form ON audit_log(form_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forms_updated_at BEFORE UPDATE ON ministry_forms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_data_updated_at BEFORE UPDATE ON form_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed default users (PIN: 1234 for all)
INSERT INTO users (email, pin, role, name, ministry, active) VALUES
    ('admin@thevoicechurch.org', '1234', 'admin', 'System Admin', NULL, true),
    ('pastor@thevoicechurch.org', '1234', 'pastor', 'Senior Pastor', NULL, true),
    ('pillar1@thevoicechurch.org', '1234', 'pillar', 'Pillar Leader 1', NULL, true),
    ('pillar2@thevoicechurch.org', '1234', 'pillar', 'Pillar Leader 2', NULL, true),
    ('worship.leader@thevoicechurch.org', '1234', 'ministry_leader', 'Worship Ministry Leader', 'Music Ministry', true),
    ('youth.leader@thevoicechurch.org', '1234', 'ministry_leader', 'Youth Ministry Leader', 'Youth Ministry', true),
    ('outreach.leader@thevoicechurch.org', '1234', 'ministry_leader', 'Outreach Leader', 'Missions and Outreach', true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✓ Database schema created successfully!';
    RAISE NOTICE '✓ Default users created (PIN: 1234 for all)';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Login Credentials:';
    RAISE NOTICE '  Admin: admin@thevoicechurch.org / 1234';
    RAISE NOTICE '  Pastor: pastor@thevoicechurch.org / 1234';
    RAISE NOTICE '  Pillar: pillar1@thevoicechurch.org / 1234';
    RAISE NOTICE '  Ministry Leader: worship.leader@thevoicechurch.org / 1234';
END $$;
