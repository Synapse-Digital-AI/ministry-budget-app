-- Quick fix for missing admin panel tables
-- Run this file in your PostgreSQL database

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

CREATE INDEX IF NOT EXISTS idx_ministries_pillar ON ministries(pillar_id);

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
-- 3. Seed Ministries
-- ============================================
DO $$
DECLARE
    pillar1_id INTEGER;
    pillar2_id INTEGER;
BEGIN
    SELECT id INTO pillar1_id FROM users WHERE email = 'pillar1@thevoicechurch.org' LIMIT 1;
    SELECT id INTO pillar2_id FROM users WHERE email = 'pillar2@thevoicechurch.org' LIMIT 1;

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
-- 4. Seed Event Types
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
-- 5. Add ministry_id to ministry_forms if needed
-- ============================================
ALTER TABLE ministry_forms 
    ADD COLUMN IF NOT EXISTS ministry_id INTEGER REFERENCES ministries(id);

CREATE INDEX IF NOT EXISTS idx_forms_ministry_id ON ministry_forms(ministry_id);

-- ============================================
-- 6. Add triggers
-- ============================================
DROP TRIGGER IF EXISTS update_ministries_updated_at ON ministries;
CREATE TRIGGER update_ministries_updated_at 
    BEFORE UPDATE ON ministries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success!
SELECT 
    (SELECT COUNT(*) FROM ministries) as "Ministries Created",
    (SELECT COUNT(*) FROM event_types) as "Event Types Created";

