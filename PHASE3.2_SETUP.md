# Phase 3.2 Setup Guide - Form Builder

## 🎯 What You're Building

Phase 3.2 adds the **complete 9-section form builder** with:
- ✅ Form creation with ministry dropdown
- ✅ All 9 sections from the PDF
- ✅ Events management (add/edit/delete + budget calc)
- ✅ Goals management (add/edit/delete, max 5)
- ✅ Progress tracker & navigation
- ✅ Auto-save drafts
- ✅ Submit for approval
- ✅ Approval/rejection interface
- ✅ Form view (read-only)

---

## 📁 File Structure

You'll be adding these files to your existing project:

```
client/src/
├── components/
│   └── Forms/
│       ├── FormCreate.jsx         ← Create new form
│       ├── FormBuilder.jsx        ← Main form builder
│       ├── FormView.jsx           ← Read-only view
│       ├── FormApproval.jsx       ← Approval interface
│       └── sections/
│           ├── FormSection1.jsx   ← Ministry Information
│           ├── FormSection2.jsx   ← Mission & Vision
│           ├── FormSection3.jsx   ← Programs & Activities
│           ├── FormSection4.jsx   ← Events (with CRUD)
│           ├── FormSection5.jsx   ← Goals (with CRUD)
│           ├── FormSection6.jsx   ← Resources Needed
│           ├── FormSection7.jsx   ← Budget Summary
│           ├── FormSection8.jsx   ← Challenges & Opportunities
│           └── FormSection9.jsx   ← Additional Information
└── App.jsx                        ← Updated with new routes
```

---

## 🚀 Step-by-Step Installation

### Step 1: Create Directories

```bash
cd client/src/components
mkdir -p Forms/sections
```

### Step 2: Place Downloaded Files

Copy all downloaded files to their correct locations:

**Main Form Components:**
- `FormCreate.jsx` → `client/src/components/Forms/`
- `FormBuilder.jsx` → `client/src/components/Forms/`
- `FormView.jsx` → `client/src/components/Forms/`
- `FormApproval.jsx` → `client/src/components/Forms/`

**Section Components:**
- All `FormSection*.jsx` files → `client/src/components/Forms/sections/`

### Step 3: Update App.jsx Routes

Add these new routes to your `App.jsx`:

```jsx
// At the top with other imports
import FormCreate from './components/Forms/FormCreate';
import FormBuilder from './components/Forms/FormBuilder';
import FormView from './components/Forms/FormView';
import FormApproval from './components/Forms/FormApproval';

// Inside your Routes component, add these routes:
<Route
  path="/forms/create"
  element={
    <ProtectedRoute allowedRoles={['ministry']}>
      <FormCreate />
    </ProtectedRoute>
  }
/>
<Route
  path="/forms/:id/edit"
  element={
    <ProtectedRoute allowedRoles={['ministry']}>
      <FormBuilder />
    </ProtectedRoute>
  }
/>
<Route
  path="/forms/:id/view"
  element={
    <ProtectedRoute>
      <FormView />
    </ProtectedRoute>
  }
/>
<Route
  path="/forms/:id/approve"
  element={
    <ProtectedRoute allowedRoles={['pillar', 'pastor', 'admin']}>
      <FormApproval />
    </ProtectedRoute>
  }
/>
```

### Step 4: Update Dashboard Navigation

In your `Dashboard.jsx`, update the "Create New Form" button to navigate to the new form creation page:

```jsx
// Replace the existing button with:
<button
  onClick={() => navigate('/forms/create')}
  className="px-6 py-3 bg-church-primary text-white rounded-lg hover:bg-church-secondary font-medium flex items-center space-x-2"
>
  <Plus className="w-5 h-5" />
  <span>Create New Form</span>
</button>
```

### Step 5: Update Forms Table Actions

In your Dashboard's forms table, update the action buttons:

```jsx
// For draft forms (ministry can edit):
<button
  onClick={() => navigate(`/forms/${form.id}/edit`)}
  className="text-blue-600 hover:text-blue-800"
>
  Edit
</button>

// For viewing any form:
<button
  onClick={() => navigate(`/forms/${form.id}/view`)}
  className="text-gray-600 hover:text-gray-800"
>
  View
</button>

// For forms pending approval (pillar/pastor):
<button
  onClick={() => navigate(`/forms/${form.id}/approve`)}
  className="text-green-600 hover:text-green-800"
>
  Review
</button>
```

### Step 6: Restart Development Server

```bash
cd client
npm run dev
```

---

## 🧪 Testing Your Implementation

### Test 1: Create a New Form (Ministry User)

1. Login as a ministry user
2. Click "Create New Form"
3. Select your ministry from dropdown
4. Click "Start Form"
5. Verify you're taken to the form builder

### Test 2: Fill Out Form Sections

1. Complete Section 1 (Ministry Information)
2. Navigate through all 9 sections using section buttons
3. Watch progress bar increase as you complete sections
4. Verify auto-save works (check for "Form saved" message)
5. Click "Save Draft" to manually save

### Test 3: Add Events

1. Navigate to Section 4 (Events)
2. Click "Add Event"
3. Fill in event details with budget
4. Save event
5. Add 2-3 more events
6. Verify total budget calculates correctly
7. Edit an event
8. Delete an event

### Test 4: Add Goals

1. Navigate to Section 5 (Goals)
2. Click "Add Goal"
3. Fill in all SMART goal fields
4. Save goal
5. Add at least 3 goals total (minimum required)
6. Try adding 6th goal (should be prevented - max 5)
7. Edit a goal
8. Try deleting a goal when you have exactly 3 (should warn)

### Test 5: Budget Summary

1. Navigate to Section 7 (Budget Summary)
2. Verify events budget auto-populates from Section 4
3. Enter operating budget
4. Enter capital expenses
5. Verify total budget calculates correctly
6. Complete budget justification

### Test 6: Submit Form

1. Navigate to Section 9 (last section)
2. Try submitting with <80% completion (should be blocked)
3. Complete all required sections
4. Click "Submit for Approval"
5. Confirm submission
6. Verify redirect to dashboard
7. Verify status changed to "Pending Pillar Approval"

### Test 7: View Form (Any User)

1. Login as any user
2. Click "View" on a form
3. Verify all sections display correctly
4. Verify events and goals show
5. Verify budget calculations display
6. Verify status badge shows

### Test 8: Approve Form (Pillar User)

1. Login as a pillar user
2. Click "Review" on pending form
3. Review form summary
4. Click "View Full Form" to see details
5. Add approval comments (optional)
6. Click "Approve Form"
7. Verify status changes to "Pending Pastor Approval"

### Test 9: Reject Form (Pillar/Pastor)

1. Login as pillar or pastor
2. Click "Review" on pending form
3. Click "Reject Form"
4. Enter rejection reason
5. Confirm rejection
6. Verify ministry leader sees rejection

### Test 10: Final Approval (Pastor)

1. Login as pastor user
2. Review form with "Pending Pastor Approval"
3. Approve the form
4. Verify status changes to "Approved"

---

## 🎨 UI Features

### Progress Tracking
- Visual progress bar shows completion percentage
- Section navigation shows completed sections in green
- Current section highlighted in primary color
- Minimum 80% completion required to submit

### Auto-Save
- Form auto-saves after 2 seconds of inactivity
- Manual save button available
- Silent saves don't show messages (auto)
- Manual saves show success confirmation

### Validation
- Required fields marked with red asterisk
- Events require all fields filled
- Goals require 3-5 goals (enforced)
- Budget fields validate numbers
- Email fields validate format

### Mobile Responsive
- All sections work on mobile
- Section navigation scrolls horizontally
- Modals adapt to screen size
- Touch-friendly buttons and inputs

---

## 🔍 Troubleshooting

### Issue: "Module not found" error

**Solution:**
```bash
# Make sure all files are in correct locations
ls client/src/components/Forms/
ls client/src/components/Forms/sections/
```

### Issue: Form not saving

**Solution:**
1. Check browser console for errors
2. Verify backend is running on port 3001
3. Check network tab in DevTools
4. Verify JWT token is valid (not expired)

### Issue: Events/Goals not loading

**Solution:**
1. Check that formId is correctly passed to components
2. Verify API endpoints are working:
```bash
# Test events API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/forms/1/events

# Test goals API
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/forms/1/goals
```

### Issue: Can't add events/goals

**Solution:**
1. Check that LOV data exists:
```bash
# Check ministries
curl http://localhost:3001/api/lov/ministries

# Check event types
curl http://localhost:3001/api/lov/event-types
```
2. If empty, seed the LOV data in your database

### Issue: Form submission fails

**Solution:**
1. Verify form has at least 3 goals
2. Check that required sections are complete
3. Verify user has correct role (ministry)
4. Check backend logs for detailed error

### Issue: Approval not working

**Solution:**
1. Verify user role (pillar or pastor)
2. Check form status matches approval level
3. Verify form is assigned to correct pillar
4. Check approval API endpoint

---

## 📊 Database Considerations

### Ensure Tables Exist

Your backend should have these tables from Phase 2:
- `forms` - Main form table
- `events` - Events linked to forms
- `goals` - Goals linked to forms

### Verify Seed Data

Make sure LOV tables have data:

```sql
-- Check ministries
SELECT * FROM ministries;

-- Check event types
SELECT * FROM event_types;
```

If empty, run seed scripts or manually insert:

```sql
-- Example: Insert event types
INSERT INTO event_types (name) VALUES
  ('Worship Service'),
  ('Conference'),
  ('Workshop'),
  ('Fellowship Event'),
  ('Outreach Event'),
  ('Training Session'),
  ('Fundraiser'),
  ('Prayer Service');
```

---

## 🎯 What's Next?

After Phase 3.2 is working, you'll have:
- ✅ Complete form builder with all 9 sections
- ✅ Events and goals management
- ✅ Approval workflow UI
- ✅ Form viewing for all users

**Next phases:**
- **Phase 3.3:** Admin screens (manage ministries, event types, users)
- **Phase 3.4:** Advanced features (PDF export, search, filters)
- **Phase 4:** Email notifications
- **Phase 5:** Reports and analytics

---

## 💡 Tips for Success

1. **Test incrementally** - Test each feature as you build
2. **Check console** - Browser console shows helpful errors
3. **Use DevTools** - Network tab shows API calls
4. **Save often** - Git commit after each working feature
5. **Ask for help** - Come back with specific error messages

---

## 🎊 Success Checklist

Before moving to Phase 3.3, verify:

- [ ] Can create new form from dashboard
- [ ] Can navigate through all 9 sections
- [ ] Progress bar updates correctly
- [ ] Auto-save works
- [ ] Manual save works
- [ ] Can add/edit/delete events
- [ ] Events budget calculates correctly
- [ ] Can add/edit/delete goals
- [ ] Min 3, max 5 goals enforced
- [ ] Budget summary shows correct totals
- [ ] Can submit form (draft → pending_pillar)
- [ ] Pillar can approve (pending_pillar → pending_pastor)
- [ ] Pastor can approve (pending_pastor → approved)
- [ ] Can reject form with reason
- [ ] Read-only view works for all users
- [ ] Form shows correct status badges
- [ ] Mobile responsive on all screens

---

## 📞 Need Help?

If you encounter issues:

1. **Check this guide's troubleshooting section**
2. **Look at browser console errors**
3. **Verify backend is running and connected**
4. **Come back with:**
   - Specific error message
   - What you were trying to do
   - Browser console output
   - Network tab showing failed requests

---

**You're building something amazing! The church will love this comprehensive system!** 🎉

Ready to go? Download all the files and let's build Phase 3.2! 🚀
