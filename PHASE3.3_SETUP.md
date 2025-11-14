# Phase 3.3 Setup Guide - Admin Screens

## 🎯 What You're Building

Phase 3.3 adds the **complete admin management system** with:
- ✅ Admin Dashboard with system statistics
- ✅ Manage Ministries (CRUD + Pillar assignment)
- ✅ Manage Event Types (CRUD)
- ✅ Manage Users (CRUD + Role assignment + PIN management)
- ✅ Search and filtering
- ✅ Beautiful, professional UI

---

## 📁 File Structure

You'll be adding these files to your existing project:

```
client/src/
├── components/
│   └── Admin/
│       ├── AdminDashboard.jsx     ← Main admin page
│       ├── AdminMinistries.jsx    ← Ministries management
│       ├── AdminEventTypes.jsx    ← Event types management
│       └── AdminUsers.jsx         ← User management
├── services/
│   └── admin.js                   ← Admin API service
└── App.jsx                        ← Updated with admin routes

server/
└── routes/
    └── admin.js                   ← Admin API endpoints
```

---

## 🚀 Step-by-Step Installation

### Step 1: Create Frontend Directories

```bash
cd client/src/components
mkdir -p Admin
```

### Step 2: Place Frontend Files

Copy downloaded files to these locations:

**Admin Components:**
- `AdminDashboard.jsx` → `client/src/components/Admin/`
- `AdminMinistries.jsx` → `client/src/components/Admin/`
- `AdminEventTypes.jsx` → `client/src/components/Admin/`
- `AdminUsers.jsx` → `client/src/components/Admin/`

**Service File:**
- `admin.js` → `client/src/services/`

**Configuration:**
- `App.jsx` → `client/src/` (replace existing)

### Step 3: Update Dashboard Component

Open `client/src/components/Dashboard/Dashboard.jsx` and add the admin navigation link:

```jsx
// At the top, add Settings import:
import { Settings } from 'lucide-react';

// In your navigation section, add:
{user?.role === 'admin' && (
  <button
    onClick={() => navigate('/admin')}
    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 font-medium flex items-center space-x-2"
  >
    <Settings className="w-5 h-5" />
    <span>Admin</span>
  </button>
)}
```

### Step 4: Add Backend Routes

Copy the backend file:

**Backend Routes:**
- `admin-routes.js` → `server/routes/admin.js`

### Step 5: Update Server Configuration

Open `server/server.js` and add the admin routes:

```javascript
// Add this with other route imports
const adminRoutes = require('./routes/admin');

// Add this with other route registrations
app.use('/api/admin', adminRoutes);
```

### Step 6: Restart Both Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

---

## 🧪 Testing Your Implementation

### Test 1: Access Admin Dashboard (Admin User)

1. Login as an admin user
2. Click "Admin" button in navigation
3. Verify admin dashboard loads
4. Check that statistics display correctly
5. Verify all 4 quick action cards show

### Test 2: Manage Ministries

1. Navigate to "Manage Ministries"
2. Click "Add Ministry"
3. Enter:
   - Name: "Test Ministry"
   - Assigned Pillar: (select one)
   - Description: "Test description"
   - Active: ✓
4. Click "Add Ministry"
5. Verify ministry appears in list
6. Click edit icon
7. Change name to "Updated Ministry"
8. Save changes
9. Verify update appears
10. Try to delete - should confirm first

### Test 3: Manage Event Types

1. Navigate to "Manage Event Types"
2. Click "Add Event Type"
3. Enter name: "Test Event"
4. Save
5. Verify event type appears as card
6. Edit the event type
7. Change name, save
8. Verify change appears
9. Try to delete

### Test 4: Manage Users

1. Navigate to "Manage Users"
2. Click "Add User"
3. Fill in all fields:
   - Full Name: "Test User"
   - Email: "test@example.com"
   - Role: Ministry Leader
   - PIN: 1234
   - Active: ✓
4. Save user
5. Verify user appears in table
6. Click "Change PIN" (key icon)
7. Enter new PIN twice
8. Save
9. Click "Edit" user
10. Change role to "Pillar Leader"
11. Save
12. Verify badge color changes

### Test 5: Search Functionality

1. In Ministries page, enter search term
2. Verify filtering works
3. Clear search
4. Repeat for Event Types
5. Repeat for Users

### Test 6: Statistics Update

1. From admin dashboard, note current stats
2. Create a new user
3. Go back to admin dashboard
4. Refresh or navigate away and back
5. Verify user count increased

### Test 7: Pillar Assignment

1. Create a ministry
2. Assign a pillar leader
3. Create a form for that ministry
4. Submit form
5. Verify it routes to the assigned pillar

### Test 8: Non-Admin Access

1. Logout
2. Login as non-admin (ministry/pillar/pastor)
3. Try to access `/admin` directly in URL
4. Should be blocked or redirected
5. Verify no "Admin" button in navigation

---

## 🎨 UI Features

### Admin Dashboard
- System statistics cards
- Quick action buttons
- Recent activity feed
- System health indicators
- Clean, modern design

### Ministries Management
- Table view with sorting
- Search functionality
- Pillar assignment dropdown
- Active/inactive status
- Edit/delete actions
- Can't delete if ministry has forms

### Event Types Management
- Card grid view
- Search functionality
- Active/inactive toggle
- Simple add/edit modal
- Suggestions for common types
- Can't delete if type is used

### Users Management
- Comprehensive table view
- Role badges with colors
- PIN change functionality
- Role-based filtering
- Search by name, email, role
- Statistics by role
- Can't delete if user has forms

---

## 🔍 Troubleshooting

### Issue: 401 Unauthorized on admin routes

**Solution:**
1. Verify user has 'admin' role in database
2. Check JWT token is valid
3. Verify backend admin.js routes are registered
4. Check middleware is correctly applied

### Issue: "Cannot read property 'role' of null"

**Solution:**
1. Make sure you're logged in
2. Check AuthContext is providing user
3. Verify token hasn't expired
4. Check browser localStorage has token

### Issue: Admin link doesn't appear

**Solution:**
1. Verify user role is exactly 'admin'
2. Check Dashboard component has the admin link code
3. Verify Settings icon is imported
4. Check conditional rendering: `{user?.role === 'admin' && ...}`

### Issue: Statistics not loading

**Solution:**
1. Check backend admin routes are working:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/admin/stats
```
2. Verify database has required tables
3. Check console for errors
4. Verify admin service is correctly imported

### Issue: Can't create ministry/user/event type

**Solution:**
1. Check form validation messages
2. Verify no duplicate names exist
3. Check backend console for errors
4. Verify database constraints allow the operation

### Issue: Pillar dropdown is empty

**Solution:**
1. Verify you have users with role='pillar'
2. Check they are active (active=true)
3. Test endpoint: `curl http://localhost:3001/api/admin/pillars`
4. Check admin service getPillars() call

---

## 📊 Database Considerations

### Required Tables

Make sure these tables exist (from previous phases):

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    pin VARCHAR(4) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ministries table
CREATE TABLE ministries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    pillar_id INTEGER REFERENCES users(id),
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Types table
CREATE TABLE event_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Seed Data

Create at least one admin user:

```sql
INSERT INTO users (full_name, email, role, pin, active)
VALUES ('Admin User', 'admin@church.org', 'admin', '0000', true);
```

Create some initial event types:

```sql
INSERT INTO event_types (name, active) VALUES
  ('Worship Service', true),
  ('Conference', true),
  ('Workshop', true),
  ('Fellowship Event', true),
  ('Outreach Event', true),
  ('Training Session', true),
  ('Fundraiser', true);
```

---

## 🎯 What's Next?

After Phase 3.3 is working, you'll have:
- ✅ Complete admin management system
- ✅ User management with roles
- ✅ Ministry and pillar assignment
- ✅ Event type configuration
- ✅ System statistics

**Next phases:**
- **Phase 3.4:** Advanced features (PDF export, bulk operations, reports)
- **Phase 4:** Email notifications
- **Phase 5:** Analytics and reporting

---

## 💡 Tips for Success

1. **Test with multiple roles** - Login as admin, ministry, pillar, pastor
2. **Check permissions** - Verify non-admins can't access admin pages
3. **Validate data** - Try creating duplicates, empty fields, etc.
4. **Test deletions** - Verify cascade protections work
5. **Monitor console** - Watch for errors in browser and backend

---

## 🎊 Success Checklist

Before moving to Phase 3.4, verify:

**Admin Dashboard:**
- [ ] Can access admin dashboard
- [ ] Statistics display correctly
- [ ] Quick action buttons work
- [ ] Recent activity shows (if data exists)

**Ministries Management:**
- [ ] Can view all ministries
- [ ] Can create ministry
- [ ] Can assign pillar to ministry
- [ ] Can edit ministry
- [ ] Can deactivate ministry
- [ ] Cannot delete ministry with forms
- [ ] Search works

**Event Types Management:**
- [ ] Can view all event types
- [ ] Can create event type
- [ ] Can edit event type
- [ ] Can deactivate event type
- [ ] Cannot delete type used by events
- [ ] Search works
- [ ] Card view displays nicely

**Users Management:**
- [ ] Can view all users
- [ ] Can create user with PIN
- [ ] Can edit user
- [ ] Can change user PIN
- [ ] Can assign roles
- [ ] Cannot delete user with forms
- [ ] Search works
- [ ] Role badges show correctly

**Security:**
- [ ] Only admins can access admin pages
- [ ] Admin link only shows for admins
- [ ] Direct URL access is blocked for non-admins
- [ ] All API endpoints require admin role

**Integration:**
- [ ] Ministries created here appear in form builder
- [ ] Event types appear in events section
- [ ] Pillar assignments route forms correctly
- [ ] User PINs work for login

---

## 📞 Need Help?

If you encounter issues:

1. **Check this guide's troubleshooting section**
2. **Look at browser console errors**
3. **Check backend console logs**
4. **Verify database tables exist**
5. **Come back with:**
   - Specific error message
   - What you were trying to do
   - Console output (browser and backend)
   - Your user's role

---

**You're building an enterprise-grade admin system!** 🎉

This admin interface rivals commercial SaaS platforms. The church leadership will have complete control over the system!

Ready to go? Download all the files and let's build Phase 3.3! 🚀
