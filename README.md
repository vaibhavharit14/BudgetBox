# BudgetBox - Offline-First Personal Budgeting App

A real, working Offline-First personal budgeting application built with Local-First principles. Works completely offline, auto-saves every keystroke locally, and syncs safely when the network returns.

# Assignment Details

Assignment Name: BudgetBox  
Role: Frontend / Fullstack Developer  
Goal: Build a real, working Offline-First Personal Budgeting App

# Live Demo

Frontend: Vercel URL : https://budget-box-8ssa.vercel.app/login
Backend: Render URL : https://budgetbox-2zg4.onrender.com

# Features

 1. Add / Edit Monthly Budget
- Single form with all required fields:
  - Income (Monthly income input)
  - Monthly Bills (Rent, EMI, utilities)
  - Food (Groceries + dining)
  - Transport (Fuel, cab, commute)
  - Subscriptions (OTT, SaaS, apps)
  - Miscellaneous (Others)
  - Description (Notes)
- Edit anytime
- Auto-save field value instantly (every keystroke)
- Works offline with nowhere to get stuck

2. Auto-Generated Dashboard
- Burn Rate (Total expenses / Income)
- Savings Potential (Income – Total Spend)
- Month-End Prediction (Based on current trend)
- Category Pie Chart (Using Recharts)
- Anomaly Warnings (Rule-based):
  - Food > 40% of income → "Reduce food spend next month"
  - Subscriptions > 30% → "Consider cancelling unused apps"
  - Savings negative → "Your expenses exceed income"
  - Burn rate > 90% → "You're spending almost all your income"

### 3. Local-First Data Behavior
- Local DB: Zustand Persist with localStorage (IndexedDB compatible)
- Offline Behavior:
  - App works even with 0 internet
  - Every keystroke is auto-saved
  - Offline indicator badge
- Sync Logic with clear statuses:
  - Local Only - Saved locally, never synced
  - Sync Pending - Edits waiting for network
  - Synced - Both server & local are aligned

### 4. Optional Rule-Based Suggestions
- Rule-based suggestions (no GPT)
- Anomaly detection and warnings
- Smart budget insights

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 18 + TypeScript
- State: Zustand with Persist middleware
- Styling: TailwindCSS with Nord theme
- Charts: Recharts

### Backend
- Node.js with Express
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT tokens
- Validation: Zod

### Database
- Local DB: Zustand Persist (localStorage/IndexedDB)
- Server DB: PostgreSQL

## Project Structure

```
BudgetBox/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js App Router pages
│   │   ├── page.tsx        # Home page with budget form
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── BudgetForm.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SyncPanel.tsx
│   │   │   ├── OfflineBadge.tsx
│   │   │   └── ...
│   │   ├── store/          # Zustand store
│   │   │   └── budgetStore.ts
│   │   └── utils/          # Utility functions
│   │       └── api.ts
│   └── package.json
│
├── backend/                 # Express backend API
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   ├── auth.ts    # Authentication endpoints
│   │   │   └── budget.ts  # Budget endpoints
│   │   ├── middleware/     # Express middleware
│   │   ├── lib/           # Prisma client
│   │   └── index.ts       # Server entry point
│   ├── prisma/
│   │   └── schema.prisma  # Database schema
│   └── package.json
│
└── README.md               # This file
```

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- npm or yarn package manager

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:  
   Create a `.env` file in the `backend` directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/budgetbox"
   JWT_SECRET="your-secret-key-here"
   PORT=4000
   DEMO_EMAIL="hire-me@anshumat.org"
   DEMO_PASSWORD="HireMe@2025!"
   ```

4. Run database migration:
   ```bash
   node fix-database.js
   npm run generate
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:4000`

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## Testing Offline Mode

### Method 1: Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select Offline from the throttling dropdown
4. Try editing the budget form - it should work perfectly

### Method 2: Disconnect Network
1. Disconnect your WiFi/Ethernet
2. The app will show an "Offline Mode" badge
3. All edits are saved locally
4. Reconnect and click "Sync" to upload changes

### Method 3: Service Worker (if implemented)
- The app will cache resources and work offline automatically

## Demo Login Credentials

**Email:** `hire-me@anshumat.org`  
**Password:** `HireMe@2025!`

This user is automatically created when the backend starts, so you can log in immediately without registration.

## API Endpoints

### Authentication
- POST /auth/register - Register new user
- POST /auth/login - Login user (returns JWT token)

### Budget
- POST /budget/sync - Sync local budget to server (requires auth)
- GET /budget/latest - Fetch latest budget from server (requires auth)

### Health Check
- GET /health - Server health status

## Architecture

### Local-First Design
1. Local Storage: Zustand Persist automatically saves to localStorage
2. Auto-save: Every keystroke triggers `setField()` which persists immediately
3. Sync Status: Tracks LocalOnly → SyncPending → Synced states
4. Offline Detection: Browser online/offline events show status badge

### Data Flow
```
User Input → Zustand Store → localStorage (instant)
                ↓
         Sync Button Click
                ↓
         POST /budget/sync → PostgreSQL
                ↓
         Update Sync Status → Synced
```

## Dashboard Analytics

The dashboard automatically calculates:
- Burn Rate: (Total Expenses / Income) × 100
- Savings Potential: Income - Total Expenses
- Month-End Prediction: Daily Spend Rate × Days in Month
- Category Distribution: Visual pie chart with percentages

## Anomaly Detection Rules

The app detects and warns about:
1. Food spending > 40% of income
2. Subscriptions > 30% of income
3. Negative savings (expenses exceed income)
4. Burn rate > 90%

## UI/UX Features

- Professional, polished UI with Nord theme
- Smooth animations and transitions
- Responsive design (mobile-friendly)
- Loading states and error handling
- Status badges and indicators
- Offline indicator badge
- Gradient buttons and cards

## Notes for Reviewer

- Local-First Implementation: Uses Zustand Persist which stores data in localStorage (IndexedDB compatible). Every keystroke is auto-saved.
- Offline Mode: Fully functional offline. The app detects network status and shows an indicator.
- Sync Logic: Clear status tracking (LocalOnly, SyncPending, Synced) with visual badges.
- Dashboard: Complete analytics with burn rate, savings potential, month-end prediction, and pie chart.
- Demo User: Automatically provisioned on server start for easy testing.
- Error Handling: Comprehensive error handling with user-friendly messages.

