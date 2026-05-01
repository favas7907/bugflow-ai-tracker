# BugFlow — Prompt-Driven Bug Tracker

A premium, production-grade bug tracking system built with Next.js, Firebase, and Tailwind CSS.

![Built with Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore%20%2B%20Storage-orange?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue?logo=tailwindcss)
![Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

## Features

- **Issue Lifecycle** — Create, edit, delete, assign, and transition bugs through Open → In Progress → Resolved → Closed with enforced valid transitions
- **Search & Filter** — Real-time keyword search with status, priority, and assignee filters
- **Email Notifications** — Server-side email alerts via Resend when bug status changes (with graceful fallback)
- **Analytics Dashboard** — Live KPI cards, status/priority distribution charts, and assignee breakdown
- **File Attachments** — Upload files to Firebase Storage with image previews and download links
- **Threaded Comments** — Persistent comment threads on each issue
- **Authentication** — Firebase Auth with email/password; auto-assigns Member role on signup
- **Admin Management** — Role-based access control; admins can promote/demote and remove members
- **Premium UI** — Green-and-white SaaS theme with responsive layout, polished cards, and micro-animations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3.4 |
| Auth | Firebase Authentication |
| Database | Cloud Firestore |
| File Storage | Firebase Storage |
| Email | Resend (server-side API route) |
| Icons | Lucide React |
| Deployment | Vercel |

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/prompt-bug-tracker.git
cd prompt-bug-tracker
npm install
```

### 2. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication** → Email/Password provider
4. Create a **Firestore Database** (start in test mode or apply `firestore.rules`)
5. Enable **Storage** (apply `storage.rules`)
6. Go to Project Settings → Your Apps → Add Web App → Copy config values

### 3. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your Firebase config values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# Optional — for email notifications
RESEND_API_KEY=re_your_key_here
EMAIL_FROM=bugs@yourdomain.com
```

### 4. Set Up the First Admin User

1. Run the app and sign up with your email
2. Go to Firebase Console → Firestore → `users` collection
3. Find your user document and change `role` from `"Member"` to `"Admin"`

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

### Option A: Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Add all environment variables from `.env.local` in the Vercel dashboard
5. Deploy

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

Add environment variables:
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add RESEND_API_KEY
vercel env add EMAIL_FROM
```

## Firestore Indexes

Create composite indexes if needed for queries (Firestore will prompt you in the browser console with direct links).

Required indexes:
- `comments` collection: `issueId` (Ascending) + `createdAt` (Ascending)
- `attachments` collection: `issueId` (Ascending) + `createdAt` (Descending)

## Project Structure

```
src/
├── app/
│   ├── (app)/               # Protected routes (dashboard, issues, members)
│   │   ├── layout.tsx        # Auth-guarded shell with sidebar
│   │   ├── dashboard/page.tsx
│   │   ├── issues/page.tsx
│   │   ├── issues/[id]/page.tsx
│   │   └── members/page.tsx
│   ├── api/send-email/route.ts  # Server-side email API
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx            # Root layout with AuthProvider
│   ├── page.tsx              # Home redirect
│   └── globals.css
├── components/
│   ├── Sidebar.tsx
│   └── ui.tsx                # Reusable UI primitives
└── lib/
    ├── firebase.ts           # Firebase lazy initialization
    ├── firestore.ts          # Firestore CRUD operations
    ├── storage.ts            # File upload utility
    ├── auth-context.tsx      # Auth state management
    └── utils.ts              # Types, constants, helpers
```

## License

MIT
