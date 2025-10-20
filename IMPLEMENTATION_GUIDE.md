# NihonGo Implementation Guide

**Complete Step-by-Step Development Roadmap**

This guide provides a detailed, sequential approach to building the NihonGo Japanese Language Learning Application from your current project state to a fully functional MVP.

---

## Table of Contents

- [Step 0: Project Cleanup & Preparation](#step-0-project-cleanup--preparation)
- [Step 1: Database Schema & Environment Setup](#step-1-database-schema--environment-setup)
- [Step 2: Authentication System](#step-2-authentication-system)
- [Step 3: Database Seeding with CSV](#step-3-database-seeding-with-csv)
- [Step 4: SRS Flashcard System](#step-4-srs-flashcard-system)
- [Step 5: Quiz System](#step-5-quiz-system)
- [Step 6: AI Tutor Chatbot](#step-6-ai-tutor-chatbot)
- [Step 7: Polish & Deployment](#step-7-polish--deployment)

---

## Step 0: Project Cleanup & Preparation

**Estimated Time:** 30 minutes  
**Goal:** Remove obsolete code and prepare the project structure for new implementations

### 0.1 Backup Current Work

Before making any changes, create a backup of your current state:

```bash
# Create a git commit of your current state
cd nihon-go_frontend
git add .
git commit -m "Pre-PRD implementation backup"

# Optional: Create a backup branch
git checkout -b backup-pre-prd
git checkout main  # or master
```

**Why?** This ensures you can revert if something goes wrong during the cleanup process.

### 0.2 Delete Python Backend

The Python backend is no longer needed since we're moving the Gemini API integration to Next.js API routes.

```bash
# From the project root
cd ..
rm -rf nihon-go_backend
```

**What's happening:**

- The Python backend (`main.py`) was a simple test of the Gemini API
- We're consolidating everything into the Next.js monorepo for easier deployment
- The Gemini API will be called from Next.js API routes using the Vercel AI SDK

### 0.3 Remove Manual Data Entry Scripts

Your current scripts for manual lesson addition are inefficient for the scale we need.

```bash
cd nihon-go_frontend
rm src/scripts/add-lesson.ts
rm src/scripts/admin-operations.ts
```

**What's happening:**

- These scripts manually add lessons one at a time
- We're replacing them with a CSV-based bulk seeding approach
- This will allow you to add hundreds of vocabulary items in seconds

### 0.4 Prepare Data Migration

Don't delete your TypeScript data files yet - we'll convert them to CSV format.

**Files to keep temporarily:**

- `src/data/vocab/lesson1.ts`
- `src/data/vocab/lesson2.ts`
- `src/data/kanji/lesson1.ts`
- `src/data/kanji/lesson2.ts`
- `src/data/lessons.ts`

**What's happening:**

- These files contain your carefully curated data
- We'll use them as a reference when creating CSV files
- After CSV migration is complete, we can archive these files

### 0.5 Update .gitignore

Add entries to prevent committing sensitive files:

```bash
# Add to .gitignore
echo "" >> .gitignore
echo "# Environment variables" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
echo "" >> .gitignore
echo "# CSV data (optional - you may want to commit these)" >> .gitignore
echo "# prisma/data/*.csv" >> .gitignore
```

**What's happening:**

- `.env.local` will contain sensitive API keys
- You might want to commit CSV files for team collaboration, or keep them private

### 0.6 Clean Node Modules (Optional)

If you want a fresh start with dependencies:

```bash
cd nihon-go_frontend
rm -rf node_modules
rm package-lock.json
npm install
```

**What's happening:**

- This ensures no conflicting packages from previous experiments
- Only do this if you've had dependency issues

### 0.7 Update Database Schema Incrementally

⚠️ **IMPORTANT:** Don't drop your database yet! We'll migrate incrementally.

First, check what's currently in your database:

```bash
npx prisma studio
```

**What's happening:**

- Prisma Studio opens in your browser
- You can see all existing lessons, vocab, and kanji entries
- Take note of what data you want to preserve

### 0.8 Create Implementation Checklist

Create a file to track your progress:

```bash
touch IMPLEMENTATION_PROGRESS.md
```

Add this template:

```markdown
# Implementation Progress

## Step 0: Cleanup ✅

- [x] Backup created
- [x] Python backend removed
- [x] Manual scripts removed
- [x] .gitignore updated

## Step 1: Database Schema

- [ ] Install dependencies
- [ ] Update schema.prisma
- [ ] Run migrations
- [ ] Verify in Prisma Studio

## Step 2: Authentication

- [ ] Supabase client setup
- [ ] Auth pages created
- [ ] Middleware configured
- [ ] Testing complete

(Continue for all steps...)
```

**What's happening:**

- This keeps you organized during the week-long sprint
- You can check off items as you complete them
- Helps with motivation and tracking progress

---

## Step 1: Database Schema & Environment Setup

**Estimated Time:** 1-2 hours  
**Goal:** Set up the complete database schema with all models for authentication, SRS, quizzes, and chat

### 1.1 Install Required Dependencies

Navigate to your frontend directory and install all necessary packages:

```bash
cd nihon-go_frontend
npm install framer-motion zustand react-hot-toast papaparse @types/papaparse ai @google/generative-ai @supabase/ssr @supabase/supabase-js
```

**What each package does:**

- **framer-motion**: Animation library for flashcard flips and transitions

  - Used for smooth card flip animations
  - Provides exit animations for quiz feedback
  - Industry standard with excellent TypeScript support

- **zustand**: Lightweight state management (1KB)

  - Manages review session state (current card, score)
  - Simpler alternative to Redux
  - No Context API boilerplate needed

- **react-hot-toast**: Toast notifications

  - Shows success/error messages (e.g., "Review saved!")
  - Beautiful default styling
  - Easy to customize

- **papaparse** & **@types/papaparse**: CSV parsing

  - Reads CSV files for database seeding
  - Handles UTF-8 encoding for Japanese characters
  - Converts CSV rows to JavaScript objects

- **ai**: Vercel AI SDK

  - Handles streaming responses from Gemini API
  - Built-in hooks like `useChat()`
  - Manages chat state automatically

- **@google/generative-ai**: Google's Gemini SDK

  - Interfaces with Gemini API
  - Provides TypeScript types for API responses

- **@supabase/ssr** & **@supabase/supabase-js**: Supabase client libraries
  - `ssr`: Server-side rendering support for Next.js 15 App Router
  - `supabase-js`: Core Supabase client for authentication and database

### 1.2 Set Up Environment Variables

Create a `.env.local` file in your frontend root:

```bash
touch .env.local
```

Add the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Direct database connection for Prisma
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get these values:**

**Supabase Values:**

1. Go to [supabase.com](https://supabase.com) and log in
2. Open your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
5. Copy `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Go to **Settings** → **Database**
7. Copy the Connection String under "Connection Pooling" → This is your `DATABASE_URL`
8. Copy the Connection String under "Direct Connection" → This is your `DIRECT_URL`

**Gemini API Key:**

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new key or use an existing one
4. Copy the key → This is your `GEMINI_API_KEY`

**What's happening:**

- `NEXT_PUBLIC_*` variables are exposed to the browser (safe for client-side auth)
- `DATABASE_URL` uses connection pooling (required for serverless)
- `DIRECT_URL` is for migrations (direct database access)
- `GEMINI_API_KEY` is server-only (never exposed to browser)

### 1.3 Update Prisma Schema

Replace your entire `prisma/schema.prisma` with this comprehensive schema:

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  avatarUrl String?
  supabaseId String  @unique // Links to Supabase Auth user

  createdAt DateTime @default(now())
  lastLogin DateTime @default(now())

  // Relations
  vocabProgress UserVocabProgress[]
  kanjiProgress UserKanjiProgress[]
  quizAttempts  QuizAttempt[]
  chatHistory   ChatMessage[]

  @@index([supabaseId])
}

// ============================================================================
// LESSON CONTENT
// ============================================================================

model Lesson {
  id            String   @id @default(cuid())
  title         String
  slug          String   @unique
  description   String
  number        Int      @unique
  locked        Boolean  @default(true)
  imageUrl      String?
  estimatedTime Int?     // Minutes to complete

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  vocab        VocabEntry[]
  kanji        KanjiEntry[]
  quizAttempts QuizAttempt[]

  @@index([number])
}

model VocabEntry {
  id              String  @id @default(cuid())
  word            String  // Japanese word (e.g., "だいがく")
  reading         String  // Romaji (e.g., "daigaku")
  definition      String  // English meaning
  type            String  // noun, verb, adjective, etc.
  category        String? // school, people, time, etc.
  exampleSentence String? // Optional usage example
  audioUrl        String? // Future: pronunciation audio
  order           Int     // Display order within lesson

  lessonId String
  lesson   Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  // Relations
  userProgress UserVocabProgress[]

  @@index([lessonId, order])
}

model KanjiEntry {
  id          String   @id @default(cuid())
  kanji       String   @unique // The kanji character
  definition  String   // English meaning
  onyomi      String[] @default([]) // On'yomi readings
  kunyomi     String[] @default([]) // Kun'yomi readings
  strokeCount Int?
  jlptLevel   Int?     // 1-5 (5 = easiest)
  frequency   Int?     // Usage frequency rank

  lessonId String
  lesson   Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  // Relations
  userProgress UserKanjiProgress[]

  @@index([lessonId])
  @@index([kanji])
}

// ============================================================================
// SPACED REPETITION SYSTEM (SRS)
// ============================================================================

model UserVocabProgress {
  id     String @id @default(cuid())
  userId String
  vocabId String

  // SRS Algorithm Fields (SM-2 Algorithm)
  srsLevel       Int      @default(0) // 0 = new, 1-8 = learning stages, 8 = mastered
  easeFactor     Float    @default(2.5) // 1.3 to 3.0 (affects interval growth)
  interval       Int      @default(0) // Days until next review
  nextReviewAt   DateTime @default(now())
  lastReviewedAt DateTime?
  reviewCount    Int      @default(0)
  correctStreak  Int      @default(0)

  // Performance Metrics
  totalReviews   Int @default(0)
  correctReviews Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  vocab VocabEntry @relation(fields: [vocabId], references: [id], onDelete: Cascade)

  @@unique([userId, vocabId])
  @@index([userId, nextReviewAt]) // Optimizes "cards due today" queries
}

model UserKanjiProgress {
  id      String @id @default(cuid())
  userId  String
  kanjiId String

  // SRS Algorithm Fields (same as vocab)
  srsLevel       Int      @default(0)
  easeFactor     Float    @default(2.5)
  interval       Int      @default(0)
  nextReviewAt   DateTime @default(now())
  lastReviewedAt DateTime?
  reviewCount    Int      @default(0)
  correctStreak  Int      @default(0)

  // Performance Metrics
  totalReviews   Int @default(0)
  correctReviews Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  user  User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  kanji KanjiEntry @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  @@unique([userId, kanjiId])
  @@index([userId, nextReviewAt])
}

// ============================================================================
// KANA (HIRAGANA & KATAKANA)
// ============================================================================

model HiraganaEntry {
  id        String @id @default(cuid())
  character String @unique // e.g., "あ"
  romaji    String // e.g., "a"
  type      String // basic, dakuten, combo
  order     Int    // Display order (1, 2, 3...)

  @@index([order])
}

model KatakanaEntry {
  id        String @id @default(cuid())
  character String @unique // e.g., "ア"
  romaji    String // e.g., "a"
  type      String // basic, dakuten, combo
  order     Int

  @@index([order])
}

// ============================================================================
// QUIZ SYSTEM
// ============================================================================

model QuizAttempt {
  id             String   @id @default(cuid())
  userId         String
  quizType       String   // vocab, kanji, hiragana, katakana
  lessonId       String?  // Optional: for lesson-specific quizzes
  score          Int      // Number of correct answers
  totalQuestions Int      // Total questions in quiz
  timeSpent      Int      // Seconds taken to complete
  completedAt    DateTime @default(now())

  // Relations
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson? @relation(fields: [lessonId], references: [id])

  @@index([userId, quizType])
  @@index([completedAt])
}

// ============================================================================
// AI CHAT HISTORY
// ============================================================================

model ChatMessage {
  id        String   @id @default(cuid())
  userId    String
  role      String   // "user" or "assistant"
  content   String   @db.Text // Long text content
  threadId  String?  // Optional: group messages into conversations
  createdAt DateTime @default(now())

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([threadId])
}
```

**What's happening in this schema:**

**1. User Model:**

- `supabaseId`: Links Prisma User to Supabase Auth user
- `email`: Stored for quick lookup (synced from Supabase)
- `lastLogin`: Track user activity for analytics
- Relations to all user-specific data (progress, quizzes, chat)

**2. Lesson Content Models:**

- `Lesson`: Container for vocab and kanji
- `VocabEntry`: Individual vocabulary words with metadata
- `KanjiEntry`: Kanji characters with readings and JLPT level
- Cascade delete: Deleting a lesson removes all its vocab/kanji

**3. SRS Progress Models:**

- Tracks each user's progress on each vocab/kanji item
- `srsLevel`: 0-8 scale (0=new, 8=mastered)
- `easeFactor`: Personalized difficulty (starts at 2.5)
- `interval`: Days until next review
- `nextReviewAt`: Indexed for fast "due cards" queries
- Composite unique index `[userId, vocabId]`: One progress record per user per word

**4. Kana Models:**

- Separate tables for Hiragana and Katakana
- `type`: Distinguishes basic (あ), dakuten (が), combo (きゃ)
- `order`: Ensures consistent display order

**5. Quiz System:**

- Tracks quiz attempts for analytics
- `quizType`: Differentiates vocab, kanji, hiragana, katakana quizzes
- Optional `lessonId`: For lesson-specific quizzes

**6. Chat History:**

- Stores all AI conversations
- `role`: Distinguishes user messages from AI responses
- `threadId`: Groups messages into conversations
- Indexed by `[userId, createdAt]` for efficient pagination

### 1.4 Run Database Migration

Generate and apply the migration:

```bash
npx prisma migrate dev --name init_complete_schema
```

**What's happening:**

1. Prisma reads your `schema.prisma`
2. Compares it to your current database state
3. Generates SQL migration files
4. Asks you to name the migration (we named it `init_complete_schema`)
5. Applies the migration to your database
6. Generates the Prisma Client (TypeScript types)

**Expected output:**

```
Environment variables loaded from .env.local
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"

Applying migration `20250113XXXXXX_init_complete_schema`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20250113XXXXXX_init_complete_schema/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client
```

### 1.5 Handle Existing Data (If Any)

If you have existing lessons/vocab in your database, you have two options:

**Option A: Keep existing data and add new tables**

- The migration will add new tables without touching existing ones
- You'll need to manually migrate old data to the new schema if the structure changed

**Option B: Fresh start (recommended for development)**

```bash
npx prisma migrate reset
```

This will:

1. Drop all tables
2. Recreate them from scratch
3. Run seed script (we'll create this in Step 3)

⚠️ **Warning:** This deletes all data. Only use in development!

### 1.6 Verify Schema in Prisma Studio

Open Prisma Studio to see your new database structure:

```bash
npx prisma studio
```

**What to check:**

- All 10 models are visible in the left sidebar
- Click on each model to see its fields
- Tables should be empty (unless you kept existing data)
- Relations should be visible (e.g., User → UserVocabProgress)

### 1.7 Generate Prisma Client Types

Ensure TypeScript has the latest types:

```bash
npx prisma generate
```

**What's happening:**

- Generates TypeScript types based on your schema
- Creates the Prisma Client in `node_modules/@prisma/client`
- Provides autocomplete for all models and fields in your IDE

### 1.8 Update Database Client File

Your existing `src/lib/db.ts` should work, but let's verify it:

```typescript
// src/lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**What's happening:**

- Creates a single Prisma Client instance
- In development, stores it globally to prevent hot-reload issues
- In production, creates a new instance per cold start

### 1.9 Test Database Connection

Create a test script to verify everything works:

```bash
mkdir -p src/scripts/test
touch src/scripts/test/db-connection.ts
```

```typescript
// src/scripts/test/db-connection.ts
import { prisma } from "@/lib/db";

async function testConnection() {
  try {
    console.log("Testing database connection...");

    // Try to query the User table
    const userCount = await prisma.user.count();
    console.log(`✅ Connected! Found ${userCount} users.`);

    // List all tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log("\n📊 Tables in database:");
    console.log(tables);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
```

Run the test:

```bash
npx ts-node -r tsconfig-paths/register src/scripts/test/db-connection.ts
```

**Expected output:**

```
Testing database connection...
✅ Connected! Found 0 users.

📊 Tables in database:
[
  { table_name: 'User' },
  { table_name: 'Lesson' },
  { table_name: 'VocabEntry' },
  { table_name: 'KanjiEntry' },
  { table_name: 'UserVocabProgress' },
  { table_name: 'UserKanjiProgress' },
  { table_name: 'HiraganaEntry' },
  { table_name: 'KatakanaEntry' },
  { table_name: 'QuizAttempt' },
  { table_name: 'ChatMessage' },
  { table_name: '_prisma_migrations' }
]
```

---

## Step 2: Authentication System

**Estimated Time:** 3-4 hours  
**Goal:** Implement complete authentication with Supabase (email/password + Google OAuth)

### 2.1 Create Supabase Client Utilities

Create the directory structure:

```bash
mkdir -p src/lib/supabase
```

### 2.1.1 Browser Client (Client-Side Auth)

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**What's happening:**

- `createBrowserClient`: Optimized for browser environment
- Uses `NEXT_PUBLIC_*` variables (safe to expose)
- Used in Client Components (`'use client'`)
- Handles cookie-based sessions automatically

### 2.1.2 Server Client (Server-Side Auth)

```typescript
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component, can't set cookies
          }
        },
      },
    }
  );
}
```

**What's happening:**

- `createServerClient`: Optimized for server environment
- Uses Next.js `cookies()` API for session management
- `getAll()`: Reads auth cookies from the request
- `setAll()`: Sets new auth cookies in the response
- Try-catch: Server Components can't set cookies, only Route Handlers can
- Used in Server Components, API Routes, and Server Actions

### 2.1.3 Middleware Client (Route Protection)

```typescript
// src/lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse = NextResponse.next({
              request,
            });
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
```

**What's happening:**

- Creates Supabase client in middleware context
- `getAll()`: Reads cookies from incoming request
- `setAll()`: Updates cookies in outgoing response
- `getUser()`: Validates and refreshes the session
- Returns both the response object and user data
- Used in `middleware.ts` to protect routes

### 2.2 Create Root Middleware for Route Protection

```typescript
// middleware.ts (in project root)
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  // Define protected routes
  const protectedRoutes = ["/lessons", "/quiz", "/chat", "/dashboard"];
  const authRoutes = ["/auth/login", "/auth/signup"];
  const { pathname } = request.nextUrl;

  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/auth/login", request.url);
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/lessons", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     * - api routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**What's happening:**

**1. Route Protection Logic:**

- `protectedRoutes`: Requires authentication
- `authRoutes`: Login/signup pages
- Checks if user is authenticated via `user` object

**2. Redirect Logic:**

- Unauthenticated + protected route → Redirect to `/auth/login?redirectTo=/original-path`
- Authenticated + auth route → Redirect to `/lessons` (already logged in)
- All other cases → Allow access

**3. Matcher Configuration:**

- Runs on all routes except Next.js internals and static files
- Regex excludes: `_next/static`, `_next/image`, image files
- Includes all dynamic routes and API routes

**4. Session Refresh:**

- Every request automatically refreshes the Supabase session
- Extends session expiration on user activity
- Updates cookies with new session data

### 2.3 Configure Supabase Authentication

Before implementing auth pages, configure Supabase:

**2.3.1 Enable Email Authentication**

1. Go to Supabase Dashboard → Authentication → Providers
2. Ensure "Email" is enabled
3. Configure email templates (optional):
   - Go to Authentication → Email Templates
   - Customize "Confirm signup" email
   - Set "Confirm signup" redirect URL to `http://localhost:3000/auth/callback`

**2.3.2 Enable Google OAuth**

1. Go to Authentication → Providers
2. Enable "Google"
3. Create Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project (or select existing)
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Add authorized redirect URI: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
4. Paste credentials in Supabase
5. Save configuration

**2.3.3 Set Site URL**

1. Go to Authentication → URL Configuration
2. Set "Site URL" to `http://localhost:3000` (development)
3. Add `http://localhost:3000/auth/callback` to "Redirect URLs"
4. For production, add your deployed URL

### 2.4 Create Authentication Pages

Create the auth route group:

```bash
mkdir -p src/app/\(auth\)/login
mkdir -p src/app/\(auth\)/signup
mkdir -p src/app/auth/callback
```

**Note:** The `(auth)` folder with parentheses is a Next.js route group - it doesn't appear in URLs.

### 2.4.1 Login Page

```typescript
// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/lessons";

  const supabase = createClient();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back!");

      // Sync user to Prisma database
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: data.user }),
      });

      router.push(redirectTo);
      router.refresh(); // Refresh server components
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to NihonGo
          </h1>
          <p className="text-gray-600">
            Log in to continue your Japanese learning journey
          </p>
        </div>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**What's happening:**

**1. Client Component:**

- `'use client'`: Needed for `useState`, `useRouter`, form submission

**2. State Management:**

- `email` & `password`: Form inputs
- `isLoading`: Prevents double-submission, shows loading state
- `redirectTo`: Where to send user after login (from URL param)

**3. Email Login Flow:**

```
User submits form
  ↓
Prevent default form submission
  ↓
Set loading state (disables button)
  ↓
Call Supabase signInWithPassword()
  ↓
If error: Show toast, stop loading
  ↓
If success:
  - Show success toast
  - Call /api/auth/sync to create Prisma User record
  - Redirect to original page (or /lessons)
  - Refresh server components to update auth state
```

**4. Google OAuth Flow:**

```
User clicks "Continue with Google"
  ↓
Set loading state
  ↓
Call Supabase signInWithOAuth()
  ↓
Supabase opens Google consent screen in popup
  ↓
User authorizes app
  ↓
Google redirects to /auth/callback
  ↓
Callback handler syncs user and redirects
```

**5. Toast Notifications:**

- `toast.success()`: Green notification for successful login
- `toast.error()`: Red notification for errors
- Requires `<Toaster />` component in root layout

### 2.4.2 Signup Page

```typescript
// src/app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast.success("Check your email to confirm your account!");
        router.push("/auth/login");
      } else {
        toast.success("Account created successfully!");

        // Sync user to database
        await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: data.user }),
        });

        router.push("/lessons");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=/lessons`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Google signup failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">
            Start your Japanese learning journey today
          </p>
        </div>

        {/* Google Signup */}
        <button
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign up with Google
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Or sign up with email
            </span>
          </div>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white rounded-lg px-4 py-3 font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

**What's happening:**

**1. Additional Validation:**

- Password confirmation matching
- Minimum password length (6 characters)
- Client-side validation before API call

**2. Signup Flow:**

```
User submits form
  ↓
Validate passwords match & meet requirements
  ↓
Call Supabase signUp()
  ↓
If email confirmation required:
  - Show "check your email" message
  - Redirect to login page
  ↓
If instant signup (email confirmation disabled):
  - Sync user to Prisma database
  - Redirect to /lessons
```

**3. User Metadata:**

- `options.data.name`: Stored in Supabase user metadata
- Can be retrieved later from `user.user_metadata.name`
- Not required, but enhances personalization

### 2.4.3 Auth Callback Handler

```typescript
// src/app/auth/callback/route.ts
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirectTo = searchParams.get("redirectTo") || "/lessons";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session) {
      // Sync user to Prisma database
      try {
        await fetch(`${origin}/api/auth/sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: data.user }),
        });
      } catch (error) {
        console.error("Failed to sync user:", error);
        // Continue anyway - user is authenticated in Supabase
      }

      // Redirect to the intended destination
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // If authentication failed, redirect to login
  return NextResponse.redirect(
    `${origin}/auth/login?error=authentication_failed`
  );
}
```

**What's happening:**

**1. OAuth Callback:**

- After Google OAuth, Google redirects to this route
- URL contains a `code` parameter (authorization code)
- This code is exchanged for a session

**2. Code Exchange:**

- `exchangeCodeForSession()`: Trades the code for access + refresh tokens
- Creates a session in Supabase
- Returns user data

**3. User Sync:**

- Calls our custom `/api/auth/sync` endpoint
- Creates a User record in Prisma database
- Links Supabase Auth user to Prisma user via `supabaseId`

**4. Error Handling:**

- If sync fails, user is still authenticated (graceful degradation)
- If code exchange fails, redirect to login with error message

### 2.5 Create User Sync API Route

```typescript
// src/app/api/auth/sync/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();

    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    // Upsert user (create if doesn't exist, update if exists)
    const syncedUser = await prisma.user.upsert({
      where: {
        supabaseId: user.id,
      },
      update: {
        email: user.email,
        name: user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
        lastLogin: new Date(),
      },
      create: {
        supabaseId: user.id,
        email: user.email,
        name: user.user_metadata?.name || null,
        avatarUrl: user.user_metadata?.avatar_url || null,
      },
    });

    return NextResponse.json({ user: syncedUser });
  } catch (error) {
    console.error("User sync error:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
```

**What's happening:**

**1. Upsert Strategy:**

- `upsert()`: "Update or insert"
- Tries to find user by `supabaseId`
- If found: Updates email, name, avatar, lastLogin
- If not found: Creates new user

**2. Data Mapping:**

- `user.id` → `supabaseId` (links to Supabase Auth)
- `user.email` → `email`
- `user.user_metadata.name` → `name` (from signup form)
- `user.user_metadata.avatar_url` → `avatarUrl` (from Google profile)

**3. Why Sync?**

- Supabase Auth manages authentication
- Prisma manages application data (progress, quizzes, chat)
- This bridges the two databases
- Allows joins (e.g., User → UserVocabProgress)

### 2.6 Add Toast Provider to Root Layout

Update your root layout to include the toast notifications:

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NihonGo - Learn Japanese",
  description:
    "Master Japanese with interactive flashcards, quizzes, and AI tutoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </body>
    </html>
  );
}
```

**What's happening:**

- `<Toaster />`: Global component that renders all toasts
- `position="top-right"`: Toasts appear in top-right corner
- Custom styling: Dark background, white text
- Different durations for success (3s) vs errors (5s)

### 2.7 Create Protected Route Example

Let's test route protection by updating your lessons page:

```typescript
// src/app/lessons/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // This should never happen due to middleware, but double-check
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.email}!</h1>
      <p>This is a protected page. Only authenticated users can see this.</p>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">User Info:</h2>
        <pre className="bg-gray-100 p-4 rounded-lg">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </div>
  );
}
```

**What's happening:**

- Server Component (no `'use client'`)
- Gets user from Supabase on the server
- Displays user info (for testing)
- In production, this page will show lessons

### 2.8 Test Authentication Flow

**Test Checklist:**

1. **Email Signup:**

```bash
npm run dev
# Visit http://localhost:3000/auth/signup
# Create account with email/password
# Check if redirected to /lessons
# Check Prisma Studio - should see new User record
```

2. **Email Login:**

```bash
# Visit http://localhost:3000/auth/login
# Log in with same credentials
# Should redirect to /lessons
```

3. **Google OAuth:**

```bash
# Click "Continue with Google" on login page
# Authorize app
# Should redirect to /lessons
# Check Prisma Studio - User has avatarUrl from Google
```

4. **Route Protection:**

```bash
# Log out (we'll add logout button next)
# Try visiting http://localhost:3000/lessons
# Should redirect to /auth/login?redirectTo=/lessons
```

5. **Redirect After Login:**

```bash
# While logged out, visit /lessons (redirects to login)
# Log in
# Should redirect back to /lessons (not /auth/login)
```

### 2.9 Add Logout Functionality

Create a reusable header component with logout:

```typescript
// src/components/Header.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function Header({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout failed");
    } else {
      toast.success("Logged out successfully");
      router.push("/auth/login");
      router.refresh();
    }
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">NihonGo</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
```

Use it in your lessons page:

```typescript
// src/app/lessons/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";

export default async function LessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen">
      <Header userEmail={user.email!} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold">Lessons</h2>
        <p className="text-gray-600">
          Coming soon: Lesson cards with flashcards
        </p>
      </div>
    </div>
  );
}
```

---

## Step 3: Database Seeding with CSV

**Estimated Time:** 2-3 hours  
**Goal:** Convert TypeScript data to CSV format and create efficient bulk seeding

### 3.1 Create CSV Directory Structure

```bash
mkdir -p nihon-go_frontend/prisma/data
```

### 3.2 Convert TypeScript Data to CSV

We'll create CSV files from your existing TypeScript data.

### 3.2.1 Vocabulary CSV

Create `prisma/data/vocabulary.csv`:

```csv
word,reading,definition,type,category,lessonNumber,order,exampleSentence
だいがく,daigaku,College; University,noun,school,1,1,
こうこう,koukou,High School,noun,school,1,2,
がくせい,gakusee,Student,noun,school,1,3,わたしはがくせいです。
だいがくせい,daigakusee,College Student,noun,school,1,4,
りゅうがくせい,ryugakusee,International Student,noun,school,1,5,
せんせい,sensee,Teacher; Professor,noun,school,1,6,
～ねんせい,...nensee,...year student,noun,school,1,7,
せんこう,senkou,Major,noun,school,1,8,
わたし,watashi,I,noun,people,1,9,
ともだち,tomodachi,Friend,noun,people,1,10,
～さん,...san,Mr./Ms.,noun,people,1,11,
～じん,...jin,...people,noun,people,1,12,
にほんじん,nihonjin,Japanese People,noun,people,1,13,
いま,ima,Now,noun,time,1,14,
ごぜん,gozen,Morning,noun,time,1,15,
ごご,gogo,Afternoon,noun,time,1,16,
～じ,...ji,O'Clock,noun,time,1,17,
はん,han,Half,noun,time,1,18,
にほん,nihon,Japan,noun,countries,1,19,
アメリカ,amerika,America,noun,countries,1,20,
```

**How to create this:**

Option 1: Manual (Excel/Google Sheets)

1. Open Google Sheets or Excel
2. Create headers: `word,reading,definition,type,category,lessonNumber,order,exampleSentence`
3. Copy data from `src/data/vocab/lesson1.ts`
4. Export as CSV (UTF-8 encoding)

Option 2: Script (faster for multiple lessons)

```typescript
// src/scripts/convert-to-csv.ts
import * as fs from "fs";
import { lesson1Vocab } from "../data/vocab/lesson1";

const csvHeader =
  "word,reading,definition,type,category,lessonNumber,order,exampleSentence\n";

const csvRows = lesson1Vocab
  .map(
    (v) =>
      `${v.word},${v.reading},${v.meaning},${v.type},${v.category || ""},1,${
        v.order
      },${v.exampleSentence || ""}`
  )
  .join("\n");

fs.writeFileSync("prisma/data/vocabulary.csv", csvHeader + csvRows, "utf-8");
console.log("✅ Created vocabulary.csv");
```

Run: `npx ts-node src/scripts/convert-to-csv.ts`

### 3.2.2 Kanji CSV

Create `prisma/data/kanji.csv`:

```csv
kanji,definition,onyomi,kunyomi,strokeCount,jlptLevel,lessonNumber
一,one,イチ・イツ,ひと・ひと(つ),1,5,1
二,two,ニ,ふた・ふた(つ),2,5,1
三,three,サン,み・み(つ),3,5,1
四,four,シ,よん・よ(つ),5,5,1
五,five,ゴ,いつ・いつ(つ),4,5,1
六,six,ロク,む・む(つ),4,5,1
七,seven,シチ,なな・なな(つ),2,5,1
八,eight,ハチ,や・や(つ),2,5,1
九,nine,キュウ・ク,ここの・ここの(つ),2,5,1
十,ten,ジュウ・ジッ,とお,2,5,1
百,hundred,ヒャク,もも,6,5,1
千,thousand,セン,ち,3,5,1
万,ten thousand,マン,よろず,3,5,1
円,yen; circle,エン,まる(い),4,5,1
人,person,ジン・ニン,ひと,2,5,1
```

**What each column means:**

- `onyomi`: On'yomi (Chinese reading), separated by commas
- `kunyomi`: Kun'yomi (Japanese reading), separated by commas
- `strokeCount`: Number of strokes to write the kanji
- `jlptLevel`: Japanese Language Proficiency Test level (5=easiest, 1=hardest)
- `lessonNumber`: Which Genki lesson introduces this kanji

### 3.2.3 Hiragana CSV

Create `prisma/data/hiragana.csv`:

```csv
character,romaji,type,order
あ,a,basic,1
い,i,basic,2
う,u,basic,3
え,e,basic,4
お,o,basic,5
か,ka,basic,6
き,ki,basic,7
く,ku,basic,8
け,ke,basic,9
こ,ko,basic,10
さ,sa,basic,11
し,shi,basic,12
す,su,basic,13
せ,se,basic,14
そ,so,basic,15
た,ta,basic,16
ち,chi,basic,17
つ,tsu,basic,18
て,te,basic,19
と,to,basic,20
な,na,basic,21
に,ni,basic,22
ぬ,nu,basic,23
ね,ne,basic,24
の,no,basic,25
は,ha,basic,26
ひ,hi,basic,27
ふ,fu,basic,28
へ,he,basic,29
ほ,ho,basic,30
ま,ma,basic,31
み,mi,basic,32
む,mu,basic,33
め,me,basic,34
も,mo,basic,35
や,ya,basic,36
ゆ,yu,basic,37
よ,yo,basic,38
ら,ra,basic,39
り,ri,basic,40
る,ru,basic,41
れ,re,basic,42
ろ,ro,basic,43
わ,wa,basic,44
を,wo,basic,45
ん,n,basic,46
が,ga,dakuten,47
ぎ,gi,dakuten,48
ぐ,gu,dakuten,49
げ,ge,dakuten,50
ご,go,dakuten,51
ざ,za,dakuten,52
じ,ji,dakuten,53
ず,zu,dakuten,54
ぜ,ze,dakuten,55
ぞ,zo,dakuten,56
だ,da,dakuten,57
ぢ,ji,dakuten,58
づ,zu,dakuten,59
で,de,dakuten,60
ど,do,dakuten,61
ば,ba,dakuten,62
び,bi,dakuten,63
ぶ,bu,dakuten,64
べ,be,dakuten,65
ぼ,bo,dakuten,66
ぱ,pa,dakuten,67
ぴ,pi,dakuten,68
ぷ,pu,dakuten,69
ぺ,pe,dakuten,70
ぽ,po,dakuten,71
きゃ,kya,combo,72
きゅ,kyu,combo,73
きょ,kyo,combo,74
しゃ,sha,combo,75
しゅ,shu,combo,76
しょ,sho,combo,77
ちゃ,cha,combo,78
ちゅ,chu,combo,79
ちょ,cho,combo,80
にゃ,nya,combo,81
にゅ,nyu,combo,82
にょ,nyo,combo,83
ひゃ,hya,combo,84
ひゅ,hyu,combo,85
ひょ,hyo,combo,86
みゃ,mya,combo,87
みゅ,myu,combo,88
みょ,myo,combo,89
りゃ,rya,combo,90
りゅ,ryu,combo,91
りょ,ryo,combo,92
ぎゃ,gya,combo,93
ぎゅ,gyu,combo,94
ぎょ,gyo,combo,95
じゃ,ja,combo,96
じゅ,ju,combo,97
じょ,jo,combo,98
びゃ,bya,combo,99
びゅ,byu,combo,100
びょ,byo,combo,101
ぴゃ,pya,combo,102
ぴゅ,pyu,combo,103
ぴょ,pyo,combo,104
```

**What the types mean:**

- `basic`: Core 46 hiragana characters
- `dakuten`: Characters with diacritics (゛ or ゜)
- `combo`: Combination characters (two characters that form one sound)

### 3.2.4 Katakana CSV

Create `prisma/data/katakana.csv` (same structure as hiragana):

```csv
character,romaji,type,order
ア,a,basic,1
イ,i,basic,2
ウ,u,basic,3
エ,e,basic,4
オ,o,basic,5
カ,ka,basic,6
キ,ki,basic,7
ク,ku,basic,8
ケ,ke,basic,9
コ,ko,basic,10
(... continue with all katakana ...)
```

### 3.3 Create Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

const prisma = new PrismaClient();

interface VocabCSVRow {
  word: string;
  reading: string;
  definition: string;
  type: string;
  category?: string;
  lessonNumber: string;
  order: string;
  exampleSentence?: string;
}

interface KanjiCSVRow {
  kanji: string;
  definition: string;
  onyomi?: string;
  kunyomi?: string;
  strokeCount?: string;
  jlptLevel?: string;
  lessonNumber: string;
}

interface KanaCSVRow {
  character: string;
  romaji: string;
  type: string;
  order: string;
}

async function seedLessons() {
  console.log("🌱 Seeding lessons...");

  const lessons = [
    {
      number: 1,
      title: "New Friends",
      slug: "lesson-1",
      description: "Greetings and self-introduction",
      locked: false, // Unlock first lesson
    },
    {
      number: 2,
      title: "Shopping",
      slug: "lesson-2",
      description: "Shopping expressions and numbers",
      locked: true,
    },
    {
      number: 3,
      title: "Making a Date",
      slug: "lesson-3",
      description: "Describing activities and time",
      locked: true,
    },
    {
      number: 4,
      title: "The First Date",
      slug: "lesson-4",
      description: "Talking about daily activities",
      locked: true,
    },
    {
      number: 5,
      title: "A Trip to Okinawa",
      slug: "lesson-5",
      description: "Travel and adjectives",
      locked: true,
    },
  ];

  await prisma.lesson.createMany({
    data: lessons,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${lessons.length} lessons`);
  return lessons;
}

async function seedVocabulary() {
  console.log("🌱 Seeding vocabulary...");

  const csvPath = path.join(__dirname, "data", "vocabulary.csv");

  if (!fs.existsSync(csvPath)) {
    console.log("⚠️  vocabulary.csv not found, skipping");
    return;
  }

  const csvFile = fs.readFileSync(csvPath, "utf8");

  const { data, errors } = Papa.parse<VocabCSVRow>(csvFile, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (errors.length > 0) {
    console.error("❌ CSV parsing errors:", errors);
    return;
  }

  console.log(`📖 Parsed ${data.length} vocabulary entries`);

  // Group by lesson
  const lessonMap = new Map<number, VocabCSVRow[]>();
  data.forEach((row) => {
    const lessonNum = parseInt(row.lessonNumber);
    if (!lessonMap.has(lessonNum)) {
      lessonMap.set(lessonNum, []);
    }
    lessonMap.get(lessonNum)!.push(row);
  });

  // Insert by lesson
  for (const [lessonNum, vocabRows] of lessonMap) {
    const lesson = await prisma.lesson.findFirst({
      where: { number: lessonNum },
    });

    if (!lesson) {
      console.warn(`⚠️  Lesson ${lessonNum} not found, skipping vocab`);
      continue;
    }

    const vocabData = vocabRows.map((row) => ({
      word: row.word.trim(),
      reading: row.reading.trim(),
      definition: row.definition.trim(),
      type: row.type.trim(),
      category: row.category?.trim() || null,
      lessonId: lesson.id,
      order: parseInt(row.order),
      exampleSentence: row.exampleSentence?.trim() || null,
    }));

    await prisma.vocabEntry.createMany({
      data: vocabData,
      skipDuplicates: true,
    });

    console.log(
      `✅ Seeded ${vocabData.length} vocab entries for Lesson ${lessonNum}`
    );
  }
}

async function seedKanji() {
  console.log("🌱 Seeding kanji...");

  const csvPath = path.join(__dirname, "data", "kanji.csv");

  if (!fs.existsSync(csvPath)) {
    console.log("⚠️  kanji.csv not found, skipping");
    return;
  }

  const csvFile = fs.readFileSync(csvPath, "utf8");

  const { data, errors } = Papa.parse<KanjiCSVRow>(csvFile, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  if (errors.length > 0) {
    console.error("❌ CSV parsing errors:", errors);
    return;
  }

  console.log(`📖 Parsed ${data.length} kanji entries`);

  for (const row of data) {
    const lessonNum = parseInt(row.lessonNumber);
    const lesson = await prisma.lesson.findFirst({
      where: { number: lessonNum },
    });

    if (!lesson) continue;

    try {
      await prisma.kanjiEntry.create({
        data: {
          kanji: row.kanji.trim(),
          definition: row.definition.trim(),
          onyomi: row.onyomi ? row.onyomi.split(",").map((s) => s.trim()) : [],
          kunyomi: row.kunyomi
            ? row.kunyomi.split(",").map((s) => s.trim())
            : [],
          strokeCount: row.strokeCount ? parseInt(row.strokeCount) : null,
          jlptLevel: row.jlptLevel ? parseInt(row.jlptLevel) : null,
          lessonId: lesson.id,
        },
      });
    } catch (error) {
      // Skip duplicates
    }
  }

  console.log(`✅ Seeded kanji`);
}

async function seedHiragana() {
  console.log("🌱 Seeding hiragana...");

  const csvPath = path.join(__dirname, "data", "hiragana.csv");

  if (!fs.existsSync(csvPath)) {
    console.log("⚠️  hiragana.csv not found, skipping");
    return;
  }

  const csvFile = fs.readFileSync(csvPath, "utf8");

  const { data, errors } = Papa.parse<KanaCSVRow>(csvFile, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    console.error("❌ CSV parsing errors:", errors);
    return;
  }

  const hiraganaData = data.map((row) => ({
    character: row.character.trim(),
    romaji: row.romaji.trim(),
    type: row.type.trim(),
    order: parseInt(row.order),
  }));

  await prisma.hiraganaEntry.createMany({
    data: hiraganaData,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${hiraganaData.length} hiragana`);
}

async function seedKatakana() {
  console.log("🌱 Seeding katakana...");

  const csvPath = path.join(__dirname, "data", "katakana.csv");

  if (!fs.existsSync(csvPath)) {
    console.log("⚠️  katakana.csv not found, skipping");
    return;
  }

  const csvFile = fs.readFileSync(csvPath, "utf8");

  const { data, errors } = Papa.parse<KanaCSVRow>(csvFile, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    console.error("❌ CSV parsing errors:", errors);
    return;
  }

  const katakanaData = data.map((row) => ({
    character: row.character.trim(),
    romaji: row.romaji.trim(),
    type: row.type.trim(),
    order: parseInt(row.order),
  }));

  await prisma.katakanaEntry.createMany({
    data: katakanaData,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${katakanaData.length} katakana`);
}

async function main() {
  console.log("🚀 Starting database seed...\n");

  try {
    await seedLessons();
    await seedVocabulary();
    await seedKanji();
    await seedHiragana();
    await seedKatakana();

    console.log("\n✨ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**What's happening:**

**1. PapaParser Options:**

- `header: true`: First row is headers
- `skipEmptyLines: true`: Ignore blank rows
- `transformHeader`: Trims whitespace from headers

**2. Error Handling:**

- Checks if CSV files exist before parsing
- Logs CSV parsing errors
- Continues if one CSV fails (doesn't crash entire seed)

**3. Duplicate Handling:**

- `createMany({ skipDuplicates: true })`: Ignores duplicate entries
- For kanji: Try-catch to skip duplicate unique keys

**4. Data Transformation:**

- Splits comma-separated onyomi/kunyomi readings
- Parses string numbers to integers
- Trims whitespace from all strings

### 3.4 Update package.json

Add seed script:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

### 3.5 Run Seed Script

```bash
npm run seed
```

**Expected output:**

```
🚀 Starting database seed...

🌱 Seeding lessons...
✅ Seeded 5 lessons
🌱 Seeding vocabulary...
📖 Parsed 60 vocabulary entries
✅ Seeded 60 vocab entries for Lesson 1
🌱 Seeding kanji...
📖 Parsed 15 kanji entries
✅ Seeded kanji
🌱 Seeding hiragana...
✅ Seeded 104 hiragana
🌱 Seeding katakana...
✅ Seeded 104 katakana

✨ Seeding completed successfully!
```

### 3.6 Verify Seeded Data

Open Prisma Studio:

```bash
npx prisma studio
```

**Check:**

- Lesson table: 5 lessons
- VocabEntry table: 60+ entries
- KanjiEntry table: 15+ entries
- HiraganaEntry table: 104 entries
- KatakanaEntry table: 104 entries

---

## Checkpoint: What We've Built So Far

At this point, you have:

✅ **Step 0**: Cleaned up old code, removed Python backend  
✅ **Step 1**: Complete database schema with 10 models  
✅ **Step 2**: Full authentication system (email + Google OAuth)  
✅ **Step 3**: CSV-based database seeding with 288+ entries

**You can:**

- Sign up and log in
- Access protected routes
- View seeded data in Prisma Studio
- Run efficient bulk imports

**Next steps:**

- Step 4: SRS Flashcard System (review vocab with spaced repetition)
- Step 5: Quiz System (test kana/kanji knowledge)
- Step 6: AI Tutor (chat with Gemini AI)
- Step 7: Polish & Deploy

---

## Step 4: SRS Flashcard System

**Estimated Time:** 4-5 hours  
**Goal:** Implement spaced repetition flashcards with the SM-2 algorithm

### 4.1 Create SRS Algorithm Utility

The SM-2 (SuperMemo 2) algorithm determines when a user should review a card next based on their performance.

```typescript
// src/lib/srs-algorithm.ts

export interface SRSResult {
  newSrsLevel: number;
  newEaseFactor: number;
  newInterval: number;
  nextReviewAt: Date;
}

export type Rating = "again" | "hard" | "good" | "easy";

/**
 * Calculates the next review date for a flashcard using SM-2 algorithm
 *
 * @param currentLevel - Current SRS level (0-8)
 * @param easeFactor - Current ease factor (1.3-3.0)
 * @param interval - Current interval in days
 * @param rating - User's rating of their recall
 * @returns Updated SRS parameters and next review date
 */
export function calculateNextReview(
  currentLevel: number,
  easeFactor: number,
  interval: number,
  rating: Rating
): SRSResult {
  let newLevel = currentLevel;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  // Calculate new ease factor based on rating
  if (rating === "again") {
    // Failed recall - reset to learning stage
    newLevel = 0;
    newInterval = 0;
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  } else if (rating === "hard") {
    // Difficult recall - small penalty
    newEaseFactor = Math.max(1.3, easeFactor - 0.15);
    newInterval = Math.max(1, Math.floor(interval * 1.2));
    newLevel = Math.min(currentLevel + 1, 8);
  } else if (rating === "good") {
    // Normal recall - standard progression
    if (currentLevel === 0) {
      newInterval = 1; // First review: 1 day
    } else if (currentLevel === 1) {
      newInterval = 3; // Second review: 3 days
    } else {
      newInterval = Math.ceil(interval * easeFactor);
    }
    newLevel = Math.min(currentLevel + 1, 8);
  } else if (rating === "easy") {
    // Easy recall - bonus
    newEaseFactor = Math.min(3.0, easeFactor + 0.15);
    if (currentLevel === 0) {
      newInterval = 4; // Skip ahead
    } else {
      newInterval = Math.ceil(interval * easeFactor * 1.3);
    }
    newLevel = Math.min(currentLevel + 2, 8);
  }

  // Calculate next review date
  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    newSrsLevel: newLevel,
    newEaseFactor,
    newInterval,
    nextReviewAt,
  };
}

/**
 * Checks if a card is due for review
 */
export function isDue(nextReviewAt: Date): boolean {
  return new Date() >= nextReviewAt;
}

/**
 * Gets a user-friendly label for SRS level
 */
export function getLevelLabel(level: number): string {
  if (level === 0) return "New";
  if (level <= 2) return "Learning";
  if (level <= 5) return "Young";
  if (level <= 7) return "Mature";
  return "Mastered";
}
```

**What's happening:**

**SM-2 Algorithm Breakdown:**

1. **Again (Failed Recall):**

   - Reset to level 0 (start over)
   - Decrease ease factor (card is harder for this user)
   - Review in 10 minutes (or immediately)

2. **Hard (Difficult Recall):**

   - Small penalty to ease factor
   - Slightly increase interval (20% increase)
   - Move up one level slowly

3. **Good (Normal Recall):**

   - Standard progression: 1 day → 3 days → ease factor × current interval
   - Move up one level
   - This is the expected progression

4. **Easy (Perfect Recall):**
   - Bonus to ease factor (card is easier for this user)
   - Skip ahead more aggressively (1.3× multiplier)
   - Can jump two levels

**Ease Factor:**

- Personal difficulty multiplier for each card
- Starts at 2.5 (default)
- Decreases with failures (min 1.3)
- Increases with easy recalls (max 3.0)

**SRS Levels:**

- 0: New (never reviewed)
- 1-2: Learning (short intervals)
- 3-5: Young (medium intervals: weeks)
- 6-7: Mature (long intervals: months)
- 8: Mastered (very long intervals)

### 4.2 Create Zustand Store for Review Session

```typescript
// src/stores/review-store.ts
import { create } from "zustand";

export interface ReviewCard {
  id: string;
  word: string;
  reading: string;
  definition: string;
  type: string;
  category?: string;
  // SRS data
  srsLevel: number;
  easeFactor: number;
  interval: number;
  nextReviewAt: Date;
}

interface ReviewState {
  // Session data
  cards: ReviewCard[];
  currentIndex: number;
  isFlipped: boolean;
  sessionActive: boolean;

  // Progress tracking
  reviewedCount: number;
  correctCount: number;

  // Actions
  startSession: (cards: ReviewCard[]) => void;
  flipCard: () => void;
  rateCard: (rating: "again" | "hard" | "good" | "easy") => void;
  nextCard: () => void;
  endSession: () => void;

  // Getters
  getCurrentCard: () => ReviewCard | null;
  getProgress: () => { current: number; total: number; percentage: number };
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  cards: [],
  currentIndex: 0,
  isFlipped: false,
  sessionActive: false,
  reviewedCount: 0,
  correctCount: 0,

  startSession: (cards) => {
    // Shuffle cards for variety
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    set({
      cards: shuffled,
      currentIndex: 0,
      isFlipped: false,
      sessionActive: true,
      reviewedCount: 0,
      correctCount: 0,
    });
  },

  flipCard: () => {
    set({ isFlipped: true });
  },

  rateCard: (rating) => {
    const { reviewedCount, correctCount } = get();
    const isCorrect = rating === "good" || rating === "easy";

    set({
      reviewedCount: reviewedCount + 1,
      correctCount: isCorrect ? correctCount + 1 : correctCount,
    });
  },

  nextCard: () => {
    const { currentIndex, cards } = get();
    if (currentIndex < cards.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        isFlipped: false,
      });
    } else {
      // Session complete
      set({ sessionActive: false });
    }
  },

  endSession: () => {
    set({
      cards: [],
      currentIndex: 0,
      isFlipped: false,
      sessionActive: false,
      reviewedCount: 0,
      correctCount: 0,
    });
  },

  getCurrentCard: () => {
    const { cards, currentIndex } = get();
    return cards[currentIndex] || null;
  },

  getProgress: () => {
    const { reviewedCount, cards } = get();
    const total = cards.length;
    const percentage =
      total > 0 ? Math.round((reviewedCount / total) * 100) : 0;
    return { current: reviewedCount, total, percentage };
  },
}));
```

**What's happening:**

**Zustand Benefits:**

- Global state accessible from any component
- No Provider wrapper needed
- Simple API: `useReviewStore()` hook
- Automatic re-renders when state changes

**State Management:**

- `cards`: All cards in current review session
- `currentIndex`: Which card we're showing
- `isFlipped`: Front (word) or back (definition) visible
- `reviewedCount`: How many cards rated this session
- `correctCount`: How many marked as "good" or "easy"

**Actions:**

- `startSession()`: Initialize with shuffled cards
- `flipCard()`: Reveal answer
- `rateCard()`: Record user rating
- `nextCard()`: Move to next card or end session
- `endSession()`: Reset state

### 4.3 Create Flashcard Component

```typescript
// src/components/flashcard/VocabCard.tsx
"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface VocabCardProps {
  word: string;
  reading: string;
  definition: string;
  type: string;
  category?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function VocabCard({
  word,
  reading,
  definition,
  type,
  category,
  isFlipped,
  onFlip,
}: VocabCardProps) {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="perspective-1000">
        <motion.div
          className="relative w-full cursor-pointer"
          onClick={onFlip}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front Side */}
          <div
            className="absolute inset-0 w-full h-96 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8"
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <div className="text-center">
              <p className="text-white/70 text-sm uppercase tracking-wider mb-4">
                {category || type}
              </p>
              <h2 className="text-7xl font-bold text-white mb-4">{word}</h2>
              <p className="text-3xl text-white/90">{reading}</p>
            </div>
            <p className="absolute bottom-8 text-white/50 text-sm">
              Click to reveal →
            </p>
          </div>

          {/* Back Side */}
          <div
            className="w-full h-96 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center">
              <p className="text-white/70 text-sm uppercase tracking-wider mb-4">
                Definition
              </p>
              <h3 className="text-5xl font-bold text-white mb-4">
                {definition}
              </h3>
              <div className="mt-8 space-y-2">
                <p className="text-2xl text-white/90">{word}</p>
                <p className="text-xl text-white/70">{reading}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
```

**What's happening:**

**Framer Motion 3D Flip:**

1. `perspective-1000`: CSS class for 3D depth (add to globals.css)
2. `rotateY: isFlipped ? 180 : 0`: Rotates card on Y axis
3. `transformStyle: 'preserve-3d'`: Enables 3D rendering
4. `backfaceVisibility: 'hidden'`: Hides back side when facing away
5. Back side has `transform: 'rotateY(180deg)'` so it's initially rotated

**Visual Design:**

- Front: Blue gradient, shows Japanese word
- Back: Green gradient, shows English definition
- Large, readable typography
- Category/type labels
- Smooth spring animation (feels natural)

### 4.4 Add CSS for 3D Perspective

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add this at the end */
@layer utilities {
  .perspective-1000 {
    perspective: 1000px;
  }
}
```

### 4.5 Create Rating Buttons Component

```typescript
// src/components/flashcard/RatingButtons.tsx
"use client";

import { motion } from "framer-motion";

interface RatingButtonsProps {
  onRate: (rating: "again" | "hard" | "good" | "easy") => void;
  disabled?: boolean;
}

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export function RatingButtons({ onRate, disabled }: RatingButtonsProps) {
  return (
    <div className="flex gap-4 justify-center mt-8">
      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => onRate("again")}
        disabled={disabled}
        className="px-6 py-4 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <div className="text-center">
          <div className="text-2xl mb-1">😞</div>
          <div>Again</div>
          <div className="text-xs mt-1 opacity-75">&lt;10m</div>
        </div>
      </motion.button>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => onRate("hard")}
        disabled={disabled}
        className="px-6 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <div className="text-center">
          <div className="text-2xl mb-1">🤔</div>
          <div>Hard</div>
          <div className="text-xs mt-1 opacity-75">&lt;1d</div>
        </div>
      </motion.button>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => onRate("good")}
        disabled={disabled}
        className="px-6 py-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <div className="text-center">
          <div className="text-2xl mb-1">😊</div>
          <div>Good</div>
          <div className="text-xs mt-1 opacity-75">Normal</div>
        </div>
      </motion.button>

      <motion.button
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
        onClick={() => onRate("easy")}
        disabled={disabled}
        className="px-6 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
      >
        <div className="text-center">
          <div className="text-2xl mb-1">🎉</div>
          <div>Easy</div>
          <div className="text-xs mt-1 opacity-75">Bonus</div>
        </div>
      </motion.button>
    </div>
  );
}
```

**What's happening:**

**Button Design:**

- Color-coded: Red (fail) → Orange (hard) → Green (good) → Blue (easy)
- Emojis for quick visual recognition
- Shows next review estimate (e.g., "<10m", "<1d")
- Hover/tap animations with Framer Motion
- Disabled state when no card is showing

### 4.6 Create Review API Route

```typescript
// src/app/api/vocab/review/route.ts
import { prisma } from "@/lib/db";
import { calculateNextReview } from "@/lib/srs-algorithm";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user from Prisma
    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse request body
    const { vocabId, rating } = await request.json();

    if (!vocabId || !rating) {
      return NextResponse.json(
        { error: "Missing vocabId or rating" },
        { status: 400 }
      );
    }

    // Get or create progress record
    let progress = await prisma.userVocabProgress.findUnique({
      where: {
        userId_vocabId: {
          userId: user.id,
          vocabId,
        },
      },
    });

    if (!progress) {
      // First time reviewing this word
      progress = await prisma.userVocabProgress.create({
        data: {
          userId: user.id,
          vocabId,
          srsLevel: 0,
          easeFactor: 2.5,
          interval: 0,
          nextReviewAt: new Date(),
        },
      });
    }

    // Calculate next review using SM-2
    const srsResult = calculateNextReview(
      progress.srsLevel,
      progress.easeFactor,
      progress.interval,
      rating
    );

    // Update progress
    const isCorrect = rating === "good" || rating === "easy";
    const updatedProgress = await prisma.userVocabProgress.update({
      where: { id: progress.id },
      data: {
        srsLevel: srsResult.newSrsLevel,
        easeFactor: srsResult.newEaseFactor,
        interval: srsResult.newInterval,
        nextReviewAt: srsResult.nextReviewAt,
        lastReviewedAt: new Date(),
        reviewCount: { increment: 1 },
        correctStreak: isCorrect ? { increment: 1 } : 0,
        totalReviews: { increment: 1 },
        correctReviews: isCorrect ? { increment: 1 } : progress.correctReviews,
      },
    });

    return NextResponse.json({
      success: true,
      progress: updatedProgress,
      nextReview: srsResult.nextReviewAt,
    });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json(
      { error: "Failed to process review" },
      { status: 500 }
    );
  }
}
```

**What's happening:**

**1. Authentication:**

- Gets Supabase user from session
- Looks up corresponding Prisma user

**2. Find or Create Progress:**

- `findUnique()` with composite key `[userId, vocabId]`
- If first review, creates new record with defaults

**3. Calculate SRS:**

- Calls our SM-2 algorithm
- Gets new level, ease factor, interval, next review date

**4. Update Database:**

- Saves SRS results
- Increments counters: `reviewCount`, `totalReviews`
- Updates `correctStreak` (resets to 0 if incorrect)
- Uses `{ increment: 1 }` for atomic updates

### 4.7 Create API Route to Get Due Cards

```typescript
// src/app/api/lessons/[lessonId]/due-cards/route.ts
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { lessonId } = params;

    // Get all vocab for this lesson with user progress
    const vocab = await prisma.vocabEntry.findMany({
      where: { lessonId },
      include: {
        userProgress: {
          where: { userId: user.id },
        },
      },
      orderBy: { order: "asc" },
    });

    // Filter to only cards due for review
    const now = new Date();
    const dueCards = vocab
      .filter((v) => {
        if (v.userProgress.length === 0) {
          // New card - include it
          return true;
        }
        const progress = v.userProgress[0];
        // Due if nextReviewAt is in the past
        return progress.nextReviewAt <= now;
      })
      .map((v) => ({
        id: v.id,
        word: v.word,
        reading: v.reading,
        definition: v.definition,
        type: v.type,
        category: v.category,
        // Include SRS data if exists
        srsLevel: v.userProgress[0]?.srsLevel ?? 0,
        easeFactor: v.userProgress[0]?.easeFactor ?? 2.5,
        interval: v.userProgress[0]?.interval ?? 0,
        nextReviewAt: v.userProgress[0]?.nextReviewAt ?? now,
      }));

    return NextResponse.json({ cards: dueCards });
  } catch (error) {
    console.error("Due cards API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch due cards" },
      { status: 500 }
    );
  }
}
```

**What's happening:**

**1. Fetch Vocab with Progress:**

- Gets all vocab for the lesson
- Includes related `userProgress` (if exists)
- Filters by current user

**2. Filter Due Cards:**

- New cards (no progress): Always due
- Existing cards: Check if `nextReviewAt <= now`

**3. Transform Data:**

- Combines vocab data with SRS data
- Returns flat structure ready for frontend

### 4.8 Create Review Session Page

```typescript
// src/app/lessons/[slug]/review/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useReviewStore, type ReviewCard } from '@/stores/review-store'
import { VocabCard } from '@/components/flashcard/VocabCard'
import { RatingButtons } from '@/components/flashcard/RatingButtons'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ReviewPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [lessonId, setLessonId] = useState<string | null>(null)

  const {
    cards,
    currentIndex,
    isFlipped,
    sessionActive,
    reviewedCount,
    correctCount,
    startSession,
    flipCard,
    rateCard,
    nextCard,
    endSession,
    getCurrentCard,
    getProgress,
  } = useReviewStore()

  const currentCard = getCurrentCard()
  const progress = getProgress()

  // Fetch lesson and due cards
  useEffect(() => {
    async function fetchDueCards() {
      try {
        // First get lesson by slug
        const lessonRes = await fetch(`/api/lessons?slug=${params.slug}`)
        const { lesson } = await lessonRes.json()

        if (!lesson) {
          toast.error('Lesson not found')
          router.push('/lessons')
          return
        }

        setLessonId(lesson.id)

        // Then get due cards for this lesson
        const cardsRes = await fetch(`/api/lessons/${lesson.id}/due-cards`)
        const { cards: dueCards } = await cardsRes.json()

        if (dueCards.length === 0) {
          toast('No cards due for review!', { icon: '✨' })
          router.push(`/lessons/${params.slug}`)
          return
        }

        startSession(dueCards)
      } catch (error) {
        console.error('Failed to fetch due cards:', error)
        toast.error('Failed to load review session')
      } finally {
        setLoading(false)
      }
    }

    fetchDueCards()
  }, [params.slug, router, startSession])

  const handleRate = async (rating: 'again' | 'hard' | 'good' | 'easy') => {
    if (!currentCard) return

    try {
      // Submit review to API
      const response = await fetch('/api/vocab/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vocabId: currentCard.id,
          rating,
        }),
      })

      if (!response.ok) throw new Error('Review submission failed')

      // Update local state
      rateCard(rating)

      // Show feedback
      const isCorrect = rating === 'good' || rating === 'easy'
      if (isCorrect) {
        toast.success('Nice!')
      } else if (rating === 'hard') {
        toast('Keep practicing!', { icon: '💪' })
      } else {
        toast('You'll get it next time!', { icon: '📚' })
      }

      // Move to next card after short delay
      setTimeout(() => {
        nextCard()
      }, 500)
    } catch (error) {
      console.error('Failed to submit review:', error)
      toast.error('Failed to save review')
    }
  }

  // Session complete
  useEffect(() => {
    if (!sessionActive && reviewedCount > 0) {
      const accuracy = Math.round((correctCount / reviewedCount) * 100)
      toast.success(`Session complete! Accuracy: ${accuracy}%`)
      setTimeout(() => {
        router.push(`/lessons/${params.slug}`)
      }, 2000)
    }
  }, [sessionActive, reviewedCount, correctCount, router, params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review session...</p>
        </div>
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-bold mb-4">No cards to review!</p>
          <button
            onClick={() => router.push('/lessons')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Progress Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Review Session</h1>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to end this session?')) {
                endSession()
                router.push(`/lessons/${params.slug}`)
              }
            }}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            End Session
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {progress.current} / {progress.total}
          </span>
        </div>
      </div>

      {/* Flashcard */}
      <VocabCard
        word={currentCard.word}
        reading={currentCard.reading}
        definition={currentCard.definition}
        type={currentCard.type}
        category={currentCard.category}
        isFlipped={isFlipped}
        onFlip={flipCard}
      />

      {/* Rating Buttons (only show after flipping) */}
      {isFlipped && (
        <RatingButtons onRate={handleRate} />
      )}

      {/* Instructions */}
      {!isFlipped && (
        <p className="text-center text-gray-500 mt-8">
          Click the card to reveal the answer
        </p>
      )}
    </div>
  )
}
```

**What's happening:**

**Review Flow:**

```
Page loads
  ↓
Fetch lesson by slug
  ↓
Fetch due cards for lesson
  ↓
If no cards: Redirect with message
  ↓
If cards exist: Start session (shuffle cards)
  ↓
Show first card (front side)
  ↓
User clicks card → Flip to back
  ↓
User rates card → Submit to API
  ↓
Update local state → Show toast feedback
  ↓
After 500ms: Move to next card
  ↓
Repeat until all cards reviewed
  ↓
Show completion message
  ↓
After 2s: Redirect to lesson page
```

**State Management:**

- Uses Zustand store for session state
- Local state for loading and lessonId
- Progress bar updates in real-time
- "End Session" button with confirmation

### 4.9 Create Lessons API Route

We need an endpoint to get lesson by slug:

```typescript
// src/app/api/lessons/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      // Get single lesson by slug
      const lesson = await prisma.lesson.findUnique({
        where: { slug },
        include: {
          vocab: {
            orderBy: { order: "asc" },
          },
          kanji: true,
        },
      });

      if (!lesson) {
        return NextResponse.json(
          { error: "Lesson not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ lesson });
    } else {
      // Get all lessons
      const lessons = await prisma.lesson.findMany({
        orderBy: { number: "asc" },
        include: {
          _count: {
            select: {
              vocab: true,
              kanji: true,
            },
          },
        },
      });

      return NextResponse.json({ lessons });
    }
  } catch (error) {
    console.error("Lessons API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}
```

### 4.10 Update Lessons Page to Show Review Button

```typescript
// src/app/lessons/[slug]/page.tsx
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";

export default async function LessonDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { supabaseId: supabaseUser.id },
  });

  const lesson = await prisma.lesson.findUnique({
    where: { slug: params.slug },
    include: {
      vocab: {
        include: {
          userProgress: {
            where: { userId: user!.id },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  if (!lesson) {
    redirect("/lessons");
  }

  // Count due cards
  const now = new Date();
  const dueCount = lesson.vocab.filter((v) => {
    if (v.userProgress.length === 0) return true;
    return v.userProgress[0].nextReviewAt <= now;
  }).length;

  return (
    <div className="min-h-screen">
      <Header userEmail={supabaseUser.email!} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
          <p className="text-gray-600">{lesson.description}</p>
        </div>

        {/* Review Section */}
        {dueCount > 0 && (
          <Link
            href={`/lessons/${params.slug}/review`}
            className="block mb-8 p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-2">Review Time!</h2>
            <p>
              {dueCount} card{dueCount !== 1 ? "s" : ""} due for review
            </p>
          </Link>
        )}

        {/* Vocabulary List */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Vocabulary</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lesson.vocab.map((v) => {
              const progress = v.userProgress[0];
              const level = progress?.srsLevel ?? 0;

              return (
                <div
                  key={v.id}
                  className="p-4 bg-white rounded-lg shadow border-l-4"
                  style={{
                    borderLeftColor:
                      level === 0
                        ? "#6b7280" // gray
                        : level <= 2
                        ? "#f59e0b" // orange
                        : level <= 5
                        ? "#3b82f6" // blue
                        : "#10b981", // green
                  }}
                >
                  <p className="text-2xl font-bold">{v.word}</p>
                  <p className="text-gray-600">{v.reading}</p>
                  <p className="mt-2">{v.definition}</p>
                  {progress && (
                    <p className="text-xs text-gray-500 mt-2">
                      Level: {level} | Next review:{" "}
                      {new Date(progress.nextReviewAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
```

**What's happening:**

**1. Server Component:**

- Fetches lesson data on the server
- Includes vocab with user progress
- Calculates due cards count

**2. Review Button:**

- Only shows if `dueCount > 0`
- Large, prominent call-to-action
- Links to review page

**3. Vocabulary List:**

- Color-coded by SRS level:
  - Gray: New (level 0)
  - Orange: Learning (1-2)
  - Blue: Young (3-5)
  - Green: Mature (6-8)
- Shows next review date

---

## Checkpoint: Steps 0-4 Complete

You now have:

✅ **Cleaned project** (Step 0)  
✅ **Database schema** (Step 1)  
✅ **Authentication** (Step 2)  
✅ **CSV seeding** (Step 3)  
✅ **SRS flashcards** (Step 4)

**You can:**

- Review vocabulary with spaced repetition
- See due cards count
- Track progress per card
- Beautiful card flip animations

**Next:** Steps 5-7 (Quiz System, AI Tutor, Deployment)

---

## Step 5: Quiz System

**Estimated Time:** 3-4 hours  
**Goal:** Create interactive quizzes for Hiragana, Katakana, and Kanji with instant feedback

### 5.1 Create Quiz Generator Utility

```typescript
// src/lib/quiz-generator.ts

export interface QuizQuestion {
  id: string;
  character: string;
  correctAnswer: string;
  options: string[]; // 4 options, shuffled
  type: "hiragana" | "katakana" | "kanji";
}

interface QuizItem {
  character: string;
  romaji?: string; // For kana
  definition?: string; // For kanji
}

/**
 * Generates a multiple-choice quiz from a list of items
 */
export function generateQuiz(
  items: QuizItem[],
  count: number = 10,
  type: "hiragana" | "katakana" | "kanji"
): QuizQuestion[] {
  // Shuffle and select random items
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, items.length));

  return selected.map((item, index) => {
    const correctAnswer = type === "kanji" ? item.definition! : item.romaji!;

    // Generate 3 incorrect options
    const incorrectOptions = shuffled
      .filter((other) => {
        const otherAnswer = type === "kanji" ? other.definition : other.romaji;
        return otherAnswer !== correctAnswer;
      })
      .slice(0, 3)
      .map((other) => (type === "kanji" ? other.definition! : other.romaji!));

    // Combine and shuffle all options
    const allOptions = [correctAnswer, ...incorrectOptions].sort(
      () => Math.random() - 0.5
    );

    return {
      id: `${type}-${index}`,
      character: item.character,
      correctAnswer,
      options: allOptions,
      type,
    };
  });
}

/**
 * Calculates quiz score and statistics
 */
export function calculateQuizStats(
  questions: QuizQuestion[],
  answers: Record<string, string>
) {
  let correct = 0;
  const total = questions.length;

  questions.forEach((q) => {
    if (answers[q.id] === q.correctAnswer) {
      correct++;
    }
  });

  const percentage = Math.round((correct / total) * 100);

  let grade: string;
  if (percentage >= 90) grade = "A";
  else if (percentage >= 80) grade = "B";
  else if (percentage >= 70) grade = "C";
  else if (percentage >= 60) grade = "D";
  else grade = "F";

  return {
    correct,
    total,
    percentage,
    grade,
  };
}
```

**What's happening:**

**Quiz Generation:**

1. Takes array of items (hiragana/katakana/kanji)
2. Randomly selects N items as questions
3. For each question:
   - Sets correct answer (romaji for kana, definition for kanji)
   - Selects 3 random incorrect answers from the same set
   - Shuffles all 4 options
4. Returns array of quiz questions

**Grade Calculation:**

- A: 90-100%
- B: 80-89%
- C: 70-79%
- D: 60-69%
- F: Below 60%

### 5.2 Create Quiz API Routes

```typescript
// src/app/api/quiz/[type]/generate/route.ts
import { prisma } from "@/lib/db";
import { generateQuiz } from "@/lib/quiz-generator";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get("count") || "10");
    const { type } = params;

    if (!["hiragana", "katakana", "kanji"].includes(type)) {
      return NextResponse.json({ error: "Invalid quiz type" }, { status: 400 });
    }

    let items: any[] = [];

    if (type === "hiragana") {
      items = await prisma.hiraganaEntry.findMany({
        orderBy: { order: "asc" },
      });
    } else if (type === "katakana") {
      items = await prisma.katakanaEntry.findMany({
        orderBy: { order: "asc" },
      });
    } else if (type === "kanji") {
      const lessonId = searchParams.get("lessonId");
      items = await prisma.kanjiEntry.findMany({
        where: lessonId ? { lessonId } : undefined,
        orderBy: { frequency: "asc" },
      });
    }

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No items found for quiz" },
        { status: 404 }
      );
    }

    const questions = generateQuiz(items, count, type as any);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/quiz/submit/route.ts
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { quizType, score, totalQuestions, timeSpent, lessonId } =
      await request.json();

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        quizType,
        lessonId: lessonId || null,
        score,
        totalQuestions,
        timeSpent,
      },
    });

    return NextResponse.json({ success: true, attempt });
  } catch (error) {
    console.error("Quiz submit error:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
```

### 5.3 Create Quiz Selection Page

```typescript
// src/app/quiz/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function QuizSelectionPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email!);
    }
    getUser();
  }, []);

  const quizTypes = [
    {
      type: "hiragana",
      title: "Hiragana Quiz",
      description: "Test your knowledge of 104 hiragana characters",
      emoji: "あ",
      color: "from-pink-500 to-rose-600",
    },
    {
      type: "katakana",
      title: "Katakana Quiz",
      description: "Test your knowledge of 104 katakana characters",
      emoji: "ア",
      color: "from-purple-500 to-indigo-600",
    },
    {
      type: "kanji",
      title: "Kanji Quiz",
      description: "Test your knowledge of kanji meanings",
      emoji: "漢",
      color: "from-blue-500 to-cyan-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {userEmail && <Header userEmail={userEmail} />}

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Choose Your Quiz</h1>
          <p className="text-xl text-gray-600">
            Test your Japanese knowledge with interactive quizzes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {quizTypes.map((quiz) => (
            <button
              key={quiz.type}
              onClick={() => router.push(`/quiz/${quiz.type}`)}
              className="group relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2"
            >
              <div
                className={`h-full p-8 bg-gradient-to-br ${quiz.color} text-white`}
              >
                <div className="text-8xl mb-4 group-hover:scale-110 transition-transform">
                  {quiz.emoji}
                </div>
                <h2 className="text-3xl font-bold mb-2">{quiz.title}</h2>
                <p className="text-white/90">{quiz.description}</p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="text-sm">Start Quiz</span>
                  <span className="group-hover:translate-x-2 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### 5.4 Create Quiz Interface Page

```typescript
// src/app/quiz/[type]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion } from "@/lib/quiz-generator";
import { calculateQuizStats } from "@/lib/quiz-generator";
import toast from "react-hot-toast";

export default function QuizPage({ params }: { params: { type: string } }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  const currentQuestion = questions[currentIndex];

  // Fetch quiz questions
  useEffect(() => {
    async function fetchQuiz() {
      try {
        const response = await fetch(
          `/api/quiz/${params.type}/generate?count=10`
        );
        const { questions: quizQuestions } = await response.json();
        setQuestions(quizQuestions);
      } catch (error) {
        toast.error("Failed to load quiz");
        router.push("/quiz");
      } finally {
        setLoading(false);
      }
    }
    fetchQuiz();
  }, [params.type, router]);

  const handleAnswer = (option: string) => {
    if (isAnswered) return;

    setSelectedAnswer(option);
    setIsAnswered(true);

    const correct = option === currentQuestion.correctAnswer;

    // Update answers
    setAnswers({
      ...answers,
      [currentQuestion.id]: option,
    });

    // Show feedback
    if (correct) {
      toast.success("Correct!", { duration: 1500 });
    } else {
      toast.error(`Incorrect! Answer: ${currentQuestion.correctAnswer}`, {
        duration: 2000,
      });
    }

    // Move to next question after delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
      } else {
        // Quiz complete
        finishQuiz();
      }
    }, 1500);
  };

  const finishQuiz = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    const stats = calculateQuizStats(questions, answers);

    // Submit quiz results
    try {
      await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizType: params.type,
          score: stats.correct,
          totalQuestions: stats.total,
          timeSpent,
        }),
      });
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    }

    // Navigate to results
    router.push(
      `/quiz/results?score=${stats.correct}&total=${stats.total}&percentage=${stats.percentage}&grade=${stats.grade}&time=${timeSpent}`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No questions available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(((currentIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-2xl p-12 mb-8"
          >
            <div className="text-center mb-8">
              <p className="text-gray-500 mb-4">What is this character?</p>
              <h2 className="text-9xl font-bold">
                {currentQuestion.character}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQuestion.correctAnswer;
                const showResult = isAnswered && (isSelected || isCorrect);

                let bgColor = "bg-gray-100 hover:bg-gray-200";
                if (showResult) {
                  if (isCorrect) {
                    bgColor = "bg-green-500 text-white";
                  } else if (isSelected && !isCorrect) {
                    bgColor = "bg-red-500 text-white";
                  }
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    disabled={isAnswered}
                    className={`p-6 rounded-xl font-semibold text-lg transition-colors ${bgColor} disabled:cursor-not-allowed`}
                    whileHover={{ scale: isAnswered ? 1 : 1.02 }}
                    whileTap={{ scale: isAnswered ? 1 : 0.98 }}
                  >
                    {option}
                    {showResult && isCorrect && " ✓"}
                    {showResult && isSelected && !isCorrect && " ✗"}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
```

**What's happening:**

**Quiz Flow:**

1. Fetch 10 random questions from API
2. Show first question with 4 options
3. User clicks answer
4. Immediate visual feedback (green/red)
5. Toast notification (correct/incorrect)
6. After 1.5s delay, move to next question
7. After last question, submit results and show summary

**Animations:**

- Framer Motion page transitions
- Progress bar fills smoothly
- Options scale on hover
- Color changes for feedback

### 5.5 Create Results Page

```typescript
// src/app/quiz/results/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function QuizResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const score = parseInt(searchParams.get("score") || "0");
  const total = parseInt(searchParams.get("total") || "10");
  const percentage = parseInt(searchParams.get("percentage") || "0");
  const grade = searchParams.get("grade") || "F";
  const time = parseInt(searchParams.get("time") || "0");

  // Celebrate if grade is A or B
  useEffect(() => {
    if (percentage >= 80) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [percentage]);

  const gradeColors: Record<string, string> = {
    A: "text-green-600",
    B: "text-blue-600",
    C: "text-yellow-600",
    D: "text-orange-600",
    F: "text-red-600",
  };

  const gradeMessages: Record<string, string> = {
    A: "Outstanding! 🌟",
    B: "Great job! 👏",
    C: "Good effort! 💪",
    D: "Keep practicing! 📚",
    F: "Don't give up! 🎯",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl w-full text-center"
      >
        <h1 className="text-4xl font-bold mb-8">Quiz Complete!</h1>

        {/* Grade Circle */}
        <div className="mb-8">
          <div
            className={`inline-flex items-center justify-center w-48 h-48 rounded-full border-8 ${gradeColors[grade]} border-current mb-4`}
          >
            <div>
              <div className="text-7xl font-bold">{grade}</div>
              <div className="text-2xl">{percentage}%</div>
            </div>
          </div>
          <p className="text-2xl font-semibold">{gradeMessages[grade]}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="p-4 bg-blue-50 rounded-xl">
            <p className="text-gray-600 text-sm">Score</p>
            <p className="text-3xl font-bold">
              {score}/{total}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <p className="text-gray-600 text-sm">Accuracy</p>
            <p className="text-3xl font-bold">{percentage}%</p>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-gray-600 text-sm">Time</p>
            <p className="text-3xl font-bold">{time}s</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.back()}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push("/quiz")}
            className="px-8 py-4 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
          >
            Back to Quizzes
          </button>
        </div>
      </motion.div>
    </div>
  );
}
```

**What's happening:**

**Results Display:**

- Large grade circle (A-F)
- Color-coded by performance
- Shows score, accuracy, time
- Motivational message
- Confetti animation for high scores (80%+)

**Confetti Package:**

```bash
npm install canvas-confetti
npm install --save-dev @types/canvas-confetti
```

---

## Step 6: AI Tutor Chatbot

**Estimated Time:** 2-3 hours  
**Goal:** Implement streaming AI chat with Gemini API for Japanese language help

### 6.1 Create Chat API Route

```typescript
// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    // Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    // System prompt to guide AI behavior
    const systemPrompt = `You are a friendly and knowledgeable Japanese language tutor. Your role is to help students learn Japanese vocabulary, grammar, and cultural context.

Guidelines:
- Always provide clear explanations in English
- Include romaji (romanization) when showing Japanese examples
- Give practical example sentences
- Explain cultural nuances when relevant
- If asked about topics unrelated to Japanese learning, politely redirect to language learning
- Keep responses concise (2-3 paragraphs maximum)
- Use encouraging tone to motivate learners
- When showing Japanese text, always include the romaji version
- Break down complex grammar into simple steps

Examples of good responses:
- "The particle は (wa) marks the topic of the sentence. For example: 私は学生です (watashi wa gakusei desu) means 'I am a student.' The は here indicates that '私' (I) is what we're talking about."
- "To say 'I want to...' in Japanese, use the -たい form. Take the verb stem and add たい. For example: 食べる (taberu - to eat) becomes 食べたい (tabetai - want to eat)."

Now help the student with their question.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Build conversation history
    const chat = model.startChat({
      history: messages.slice(0, -1).map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    });

    // Add system prompt context
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(
      systemPrompt + "\n\n" + lastMessage.content
    );

    const response = result.response;
    const text = response.text();

    return NextResponse.json({ text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 }
    );
  }
}
```

**What's happening:**

**System Prompt:**

- Defines AI's role as Japanese tutor
- Sets behavior guidelines
- Ensures responses stay on-topic
- Provides example response format

**Gemini Integration:**

- Uses `gemini-1.5-flash` (fast, efficient)
- `temperature: 0.7`: Balanced creativity
- `maxOutputTokens: 1000`: Limits response length
- Maintains conversation history

### 6.2 Create Chat UI Component

```typescript
// src/app/chat/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email!);
    }
    getUser();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const { text } = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Explain the difference between は and が",
    'How do I say "I want to..." in Japanese?',
    "What are the basic hiragana characters?",
    "Teach me how to introduce myself in Japanese",
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {userEmail && <Header userEmail={userEmail} />}

      <div className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h2 className="text-3xl font-bold mb-4">
                Japanese Language AI Tutor
              </h2>
              <p className="text-gray-600 mb-8">
                Ask me anything about Japanese! I can help with vocabulary,
                grammar, and cultural questions.
              </p>

              {/* Quick Prompts */}
              <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="p-4 bg-white rounded-xl text-left hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <p className="text-sm text-gray-700">{prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl rounded-2xl px-6 py-4 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-900 shadow-md border border-gray-200"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        AI
                      </div>
                      <span className="text-sm text-gray-500">Tutor</span>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs opacity-70 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="border-t bg-white p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about Japanese..."
                disabled={isLoading}
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

**What's happening:**

**Chat Interface:**

- Message bubbles (blue for user, white for AI)
- Auto-scroll to latest message
- Typing indicator while AI responds
- Quick prompt buttons for common questions

**State Management:**

- Local state for messages (no database saving yet)
- Loading state during API call
- Input validation (no empty messages)

---

## Step 7: Polish & Deployment

**Estimated Time:** 2-3 hours  
**Goal:** Add final touches and deploy to production

### 7.1 Create Landing Page

```typescript
// src/app/page.tsx
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, go to lessons
  if (user) {
    redirect("/lessons");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              Master Japanese with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                NihonGo
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Learn Japanese vocabulary, kanji, and grammar through interactive
              flashcards, quizzes, and AI-powered tutoring. Start your journey
              today!
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </Link>
              <Link
                href="/auth/login"
                className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <h2 className="text-4xl font-bold text-center mb-16">
          Everything You Need to Learn Japanese
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          <FeatureCard
            emoji="📚"
            title="SRS Flashcards"
            description="Master vocabulary with scientifically-proven spaced repetition"
          />
          <FeatureCard
            emoji="✍️"
            title="Interactive Quizzes"
            description="Test your knowledge of hiragana, katakana, and kanji"
          />
          <FeatureCard
            emoji="🤖"
            title="AI Tutor"
            description="Get instant help with grammar and cultural questions"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  emoji,
  title,
  description,
}: {
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
      <div className="text-6xl mb-4">{emoji}</div>
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
```

### 7.2 Environment Variables for Production

Update your `.env.local` for development and configure production environment variables in Vercel:

```env
# Production values (set in Vercel)
DATABASE_URL=your_production_database_url
DIRECT_URL=your_production_direct_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

### 7.3 Final Checklist

Before deploying, verify:

**Database:**

- [ ] All migrations applied: `npx prisma migrate deploy`
- [ ] Database seeded: `npm run seed`
- [ ] Prisma Client generated: `npx prisma generate`

**Environment:**

- [ ] All environment variables set in Vercel
- [ ] Supabase URL configuration includes production URL
- [ ] Google OAuth redirect URIs include production domain

**Code Quality:**

- [ ] No console.errors in production build
- [ ] All TypeScript errors resolved
- [ ] Linting passes: `npm run lint`
- [ ] Build succeeds: `npm run build`

**Testing:**

- [ ] Authentication flows work (email + Google)
- [ ] SRS reviews save correctly
- [ ] Quizzes submit results
- [ ] Chat responds properly
- [ ] Mobile responsive

### 7.4 Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

**Deployment Steps:**

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Post-Deployment:**

1. Run database migrations on production
2. Seed production database
3. Test all features
4. Monitor error logs

### 7.5 Optional Enhancements

**Performance:**

- Add loading skeletons instead of spinners
- Implement React Query for caching
- Optimize images with Next.js Image component

**Analytics:**

- Add Vercel Analytics
- Track quiz completion rates
- Monitor review session completion

**SEO:**

- Add metadata to all pages
- Create sitemap
- Add Open Graph images

---

## 🎉 Congratulations!

You've successfully built NihonGo, a complete Japanese language learning application with:

✅ **Authentication** (Email + Google OAuth)  
✅ **SRS Flashcards** (Spaced repetition vocabulary reviews)  
✅ **Interactive Quizzes** (Hiragana, Katakana, Kanji)  
✅ **AI Tutor** (Gemini-powered Japanese language help)  
✅ **Modern UI** (Framer Motion animations, Tailwind CSS)  
✅ **Production-Ready** (Deployed on Vercel)

---

## Next Steps

**Week 2+ Enhancements:**

1. **Gamification:**

   - Daily streak tracking
   - Achievement badges
   - Leaderboard

2. **Content:**

   - Add more Genki lessons (6-12)
   - Grammar explanations
   - Reading practice

3. **Social:**

   - Study groups
   - Friend challenges
   - Progress sharing

4. **Audio:**
   - Pronunciation recordings
   - Listening practice
   - Speech recognition

---

## Troubleshooting

**Common Issues:**

**1. "Invalid credentials" in Supabase**

- Check environment variables are set correctly
- Verify Supabase URL doesn't have trailing slash
- Ensure cookies are enabled

**2. "Prisma Client not generated"**

```bash
npx prisma generate
```

**3. "Quiz won't load"**

- Check database is seeded with hiragana/katakana
- Verify API route is working: visit `/api/quiz/hiragana/generate`

**4. "Chat doesn't respond"**

- Check Gemini API key is valid
- Verify API key has no extra spaces
- Check API quota not exceeded

**5. "Flashcards don't flip"**

- Verify Framer Motion is installed
- Check CSS perspective class is added
- Inspect browser console for errors

---

## Final Notes

This guide covered every step from cleanup to deployment. You now have a portfolio-ready application showcasing:

- **Modern React patterns** (Server Components, Client Components, Hooks)
- **Database design** (Prisma ORM, PostgreSQL)
- **Authentication** (Supabase Auth)
- **AI integration** (Google Gemini API)
- **Complex algorithms** (SM-2 spaced repetition)
- **Animations** (Framer Motion)
- **State management** (Zustand)
- **API design** (RESTful endpoints)

**Total Development Time:** ~20-25 hours over 7 days

Great job completing this comprehensive implementation! 🚀
