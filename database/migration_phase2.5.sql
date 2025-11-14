-- Phase 2.5 Database Migration
-- Adds ministries table, event_types table, and updates routing logic

-- ============================================
-- 1. Create Ministries Table
-- ============================================
CREATE TABLE IF NOT EXISTS ministries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    pillar_id INTEGER REFERENCES users(id),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for pillar lookups
CREATE INDEX idx_ministries_pillar ON ministries(pillar_id);

-- ============================================
-- 2. Create Event Types Table
-- ============================================
CREATE TABLE IF NOT EXISTS event_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Seed Ministries (from PDF)
-- ============================================
-- First, get pillar IDs
DO $$
DECLARE
    pillar1_id INTEGER;
    pillar2_id INTEGER;
BEGIN
    -- Get pillar user IDs
    SELECT id INTO pillar1_id FROM users WHERE email = 'pillar1@thevoicechurch.org';
    SELECT id INTO pillar2_id FROM users WHERE email = 'pillar2@thevoicechurch.org';

    -- Insert ministries (distribute between two pillars)
    INSERT INTO ministries (name, pillar_id, description) VALUES
        ('Music Ministry', pillar1_id, 'Worship and music services'),
        ('Women on the Rise', pillar1_id, 'Women''s ministry and empowerment'),
        ('Audio Visual Production', pillar1_id, 'Technical and media services'),
        ('Missions and Outreach', pillar2_id, 'Community outreach and missions'),
        ('Pastoral Aide', pillar2_id, 'Support for pastoral care'),
        ('TVC Events', pillar2_id, 'Church events coordination'),
        ('Ushers', pillar1_id, 'Greeting and seating ministry'),
        ('Nursing Home', pillar2_id, 'Senior care ministry'),
        ('Prison Ministry', pillar2_id, 'Prison outreach and support'),
        ('Stewards', pillar1_id, 'Church stewardship'),
        ('Virtual Ministry Aid', pillar1_id, 'Online and virtual services')
    ON CONFLICT (name) DO NOTHING;

END $$;

-- ============================================
-- 4. Seed Event Types (from PDF)
-- ============================================
INSERT INTO event_types (name, description) VALUES
    ('Worship Service', 'Regular or special worship services'),
    ('Conference', 'Multi-day conferences and seminars'),
    ('Workshop', 'Training and educational workshops'),
    ('Fellowship Event', 'Community fellowship and social events'),
    ('Outreach Event', 'Community outreach activities'),
    ('Training Session', 'Ministry training sessions'),
    ('Leadership Meeting', 'Leadership and planning meetings'),
    ('Fundraiser', 'Fundraising events'),
    ('Prayer Service', 'Prayer meetings and services'),
    ('Community Service', 'Community service projects')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 5. Add ministry_id to ministry_forms table
-- ============================================
-- Add new column (nullable initially for migration)
ALTER TABLE ministry_forms 
    ADD COLUMN IF NOT EXISTS ministry_id INTEGER REFERENCES ministries(id);

-- Create index
CREATE INDEX IF NOT EXISTS idx_forms_ministry ON ministry_forms(ministry_id);

-- ============================================
-- 6. Migrate existing data
-- ============================================
-- Match existing ministry_name text to ministries table
DO $$
DECLARE
    form_record RECORD;
    ministry_record RECORD;
BEGIN
    -- Loop through all forms
    FOR form_record IN SELECT id, ministry_name FROM ministry_forms WHERE ministry_id IS NULL LOOP
        -- Try to find matching ministry
        SELECT id INTO ministry_record FROM ministries WHERE LOWER(name) = LOWER(form_record.ministry_name) LIMIT 1;
        
        IF FOUND THEN
            -- Update form with ministry_id
            UPDATE ministry_forms SET ministry_id = ministry_record.id WHERE id = form_record.id;
        ELSE
            -- If no match, assign to first ministry (fallback)
            UPDATE ministry_forms SET ministry_id = (SELECT id FROM ministries ORDER BY id LIMIT 1) WHERE id = form_record.id;
        END IF;
    END LOOP;
END $$;

-- ============================================
-- 7. Update triggers for ministries
-- ============================================
CREATE TRIGGER update_ministries_updated_at 
    BEFORE UPDATE ON ministries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. Add helper view for form routing
-- ============================================
CREATE OR REPLACE VIEW form_routing_view AS
SELECT 
    f.id as form_id,
    f.form_number,
    f.status,
    f.ministry_leader_id,
    m.name as ministry_name,
    m.pillar_id,
    p.name as pillar_name,
    p.email as pillar_email,
    ml.name as leader_name,
    ml.email as leader_email
FROM ministry_forms f
LEFT JOIN ministries m ON f.ministry_id = m.id
LEFT JOIN users p ON m.pillar_id = p.id
LEFT JOIN users ml ON f.ministry_leader_id = ml.id;

-- ============================================
-- Success message
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '=================================';
    RAISE NOTICE '✓ Phase 2.5 Migration Complete!';
    RAISE NOTICE '✓ Ministries table created';
    RAISE NOTICE '✓ Event types table created';
    RAISE NOTICE '✓ %s ministries seeded', (SELECT COUNT(*) FROM ministries);
    RAISE NOTICE '✓ %s event types seeded', (SELECT COUNT(*) FROM event_types);
    RAISE NOTICE '✓ Routing logic updated';
    RAISE NOTICE '=================================';
END $$;

-- ============================================
-- Verification Queries (optional - comment out in production)
-- ============================================
-- Show ministries with assigned pillars
SELECT 
    m.name as ministry,
    u.name as assigned_pillar,
    u.email as pillar_email
FROM ministries m
LEFT JOIN users u ON m.pillar_id = u.id
ORDER BY m.name;

-- Show event types
SELECT name, description FROM event_types ORDER BY name;
