# 🚀 Phase 1 Setup Guide - Ministry Budget System

## Prerequisites Checklist
- [ ] Node.js v14+ installed ([Download](https://nodejs.org/))
- [ ] PostgreSQL v12+ installed ([Download](https://www.postgresql.org/download/))
- [ ] Cursor IDE installed ([Download](https://cursor.sh/))
- [ ] Basic terminal/command line knowledge

---

## 📁 Step 1: Create Project Structure

Open Cursor IDE and create this exact folder structure:

```
ministry-budget-app/
├── server/
│   └── server.js          (You'll copy this file here)
├── database/
│   └── schema.sql         (You'll copy this file here)
├── .env                    (You'll create this)
├── .env.example           (You'll copy this file here)
├── package.json           (You'll copy this file here)
└── README.md
```

**In Cursor IDE:**
1. File → New Window
2. Create a new folder: `ministry-budget-app`
3. File → Open Folder → Select `ministry-budget-app`
4. Create the `server/` and `database/` folders

---

## 📥 Step 2: Copy Files from Claude

Download these 4 files I created and place them in your project:

1. **package.json** → Root folder
2. **.env.example** → Root folder
3. **database/schema.sql** → `database/` folder
4. **server/server.js** → `server/` folder

---

## ⚙️ Step 3: Configure Environment

1. **Copy `.env.example` to `.env`**
   ```bash
   # In terminal (Cursor has built-in terminal: Ctrl+` or Cmd+`)
   cp .env.example .env
   ```

2. **Edit `.env` file** with YOUR PostgreSQL credentials:
   ```env
   DB_USER=postgres
   DB_PASSWORD=YOUR_ACTUAL_POSTGRES_PASSWORD
   DB_NAME=ministry_budget
   ```

   **Important:** Replace `YOUR_ACTUAL_POSTGRES_PASSWORD` with your real password!

---

## 🗄️ Step 4: Set Up PostgreSQL Database

### Option A: Using Command Line (Recommended)

```bash
# 1. Create the database
createdb ministry_budget

# If you need to specify user:
createdb -U postgres ministry_budget

# 2. Run the schema (creates tables + seed data)
psql -U postgres -d ministry_budget -f database/schema.sql
```

### Option B: Using pgAdmin (GUI)

1. Open pgAdmin
2. Right-click "Databases" → "Create" → "Database"
3. Name: `ministry_budget`
4. Click "Save"
5. Right-click the new database → "Query Tool"
6. Open `database/schema.sql` file
7. Click "Execute" (▶ button)

**Expected Output:**
```
✓ Database schema created successfully!
✓ Default users created (PIN: 1234 for all)
```

---

## 📦 Step 5: Install Dependencies

In your terminal (inside `ministry-budget-app` folder):

```bash
npm install
```

This installs:
- Express (web server)
- PostgreSQL driver
- JWT authentication
- CORS, Helmet (security)
- And more...

---

## 🚀 Step 6: Start the Backend Server

```bash
npm run dev
```

**You should see:**
```
=================================
🚀 The Voice Church - Ministry Budget API
✓ Server running on port 3001
✓ Database connected successfully
✓ Environment: development
=================================
```

**If you see this, Phase 1 is COMPLETE! 🎉**

---

## ✅ Step 7: Test the API

### Test 1: Health Check
Open browser or use curl:
```bash
curl http://localhost:3001/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2024-11-13T...",
  "service": "ministry-budget-api"
}
```

### Test 2: Login Test
Use curl or Postman:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@thevoicechurch.org","pin":"1234"}'
```

**Expected response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "admin@thevoicechurch.org",
    "role": "admin",
    "name": "System Admin"
  }
}
```

---

## 🔐 Default Test Accounts

| Role | Email | PIN | Purpose |
|------|-------|-----|---------|
| Admin | admin@thevoicechurch.org | 1234 | Full system access |
| Pastor | pastor@thevoicechurch.org | 1234 | Final approval |
| Pillar | pillar1@thevoicechurch.org | 1234 | First approval |
| Ministry Leader | worship.leader@thevoicechurch.org | 1234 | Create forms |

---

## 🐛 Troubleshooting

### Error: "Database connection error"
**Solution:**
1. Make sure PostgreSQL is running
2. Check your `.env` file has correct credentials
3. Test connection: `psql -U postgres -d ministry_budget`

### Error: "Port 3001 already in use"
**Solution:**
1. Change `PORT=3002` in `.env` file
2. Or kill the process using port 3001

### Error: "Cannot find module 'express'"
**Solution:**
```bash
rm -rf node_modules
npm install
```

### Error: "relation 'users' does not exist"
**Solution:**
Database schema wasn't created. Run:
```bash
psql -U postgres -d ministry_budget -f database/schema.sql
```

---

## 📝 What We Built (Phase 1)

✅ PostgreSQL database with 8 tables
✅ Express server with security middleware
✅ JWT-based authentication
✅ Login endpoint
✅ User management (admin only)
✅ Audit logging
✅ Rate limiting on auth endpoints

---

## 🎯 Next Steps: Phase 2

Once Phase 1 is working, we'll build:
- Form CRUD endpoints (Create, Read, Update, Delete)
- Approval workflow logic
- Role-based permissions for forms
- Event and Goal management

---

## 💡 Tips for Working in Cursor IDE

1. **Use Cursor's AI for quick fixes:**
   - Highlight code → Cmd+K → Ask "Explain this" or "Fix this error"

2. **Terminal shortcuts:**
   - Ctrl+` (or Cmd+`) to open terminal
   - Split terminal for multiple commands

3. **When to come back to Claude.ai:**
   - Architecture questions
   - "What should I build next?"
   - Major refactors or new features
   - Stuck on complex bugs

4. **When to use Cursor's AI:**
   - Small code tweaks
   - Syntax errors
   - "Why isn't this working?"
   - Inline code suggestions

---

## 📞 Need Help?

**If something isn't working:**
1. Check the error message carefully
2. Try the troubleshooting section above
3. Come back to Claude.ai with the specific error
4. Or start a new chat in Cursor with context

**For Betty Washington (Church Admin):**
- Email: bwashington@thevoicechurch.org
- Phone: (202) 910-4771

---

## ✅ Phase 1 Complete Checklist

- [ ] Folder structure created
- [ ] All 4 files copied into correct locations
- [ ] .env file configured with PostgreSQL credentials
- [ ] Database created (`ministry_budget`)
- [ ] Schema loaded successfully (8 tables created)
- [ ] Dependencies installed (`npm install`)
- [ ] Server starts successfully (`npm run dev`)
- [ ] Health check returns "ok"
- [ ] Login test returns JWT token

**When all boxes are checked, you're ready for Phase 2! 🚀**

---

**Questions?** Come back to Claude.ai and say: "Phase 1 complete, ready for Phase 2!" or "I'm stuck on [specific issue]"
