# 🎯 Phase 2.5 Setup Instructions

## What's New in Phase 2.5

Phase 2.5 adds **ministry management**, **event type management**, and **pillar-based routing** to your system.

**Key Features:**
- ✅ **Ministries Table**: Dynamic list of ministries with pillar assignments
- ✅ **Event Types Table**: Admin-managed event types
- ✅ **Smart Routing**: Forms route to the specific pillar assigned to that ministry
- ✅ **Admin Management**: Full CRUD for ministries and event types
- ✅ **LOV Endpoints**: Dropdown lists for frontend
- ✅ **Church Logo**: Ready for frontend integration

---

## 📁 File Structure for Phase 2.5

Add these new files to your existing project:

```
ministry-budget-app/
├── server/
│   ├── server.js              ← REPLACE with server_phase2.5.js
│   ├── middleware/
│   │   └── validation.js      (Already exists from Phase 2)
│   └── routes/
│       ├── forms.js           ← REPLACE with forms_phase2.5.js
│       ├── events.js          (Already exists from Phase 2)
│       ├── goals.js           (Already exists from Phase 2)
│       ├── admin.js           ← NEW FILE
│       └── lov.js             ← NEW FILE
├── database/
│   ├── schema.sql             (Already exists from Phase 1)
│   └── migration_phase2.5.sql ← NEW FILE
├── public/
│   └── assets/
│       └── ChurchLogo.png     ← NEW FILE
└── PHASE2.5_SETUP.md          ← This file
```

---

## 📥 Installation Steps

### Step 1: Backup Current Database (IMPORTANT!)

```bash
# Create a backup before migration
pg_dump -U postgres ministry_budget > backup_before_phase2.5.sql
```

### Step 2: Create Public Assets Folder

```bash
mkdir -p public/assets
```

### Step 3: Download and Place Files

Download these files from Claude.ai:

1. **migration_phase2.5.sql** → Place in `database/`
2. **server_phase2.5.js** → Rename to `server/server.js` (replace existing)
3. **forms_phase2.5.js** → Rename to `server/routes/forms.js` (replace existing)
4. **admin.js** → Place in `server/routes/`
5. **lov.js** → Place in `server/routes/`
6. **ChurchLogo.png** → Place in `public/assets/`

### Step 4: Run Database Migration

```bash
psql -U postgres -d ministry_budget -f database/migration_phase2.5.sql
```

**Expected Output:**
```
NOTICE:  ✓ Phase 2.5 Migration Complete!
NOTICE:  ✓ Ministries table created
NOTICE:  ✓ Event types table created
NOTICE:  ✓ 11 ministries seeded
NOTICE:  ✓ 10 event types seeded
NOTICE:  ✓ Routing logic updated
```

### Step 5: Restart Server

```bash
npm run dev
```

**You should see:**
```
=================================
🚀 The Voice Church - Ministry Budget API
✓ Server running on port 3001
✓ Database connected successfully
✓ Phase 2.5: Ministry Management & Pillar Routing
=================================
```

---

## 🧪 Test Phase 2.5 Features

### Test 1: Health Check (Verify Version)

```bash
curl http://localhost:3001/health
```

**Expected:**
```json
{
  "status": "ok",
  "version": "2.5"
}
```

### Test 2: Get Ministries List (LOV)

```bash
TOKEN="your-jwt-token"

curl http://localhost:3001/api/lov/ministries \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```json
[
  {
    "id": 1,
    "name": "Audio Visual Production",
    "description": "Technical and media services"
  },
  ...
]
```

### Test 3: Get Event Types List (LOV)

```bash
curl http://localhost:3001/api/lov/event-types \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:**
```json
[
  {
    "id": 1,
    "name": "Community Service",
    "description": "Community service projects"
  },
  ...
]
```

### Test 4: Admin - View Ministries with Pillar Assignments

```bash
# Login as admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@thevoicechurch.org",
    "pin": "1234"
  }'

ADMIN_TOKEN="admin-token-from-above"

# Get ministries with pillar info
curl http://localhost:3001/api/admin/ministries \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected:**
```json
[
  {
    "id": 1,
    "name": "Music Ministry",
    "pillar_id": 3,
    "pillar_name": "Pillar Leader 1",
    "pillar_email": "pillar1@thevoicechurch.org",
    "description": "Worship and music services",
    "active": true
  },
  ...
]
```

### Test 5: Create Form with Ministry ID

```bash
# Login as ministry leader
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "worship.leader@thevoicechurch.org",
    "pin": "1234"
  }'

LEADER_TOKEN="leader-token-from-above"

# Create form (now requires ministry_id instead of ministry_name)
curl -X POST http://localhost:3001/api/forms \
  -H "Authorization: Bearer $LEADER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ministry_id": 1
  }'
```

**Expected:**
```json
{
  "id": 1,
  "form_number": "TVC-2024-0001",
  "ministry_id": 1,
  "ministry_name": "Music Ministry",
  "status": "draft"
}
```

### Test 6: Admin - Add New Ministry

```bash
curl -X POST http://localhost:3001/api/admin/ministries \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Youth Ministry",
    "pillar_id": 3,
    "description": "Youth programs and activities"
  }'
```

### Test 7: Admin - Add New Event Type

```bash
curl -X POST http://localhost:3001/api/admin/event-types \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Retreat",
    "description": "Weekend or multi-day retreats"
  }'
```

### Test 8: Pillar-Specific Routing

```bash
# Login as pillar
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pillar1@thevoicechurch.org",
    "pin": "1234"
  }'

PILLAR_TOKEN="pillar-token-from-above"

# Get forms (pillar now only sees forms from their assigned ministries)
curl http://localhost:3001/api/forms \
  -H "Authorization: Bearer $PILLAR_TOKEN"
```

---

## 📊 Database Schema Changes

### New Tables

**1. ministries**
- `id` (Primary Key)
- `name` (Unique)
- `pillar_id` (Foreign Key to users)
- `description`
- `active`
- `created_at`, `updated_at`

**2. event_types**
- `id` (Primary Key)
- `name` (Unique)
- `description`
- `active`
- `created_at`

### Updated Tables

**ministry_forms**
- Added: `ministry_id` (Foreign Key to ministries)
- Retained: `ministry_name` (for backward compatibility)

---

## 🎯 What Changed

### Form Creation
**Before (Phase 2):**
```json
{
  "ministry_name": "Music Ministry"
}
```

**After (Phase 2.5):**
```json
{
  "ministry_id": 1
}
```

### Pillar Routing
**Before:** All forms with status `pending_pillar` visible to all pillars
**After:** Pillars only see forms from ministries assigned to them

### Event Types
**Before:** Free text field
**After:** Select from admin-managed list

---

## 🔧 Admin Endpoints Added

### Ministries Management
- `GET /api/admin/ministries` - List all ministries
- `POST /api/admin/ministries` - Create ministry
- `PUT /api/admin/ministries/:id` - Update ministry
- `DELETE /api/admin/ministries/:id` - Delete ministry

### Event Types Management
- `GET /api/admin/event-types` - List all event types
- `POST /api/admin/event-types` - Create event type
- `PUT /api/admin/event-types/:id` - Update event type
- `DELETE /api/admin/event-types/:id` - Delete event type

### Helper Endpoints
- `GET /api/admin/pillars` - List all pillars (for dropdowns)

---

## 📋 LOV (List of Values) Endpoints

These are for frontend dropdowns (all authenticated users):

- `GET /api/lov/ministries` - Active ministries
- `GET /api/lov/event-types` - Active event types
- `GET /api/lov/roles` - User roles
- `GET /api/lov/statuses` - Form statuses
- `GET /api/lov/my-ministry` - Current user's ministry

---

## 🎨 Church Logo

The church logo is now available at:
- **Path:** `/public/assets/ChurchLogo.png`
- **URL:** `http://localhost:3001/assets/ChurchLogo.png`
- **Frontend:** Use in React components for branding

---

## 🐛 Troubleshooting

### Error: "relation 'ministries' does not exist"

**Solution:**
Run the migration script:
```bash
psql -U postgres -d ministry_budget -f database/migration_phase2.5.sql
```

### Error: "Cannot find module './routes/admin'"

**Solution:**
Make sure `admin.js` and `lov.js` are in `server/routes/` folder

### Error: "ministry_id is required"

**Solution:**
Update your form creation to use `ministry_id` instead of `ministry_name`

### Migration fails with "relation already exists"

**Solution:**
The migration is idempotent (safe to run multiple times). It uses `IF NOT EXISTS` clauses.

---

## ✅ Phase 2.5 Complete Checklist

- [ ] Database backup created
- [ ] `public/assets` folder created
- [ ] All 6 files downloaded and placed correctly
- [ ] Migration script run successfully
- [ ] Server starts with "Phase 2.5" message
- [ ] Health check returns version "2.5"
- [ ] `/api/lov/ministries` returns 11 ministries
- [ ] `/api/lov/event-types` returns 10 event types
- [ ] Admin can view/create/update ministries
- [ ] Admin can view/create/update event types
- [ ] Form creation uses `ministry_id`
- [ ] Pillar sees only their assigned ministries' forms
- [ ] Church logo accessible at `/assets/ChurchLogo.png`

---

## 🎯 Next: Phase 3 - React Frontend

Once Phase 2.5 is tested and working, we'll build the beautiful React frontend with:

- Dropdowns populated from LOV endpoints
- Ministry and event type selection
- Admin screens for managing ministries/event types
- Church logo on all pages
- Complete form builder

**Come back to Claude.ai and say:** "Phase 2.5 tested! Ready for React frontend!"

---

**Great work, Rajesh! You're building a production-quality system! 🚀**
