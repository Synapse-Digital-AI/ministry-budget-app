# Phase 3.2 Component Reference

## 📚 Component Overview

### Main Form Components

#### FormCreate.jsx
**Purpose:** Ministry selection and form initialization
**Route:** `/forms/create`
**Access:** Ministry users only
**Features:**
- Ministry dropdown selection
- Auto-select if user has only one ministry
- Form creation with auto-generated form number
- Navigates to FormBuilder after creation

**Key Props:**
- None (standalone component)

**API Calls:**
- `lovService.getMinistries()` - Load ministry options
- `formsService.createForm()` - Create new form

---

#### FormBuilder.jsx
**Purpose:** Main form building interface with all 9 sections
**Route:** `/forms/:id/edit`
**Access:** Ministry users (form creator only)
**Features:**
- Progress tracker (completion %)
- Section navigation (clickable tabs)
- Auto-save (2-second delay)
- Manual save
- Section-by-section navigation
- Submit for approval
- Validates minimum 80% completion before submit

**Key State:**
- `currentSection` - Active section (1-9)
- `formData` - All section data
- `form` - Form metadata

**API Calls:**
- `formsService.getForm()` - Load form data
- `formsService.updateForm()` - Save form (auto/manual)
- `formsService.submitForm()` - Submit for approval

---

#### FormView.jsx
**Purpose:** Read-only view of completed forms
**Route:** `/forms/:id/view`
**Access:** All authenticated users
**Features:**
- Displays all form sections
- Shows events and goals
- Displays budget summary
- Shows approval history
- Status badge
- Formatted, readable layout

**Key Props:**
- None (uses route param :id)

**API Calls:**
- `formsService.getForm()` - Load form
- `formsService.getEvents()` - Load events
- `formsService.getGoals()` - Load goals

---

#### FormApproval.jsx
**Purpose:** Approval interface for pillars and pastors
**Route:** `/forms/:id/approve`
**Access:** Pillar, Pastor, Admin
**Features:**
- Condensed form summary
- Quick stats (events, goals, members)
- Link to full form view
- Approval comments field
- Approve button (green)
- Reject button with modal
- Rejection reason required

**Key State:**
- `approvalComments` - Optional approval notes
- `rejectionReason` - Required rejection explanation
- `showRejectModal` - Controls reject modal

**API Calls:**
- `formsService.getForm()` - Load form
- `formsService.getEvents()` - Load events
- `formsService.getGoals()` - Load goals
- `formsService.approveForm()` - Approve form
- `formsService.rejectForm()` - Reject form

---

### Section Components

#### FormSection1.jsx - Ministry Information
**Fields:**
- Leader name (text, required)
- Contact email (email, required)
- Contact phone (tel, required)
- Active members (number)
- Ministry description (textarea)

---

#### FormSection2.jsx - Mission & Vision
**Fields:**
- Mission statement (textarea, required)
- Vision statement (textarea, required)
- Core values (textarea)

---

#### FormSection3.jsx - Programs & Activities
**Fields:**
- Current programs (textarea, required)
- Target audience (textarea)
- Proposed new programs (textarea)
- Meeting schedule (text)

---

#### FormSection4.jsx - Events Management
**Features:**
- Add/edit/delete events
- Event modal with form
- Budget calculation
- Events list with cards
- Total events budget display

**Event Fields:**
- Event type (dropdown, required)
- Event name (text, required)
- Event date (date, required)
- Expected attendance (number, required)
- Budget amount (number, required)
- Description (textarea)

**API Calls:**
- `formsService.getEvents()` - Load events
- `lovService.getEventTypes()` - Load event types
- `formsService.createEvent()` - Add event
- `formsService.updateEvent()` - Edit event
- `formsService.deleteEvent()` - Delete event

---

#### FormSection5.jsx - Goals Management
**Features:**
- Add/edit/delete goals
- Min 3, max 5 goals enforced
- SMART goal structure
- Goal numbering
- Validation warnings

**Goal Fields (SMART):**
- Goal description (text, required)
- Specific (textarea, required)
- Measurable (textarea, required)
- Achievable (textarea, required)
- Relevant (textarea, required)
- Time-bound (textarea, required)

**API Calls:**
- `formsService.getGoals()` - Load goals
- `formsService.createGoal()` - Add goal
- `formsService.updateGoal()` - Edit goal
- `formsService.deleteGoal()` - Delete goal

**Business Rules:**
- Minimum 3 goals required
- Maximum 5 goals allowed
- Warning when deleting at minimum

---

#### FormSection6.jsx - Resources Needed
**Fields:**
- Personnel needs (textarea)
- Equipment & materials (textarea)
- Facility requirements (textarea)
- Technology & software (textarea)
- Training & development (textarea)
- Other resources (textarea)

---

#### FormSection7.jsx - Budget Summary
**Features:**
- Auto-calculates from events (Section 4)
- Visual budget cards
- Total budget display
- Events breakdown list

**Fields:**
- Operating budget (number, required)
- Capital expenses (number)
- Budget justification (textarea, required)
- Funding sources (textarea)
- Previous year comparison (textarea)

**Calculations:**
- Events budget = Sum of all event budgets
- Total = Events + Operating + Capital

**API Calls:**
- `formsService.getEvents()` - Load for calculation

**Props:**
- Receives `formData` to access all sections

---

#### FormSection8.jsx - Challenges & Opportunities
**Fields:**
- Current challenges (textarea, required)
- Proposed solutions (textarea)
- Growth opportunities (textarea, required)
- Support needed (textarea)
- Collaboration opportunities (textarea)

---

#### FormSection9.jsx - Additional Information
**Fields:**
- Success stories (textarea)
- Communication plan (textarea)
- Volunteer management (textarea)
- Evaluation metrics (textarea)
- Long-term vision (textarea)
- Additional comments (textarea)

**Features:**
- Final submission notice
- Ready to submit confirmation

---

## 🔄 Data Flow

### Creating a Form
```
1. User clicks "Create New Form" in Dashboard
2. → Navigates to FormCreate
3. → User selects ministry
4. → FormCreate calls formsService.createForm()
5. → Backend creates form in 'draft' status
6. → Navigates to FormBuilder with new form ID
```

### Editing a Form
```
1. FormBuilder loads form data
2. → User navigates between sections
3. → User fills in fields
4. → Auto-save triggers after 2 seconds
5. → formsService.updateForm() called
6. → Backend updates sections JSON
7. → User can manually save anytime
```

### Managing Events/Goals
```
1. User navigates to Section 4 or 5
2. → Component loads existing events/goals
3. → User clicks "Add Event/Goal"
4. → Modal opens with form
5. → User fills form and saves
6. → API creates event/goal record
7. → List refreshes with new item
8. → Budget totals recalculate (events)
```

### Submitting a Form
```
1. User completes sections (80%+ required)
2. → User clicks "Submit for Approval"
3. → Confirmation dialog appears
4. → formsService.submitForm() called
5. → Status changes: draft → pending_pillar
6. → Form locked for editing
7. → Navigates back to Dashboard
```

### Approving a Form
```
1. Pillar/Pastor clicks "Review" in Dashboard
2. → Navigates to FormApproval
3. → Reviews form summary
4. → (Optional) Opens full view
5. → Adds approval comments
6. → Clicks "Approve Form"
7. → formsService.approveForm() called
8. → Status updates:
   - Pillar: pending_pillar → pending_pastor
   - Pastor: pending_pastor → approved
9. → Navigates back to Dashboard
```

### Rejecting a Form
```
1. Pillar/Pastor clicks "Reject"
2. → Rejection modal opens
3. → User enters rejection reason (required)
4. → formsService.rejectForm() called
5. → Status changes to 'rejected'
6. → Form becomes editable again
7. → Ministry leader sees rejection
```

---

## 🎨 Styling Conventions

### Status Colors
```jsx
draft:          gray-100, gray-800
pending_pillar: yellow-100, yellow-800
pending_pastor: blue-100, blue-800
approved:       green-100, green-800
rejected:       red-100, red-800
```

### Primary Actions
```jsx
Primary button:   bg-church-primary text-white
Secondary button: bg-gray-100 text-gray-700
Success button:   bg-green-600 text-white
Danger button:    bg-red-600 text-white
```

### Form Fields
```jsx
Input/Textarea: border border-gray-300 focus:ring-2 focus:ring-church-primary
Required:       <span className="text-red-500">*</span>
Helper text:    text-sm text-gray-500
```

---

## 🧪 Testing Scenarios

### Happy Path
1. Create form
2. Complete all 9 sections
3. Add 3+ events with budgets
4. Add 3-5 SMART goals
5. Submit form
6. Pillar approves
7. Pastor approves
8. Form status = approved

### Edge Cases
1. Try submitting with <80% completion → Blocked
2. Try adding 6th goal → Blocked
3. Try deleting goal when at minimum → Warning
4. Try editing after submission → Blocked
5. Navigate away without saving → Auto-save works
6. Reject form → Ministry can re-edit

---

## 📊 Performance Considerations

### Auto-Save
- Debounced to 2 seconds
- Prevents excessive API calls
- Silent saves don't show UI messages
- Only updates changed sections

### Component Loading
- Each section loads independently
- Events/goals load on section mount
- Prevents loading all data upfront
- Improves initial page load

### Form State
- Sections stored as JSON in database
- Only active section data in memory
- No unnecessary re-renders
- Efficient section switching

---

## 🔒 Security Checks

### Route Protection
- FormCreate: Ministry only
- FormBuilder: Ministry only (form creator)
- FormApproval: Pillar/Pastor/Admin only
- FormView: All authenticated users

### API Authorization
- Backend validates user role
- Backend checks form ownership
- Backend validates form status
- JWT token required for all requests

---

## 🐛 Common Issues & Solutions

### Issue: Auto-save not working
**Check:**
- Browser console for errors
- Network tab shows API calls
- Backend server is running
- JWT token is valid

### Issue: Events/Goals not saving
**Check:**
- LOV data exists (event types, ministries)
- Form ID is correct
- API endpoints return 200 status
- Database tables exist

### Issue: Can't submit form
**Check:**
- Completion % is 80+
- Minimum 3 goals added
- Required fields filled
- User role is 'ministry'
- Form status is 'draft'

---

**This reference guide covers all Phase 3.2 components!** 🎉
