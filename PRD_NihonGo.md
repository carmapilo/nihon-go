# Product Requirements Document: NihonGo

## Japanese Language Learning Application

**Version:** 1.0  
**Created:** October 12, 2025  
**Timeline:** 1 Week Sprint  
**Status:** Planning Phase

---

## 1. Overview & Goals

### Vision

NihonGo is a modern web-based Japanese language learning application designed to help beginner learners master vocabulary, kanji, and conversational skills through an engaging, structured curriculum based on the Genki textbook series.

### Primary Objectives

- **Showcase Modern Web Development**: Demonstrate proficiency in Next.js 15, TypeScript, Supabase, and modern React patterns
- **Deliver Core Learning Features**: Provide flashcards, SRS-based learning, quizzes, and AI-powered tutoring
- **Launch within 1 Week**: Create an MVP with essential features that can be expanded post-launch
- **Data-Driven Learning**: Track user progress and optimize retention through spaced repetition

### Success Metrics

- User can complete authentication flow in under 2 minutes
- Users can study 50+ vocabulary items per lesson with SRS tracking
- Quiz completion rate of 70%+ per lesson
- AI Tutor provides relevant responses within 3 seconds
- Database seeded with Genki Lessons 1-5 (minimum)

---

## 2. User Personas

### Persona: Alex - The Motivated Beginner

**Demographics:**

- Age: 22-28
- Occupation: College student or young professional
- Tech-savviness: High
- Learning style: Visual learner, likes gamification

**Goals:**

- Learn Japanese for travel, anime, or career opportunities
- Study 20-30 minutes daily
- Track progress and see measurable improvement
- Get quick answers to grammar/usage questions

**Pain Points:**

- Overwhelmed by unstructured learning resources
- Forgets vocabulary without regular review
- Needs instant feedback to stay motivated
- Lacks access to native speaker practice

**User Journey:**

1. Signs up via Google OAuth
2. Starts with Lesson 1 vocabulary flashcards
3. Reviews cards daily based on SRS recommendations
4. Takes quizzes to test knowledge
5. Asks AI Tutor about confusing grammar points
6. Unlocks new lessons as proficiency grows

---

## 3. Technology Stack

### Current Stack

- **Frontend**: Next.js 15.3.3 (App Router), TypeScript, React 18
- **Styling**: Tailwind CSS 4, Radix UI components
- **Database**: Supabase (PostgreSQL)
- **ORM**: Prisma 6.10.1
- **Backend**: Next.js API Routes
- **AI**: Google Gemini API (currently in Python backend)

### Recommended Additions

#### Must-Have (Week 1)

1. **Framer Motion** (`framer-motion`)

   - **Purpose**: Smooth card flip animations, page transitions, quiz feedback
   - **Why**: Industry-standard animation library, lightweight, excellent TypeScript support
   - **Installation**: `npm install framer-motion`

2. **Supabase Auth** (Already included via `@supabase/supabase-js`)

   - **Purpose**: Email/password and OAuth authentication
   - **Configuration**: Need to add `@supabase/ssr` for server-side auth
   - **Installation**: `npm install @supabase/ssr @supabase/supabase-js`

3. **PapaParser** (`papaparse` + `@types/papaparse`)

   - **Purpose**: CSV parsing for efficient database seeding
   - **Why**: Faster than manual TypeScript data entry, handles large datasets
   - **Installation**: `npm install papaparse @types/papaparse`

4. **Zustand** (`zustand`)

   - **Purpose**: Lightweight state management for SRS state, user progress
   - **Why**: Simpler than Redux, no Context API boilerplate, 1KB bundle size
   - **Installation**: `npm install zustand`

5. **React Hot Toast** (`react-hot-toast`)

   - **Purpose**: User feedback notifications (success, errors, quiz results)
   - **Why**: Lightweight, beautiful defaults, easy to customize
   - **Installation**: `npm install react-hot-toast`

6. **Vercel AI SDK** (`ai`)
   - **Purpose**: Streaming AI responses from Gemini API in Next.js API routes
   - **Why**: Built for Next.js, handles streaming out-of-the-box, edge runtime support
   - **Installation**: `npm install ai @google/generative-ai`

#### Nice-to-Have (Post-Launch)

- **Recharts**: Progress visualization dashboard
- **React Query**: Server state management for API calls
- **Next-PWA**: Progressive Web App capabilities for offline study

---

## 4. Database Schema Updates

### Current Schema Analysis

Your existing Prisma schema includes:

- `Lesson`: Basic lesson metadata
- `VocabEntry`: Vocabulary with reading, definition, type
- `KanjiEntry`: Kanji characters with readings

### Required Schema Changes

#### 4.1 Add User Management

```prisma
model User {
  id              String            @id @default(cuid())
  email           String            @unique
  name            String?
  avatarUrl       String?
  supabaseId      String            @unique
  createdAt       DateTime          @default(now())
  lastLogin       DateTime          @default(now())

  // Relations
  vocabProgress   UserVocabProgress[]
  kanjiProgress   UserKanjiProgress[]
  quizAttempts    QuizAttempt[]
  chatHistory     ChatMessage[]
}
```

#### 4.2 Add SRS Tracking for Vocabulary

```prisma
model UserVocabProgress {
  id              String        @id @default(cuid())
  userId          String
  vocabId         String

  // SRS Algorithm Fields
  srsLevel        Int           @default(0)  // 0-8 (0=new, 8=mastered)
  easeFactor      Float         @default(2.5) // 1.3 - 3.0
  interval        Int           @default(0)   // Days until next review
  nextReviewAt    DateTime      @default(now())
  lastReviewedAt  DateTime?
  reviewCount     Int           @default(0)
  correctStreak   Int           @default(0)

  // Performance Metrics
  totalReviews    Int           @default(0)
  correctReviews  Int           @default(0)

  // Relations
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  vocab           VocabEntry    @relation(fields: [vocabId], references: [id], onDelete: Cascade)

  @@unique([userId, vocabId])
  @@index([userId, nextReviewAt])
}
```

#### 4.3 Add SRS Tracking for Kanji

```prisma
model UserKanjiProgress {
  id              String        @id @default(cuid())
  userId          String
  kanjiId         String

  // SRS Algorithm Fields (same as vocab)
  srsLevel        Int           @default(0)
  easeFactor      Float         @default(2.5)
  interval        Int           @default(0)
  nextReviewAt    DateTime      @default(now())
  lastReviewedAt  DateTime?
  reviewCount     Int           @default(0)
  correctStreak   Int           @default(0)

  // Performance Metrics
  totalReviews    Int           @default(0)
  correctReviews  Int           @default(0)

  // Relations
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  kanji           KanjiEntry    @relation(fields: [kanjiId], references: [id], onDelete: Cascade)

  @@unique([userId, kanjiId])
  @@index([userId, nextReviewAt])
}
```

#### 4.4 Add Kana Tables

```prisma
model HiraganaEntry {
  id              String        @id @default(cuid())
  character       String        @unique
  romaji          String
  type            String        // 'basic', 'dakuten', 'combo'
  order           Int
  quizAttempts    QuizAttempt[]
}

model KatakanaEntry {
  id              String        @id @default(cuid())
  character       String        @unique
  romaji          String
  type            String        // 'basic', 'dakuten', 'combo'
  order           Int
  quizAttempts    QuizAttempt[]
}
```

#### 4.5 Add Quiz System

```prisma
model QuizAttempt {
  id              String        @id @default(cuid())
  userId          String
  quizType        String        // 'vocab', 'kanji', 'hiragana', 'katakana'
  lessonId        String?       // Optional for lesson-specific quizzes

  // Quiz Data
  score           Int
  totalQuestions  Int
  completedAt     DateTime      @default(now())
  timeSpent       Int           // Seconds

  // Relations
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson          Lesson?       @relation(fields: [lessonId], references: [id])

  @@index([userId, quizType])
}
```

#### 4.6 Add AI Chat History

```prisma
model ChatMessage {
  id              String        @id @default(cuid())
  userId          String
  role            String        // 'user' or 'assistant'
  content         String        @db.Text
  createdAt       DateTime      @default(now())

  // Optional: Track conversation threads
  threadId        String?

  // Relations
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
}
```

#### 4.7 Update Existing Models

```prisma
model Lesson {
  id              String          @id @default(cuid())
  title           String
  slug            String          @unique
  description     String
  number          Int             @unique // Change from default(-1)
  locked          Boolean         @default(true)
  imageUrl        String?         // Lesson thumbnail
  estimatedTime   Int?            // Minutes to complete

  // Relations
  vocab           VocabEntry[]
  kanji           KanjiEntry[]
  quizAttempts    QuizAttempt[]
}

model VocabEntry {
  id              String                  @id @default(cuid())
  word            String
  reading         String
  definition      String
  type            String                  // 'noun', 'verb', 'adjective', etc.
  category        String?                 // Add this from your TypeScript data
  exampleSentence String?                 // Optional example usage
  audioUrl        String?                 // For future pronunciation feature
  order           Int
  lessonId        String

  // Relations
  lesson          Lesson                  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  userProgress    UserVocabProgress[]

  @@index([lessonId, order])
}

model KanjiEntry {
  id              String                  @id @default(cuid())
  kanji           String                  @unique
  definition      String
  onyomi          String[]                @default([])
  kunyomi         String[]                @default([])
  strokeCount     Int?
  jlptLevel       Int?                    // 1-5 (5=easiest)
  frequency       Int?                    // Usage frequency rank
  lessonId        String

  // Relations
  lesson          Lesson                  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  userProgress    UserKanjiProgress[]

  @@index([lessonId])
}
```

---

## 5. Core Features

### Feature 1: User Authentication

#### User Story

**As a new user**, I want to create an account and log in quickly using my email or Google account, so that I can access my personalized learning experience and track my progress across devices.

#### Acceptance Criteria

- ✅ User can sign up with email/password
- ✅ User receives email verification link (Supabase default)
- ✅ User can log in with Google OAuth (one-click)
- ✅ User can log in with existing email/password
- ✅ Protected routes redirect unauthenticated users to login page
- ✅ Authenticated users are redirected to dashboard
- ✅ User can log out and session is cleared
- ✅ Error messages display for failed authentication attempts
- ✅ Auth state persists across page refreshes

#### Technical Implementation Notes

**1. Setup Supabase Auth**

```bash
# Install required packages
npm install @supabase/supabase-js @supabase/ssr
```

**2. Configure Environment Variables**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

**3. Create Supabase Client Utilities**

- Create `lib/supabase/client.ts` for client-side auth
- Create `lib/supabase/server.ts` for server-side auth (App Router)
- Create `lib/supabase/middleware.ts` for route protection

**4. Setup Authentication Flow**

- **Sign Up Page** (`app/auth/signup/page.tsx`)
  - Email/password form with validation
  - Google OAuth button
  - Link to login page
- **Login Page** (`app/auth/login/page.tsx`)

  - Email/password form
  - Google OAuth button
  - "Forgot password" link
  - Link to signup page

- **Auth Callback** (`app/auth/callback/route.ts`)
  - Handle OAuth redirects
  - Create user record in database via API route

**5. Middleware for Protected Routes**

```typescript
// middleware.ts
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Check if user is authenticated
  // Redirect to /auth/login if not
  // Allow access to /lessons/* if authenticated
}

export const config = {
  matcher: ["/lessons/:path*", "/quiz/:path*", "/chat/:path*"],
};
```

**6. Database Sync**

- Create API route `/api/auth/sync` to create User record when new account is created
- Triggered after successful signup/first login
- Stores Supabase Auth `user.id` as `supabaseId` in Prisma

**7. UI Components**

- Auth forms with Tailwind CSS styling
- Loading states during authentication
- Error toast notifications using `react-hot-toast`

**Current Gap**: You don't have Supabase client setup or auth pages yet. Need to create the entire auth flow from scratch.

---

### Feature 2: Lesson-Based Vocabulary Flashcards with SRS

#### User Story

**As a learner**, I want to review vocabulary from specific Genki lessons using interactive flashcards, and have the system intelligently schedule reviews based on my performance, so that I can efficiently memorize words and optimize long-term retention.

#### Acceptance Criteria

- ✅ Dashboard displays all available lessons (Genki 1-5 minimum)
- ✅ Clicking a lesson opens the flashcard view with all vocabulary
- ✅ Flashcards display Japanese word on front, definition on back
- ✅ Cards flip smoothly when clicked (animated)
- ✅ User can navigate between cards (next/previous buttons)
- ✅ User rates each card: "Again", "Hard", "Good", "Easy"
- ✅ System updates SRS algorithm based on rating
- ✅ Next review date is calculated automatically (SM-2 algorithm)
- ✅ Dashboard shows "Due for Review" count per lesson
- ✅ Review mode only shows cards due today
- ✅ Progress bar indicates completion percentage
- ✅ User sees confirmation message when review session is complete

#### Technical Implementation Notes

**1. Install Dependencies**

```bash
npm install framer-motion zustand
```

**2. Implement SM-2 SRS Algorithm**
Create utility function in `lib/srs-algorithm.ts`:

```typescript
interface SRSResult {
  newSrsLevel: number;
  newEaseFactor: number;
  newInterval: number;
  nextReviewAt: Date;
}

function calculateNextReview(
  currentLevel: number,
  easeFactor: number,
  interval: number,
  rating: "again" | "hard" | "good" | "easy"
): SRSResult {
  // Implement simplified SM-2 algorithm
  // Again: Reset to level 0, review in 1 minute
  // Hard: Decrease ease factor, repeat current interval
  // Good: Increase level, multiply interval by ease factor
  // Easy: Increase level and ease factor, longer interval
}
```

**SM-2 Algorithm Parameters:**

- `srsLevel`: 0 (new) → 1 (learning) → 2-8 (review stages)
- `easeFactor`: 1.3 to 3.0 (default 2.5)
- `interval`: 0 days → 1 day → 3 days → 7 days → 14 days → 30 days...

**3. Create Flashcard Component**

```typescript
// components/flashcard/VocabCard.tsx
import { motion } from "framer-motion";

const flipVariants = {
  front: { rotateY: 0 },
  back: { rotateY: 180 },
};

function VocabCard({ vocab, isFlipped, onFlip }) {
  return (
    <motion.div
      animate={isFlipped ? "back" : "front"}
      variants={flipVariants}
      transition={{ duration: 0.4 }}
      onClick={onFlip}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Card content */}
    </motion.div>
  );
}
```

**4. Create Review Session Component**

```typescript
// app/lessons/[slug]/review/page.tsx
// Fetch cards due for review
// Track current card index
// Handle rating submission
// Update progress state
```

**5. API Routes**

- `POST /api/vocab/review` - Submit review rating

  - Accept: vocabId, userId, rating
  - Calculate next review using SRS algorithm
  - Update UserVocabProgress in database
  - Return new review date

- `GET /api/lessons/[id]/due-cards` - Get cards due for review
  - Filter by `nextReviewAt <= now()`
  - Return vocab with user progress

**6. State Management with Zustand**

```typescript
// stores/review-store.ts
interface ReviewState {
  currentCard: number;
  totalCards: number;
  completedCards: number;
  sessionActive: boolean;
  startSession: (cards: VocabEntry[]) => void;
  rateCard: (rating: Rating) => void;
  endSession: () => void;
}
```

**7. Dashboard Updates**

- Query lessons with aggregated due counts
- Display badges showing "12 due today"
- Add "Start Review" button for lessons with due cards
- Add "Study New" button to learn unstarted cards

**Current Gap**:

- Need to add `UserVocabProgress` table
- Need to implement SRS algorithm
- Need to create flashcard UI with Framer Motion
- Need review API routes

---

### Feature 3: Interactive Kana & Kanji Quizzes

#### User Story

**As a learner**, I want to test my knowledge of Hiragana, Katakana, and Kanji through multiple-choice quizzes with instant feedback, so that I can identify weak areas and reinforce my recognition skills.

#### Acceptance Criteria

- ✅ Quiz section accessible from main navigation
- ✅ User can choose quiz type: Hiragana, Katakana, Kanji (by lesson)
- ✅ Each quiz question shows a character and 4 multiple-choice options
- ✅ Only one option is correct
- ✅ Three incorrect options are dynamically generated from the same set
- ✅ User selects an answer and receives instant visual feedback
- ✅ Correct answers show green highlight + checkmark
- ✅ Incorrect answers show red highlight + correct answer revealed
- ✅ Score is tracked throughout the quiz (e.g., "8/10")
- ✅ Timer displays elapsed time (optional)
- ✅ Results summary shown at end: score, time, accuracy %
- ✅ User can retry quiz or return to dashboard
- ✅ Quiz attempts are saved to database

#### Technical Implementation Notes

**1. Create Quiz Generation Logic**

```typescript
// lib/quiz-generator.ts

interface QuizQuestion {
  id: string;
  character: string;
  correctAnswer: string;
  options: string[]; // 4 options total, shuffled
  type: "hiragana" | "katakana" | "kanji";
}

function generateQuiz(
  items: Array<{ character: string; romaji: string }>,
  count: number = 10
): QuizQuestion[] {
  // 1. Randomly select `count` items as questions
  // 2. For each question, select 3 random incorrect options
  // 3. Shuffle the 4 options
  // 4. Return quiz array
}
```

**2. Quiz UI Component Structure**

```
app/quiz/
├── page.tsx                    # Quiz type selection
├── [type]/                     # Dynamic route for quiz type
│   └── page.tsx               # Quiz interface
└── results/
    └── page.tsx               # Results summary
```

**3. Quiz Interface Component**

```typescript
// app/quiz/[type]/page.tsx
"use client";

function QuizPage({ params }: { params: { type: string } }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (option: string) => {
    setSelectedAnswer(option);
    setIsAnswered(true);
    if (option === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
  };

  // Continue to next question after 1.5 seconds
  // Show results when all questions answered
}
```

**4. Answer Feedback Animation**

```typescript
// Use Framer Motion for feedback
<motion.div
  animate={{
    backgroundColor: isCorrect ? "#22c55e" : "#ef4444",
    scale: [1, 1.05, 1],
  }}
  transition={{ duration: 0.3 }}
>
  {option}
</motion.div>
```

**5. API Routes**

- `GET /api/quiz/[type]/generate` - Generate quiz questions

  - type: 'hiragana' | 'katakana' | 'kanji'
  - lessonId (optional for kanji)
  - count (default 10)
  - Returns: QuizQuestion[]

- `POST /api/quiz/submit` - Save quiz results
  - quizType, score, totalQuestions, timeSpent
  - Creates QuizAttempt record
  - Returns: attempt ID

**6. Results Summary Page**

- Display final score (e.g., "18/20 - 90%")
- Show time taken
- Display accuracy percentage
- Show difficulty rating (based on time + accuracy)
- "Try Again" button → restart same quiz
- "Back to Dashboard" button

**7. Kana Data Seeding**
You'll need CSV files for:

**hiragana.csv:**

```csv
character,romaji,type,order
あ,a,basic,1
い,i,basic,2
...
が,ga,dakuten,26
きゃ,kya,combo,51
```

**katakana.csv:**

```csv
character,romaji,type,order
ア,a,basic,1
イ,i,basic,2
...
```

**Current Gap:**

- Need to create quiz UI pages
- Need quiz generation logic
- Need to populate Hiragana/Katakana tables
- Need quiz attempt tracking

---

### Feature 4: AI Tutor Chatbot

#### User Story

**As a learner**, I want to chat with an AI tutor that can answer my questions about Japanese grammar, vocabulary usage, and cultural context, so that I can get personalized help without waiting for a human teacher.

#### Acceptance Criteria

- ✅ Chat interface accessible from main navigation
- ✅ User can type questions in English or Japanese
- ✅ AI responds with relevant Japanese learning advice
- ✅ Responses stream in real-time (not all at once)
- ✅ Chat history is preserved during session
- ✅ Chat history is saved to database per user
- ✅ AI provides examples with romaji translations
- ✅ AI stays in "Japanese tutor" role (no off-topic responses)
- ✅ Loading indicator shows while AI is "thinking"
- ✅ User can clear chat history
- ✅ Chat is responsive and works on mobile

#### Technical Implementation Notes

**1. Migrate from Python Backend to Next.js API Route**

Currently you have:

```python
# nihon-go_backend/main.py
from google import genai
client = genai.Client(api_key="...")
response = client.models.generate_content(...)
```

**New approach:**

- Delete Python backend (not needed)
- Use Next.js API route with Vercel AI SDK
- Stream responses directly to frontend

**2. Install Dependencies**

```bash
npm install ai @google/generative-ai
```

**3. Create API Route for Chat**

```typescript
// app/api/chat/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  // Add system prompt to guide the AI
  const systemPrompt = `You are a friendly and knowledgeable Japanese language tutor. 
Your role is to help students learn Japanese vocabulary, grammar, and cultural context.

Guidelines:
- Always provide clear explanations in English
- Include romaji (romanization) when showing Japanese examples
- Give practical example sentences
- Explain cultural nuances when relevant
- If asked about topics unrelated to Japanese learning, politely redirect to language learning
- Keep responses concise (2-3 paragraphs maximum)
- Use encouraging tone to motivate learners`;

  const result = await streamText({
    model: genai.getGenerativeModel({ model: "gemini-1.5-flash" }),
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  return result.toDataStreamResponse();
}
```

**4. Create Chat UI Component**

```typescript
// app/chat/page.tsx
"use client";
import { useChat } from "ai/react";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
    });

  return (
    <div className="flex flex-col h-screen">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything about Japanese..."
          className="w-full p-3 border rounded-lg"
        />
      </form>
    </div>
  );
}
```

**5. Streaming Implementation**
The `useChat` hook from Vercel AI SDK handles:

- Sending messages to API route
- Receiving streaming responses
- Updating UI in real-time as tokens arrive
- Managing message history state

**6. Customize AI Behavior**

**System Prompt Enhancements:**

- Include user's current lesson level in context
- Reference vocabulary the user is currently learning
- Adjust explanation complexity based on user progress

**Example Enhanced Prompt:**

```typescript
const systemPrompt = `You are tutoring a student currently studying Genki Lesson ${userLesson}.
They have learned these vocabulary words: ${recentVocab.join(", ")}.

When explaining grammar or giving examples, try to use vocabulary they already know.
If you must introduce new words, mark them clearly as [New Word].`;
```

**7. Save Chat History**

```typescript
// After each message exchange
await prisma.chatMessage.createMany({
  data: [
    {
      userId: session.user.id,
      role: "user",
      content: userMessage,
      threadId: chatThreadId,
    },
    {
      userId: session.user.id,
      role: "assistant",
      content: aiResponse,
      threadId: chatThreadId,
    },
  ],
});
```

**8. Additional Features**

- **Quick Prompts**: Buttons for common questions

  - "Explain particle は vs が"
  - "How do I say 'I want to...'?"
  - "What's the difference between です and だ?"

- **Code Highlighting**: Use syntax highlighting for Japanese text
- **Copy Button**: Allow users to copy AI responses
- **Regenerate**: Re-generate last response if unsatisfactory

**Current Gap:**

- Need to migrate from Python to Next.js API route
- Need to install Vercel AI SDK
- Need to create chat UI
- Need to implement chat history saving
- Need to add system prompt customization

---

### Feature 5: Database Seeding via CSV

#### User Story

**As a developer**, I want to efficiently populate the database with vocabulary, kanji, and kana data from CSV files, so that I can avoid manual data entry and scale to hundreds of entries quickly.

#### Acceptance Criteria

- ✅ CSV files for vocab, kanji, hiragana, katakana are properly formatted
- ✅ Seed script reads CSV files using PapaParser
- ✅ Data is validated before insertion
- ✅ Script uses Prisma's `createMany()` for bulk inserts
- ✅ Script is idempotent (can run multiple times safely)
- ✅ Script reports success/failure for each entity type
- ✅ Existing data is not duplicated
- ✅ Script completes in under 10 seconds for 500+ entries
- ✅ All lessons 1-5 are seeded with complete vocab/kanji

#### Technical Implementation Notes

**1. Install Dependencies**

```bash
npm install papaparse @types/papaparse
```

**2. Create CSV File Structure**

**vocabulary.csv:**

```csv
word,reading,definition,type,category,lessonNumber,order,exampleSentence
だいがく,daigaku,College; University,noun,school,1,1,
こうこう,koukou,High School,noun,school,1,2,
がくせい,gakusee,Student,noun,school,1,3,わたしはがくせいです。(I am a student.)
...
```

**Required Columns:**

- `word` - Japanese word (hiragana/katakana/kanji)
- `reading` - Romaji reading
- `definition` - English meaning
- `type` - Part of speech (noun, verb, adjective, etc.)
- `category` - Semantic grouping (optional)
- `lessonNumber` - Which Genki lesson (1-12)
- `order` - Display order within lesson
- `exampleSentence` - Usage example (optional)

**kanji.csv:**

```csv
kanji,definition,onyomi,kunyomi,strokeCount,jlptLevel,lessonNumber
人,person,ジン,ひと,2,5,1
日,day;sun,ニチ・ジツ,ひ・か,4,5,1
本,book;origin,ホン,もと,5,5,1
```

**Required Columns:**

- `kanji` - The kanji character
- `definition` - English meaning
- `onyomi` - On'yomi readings (comma-separated for multiple)
- `kunyomi` - Kun'yomi readings (comma-separated)
- `strokeCount` - Number of strokes (optional)
- `jlptLevel` - JLPT level 1-5 (optional)
- `lessonNumber` - Which lesson introduces this kanji

**hiragana.csv:**

```csv
character,romaji,type,order
あ,a,basic,1
い,i,basic,2
う,u,basic,3
...
が,ga,dakuten,26
ぎ,gi,dakuten,27
...
きゃ,kya,combo,51
きゅ,kyu,combo,52
```

**katakana.csv:**

```csv
character,romaji,type,order
ア,a,basic,1
イ,i,basic,2
ウ,u,basic,3
...
```

**3. Create Seed Script**

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
    },
    {
      number: 2,
      title: "Shopping",
      slug: "lesson-2",
      description: "Shopping expressions and numbers",
    },
    {
      number: 3,
      title: "Making a Date",
      slug: "lesson-3",
      description: "Describing activities and time",
    },
    {
      number: 4,
      title: "The First Date",
      slug: "lesson-4",
      description: "Talking about daily activities",
    },
    {
      number: 5,
      title: "A Trip to Okinawa",
      slug: "lesson-5",
      description: "Travel and adjectives",
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
  const csvFile = fs.readFileSync(csvPath, "utf8");

  const { data } = Papa.parse<VocabCSVRow>(csvFile, {
    header: true,
    skipEmptyLines: true,
  });

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
      word: row.word,
      reading: row.reading,
      definition: row.definition,
      type: row.type,
      category: row.category || null,
      lessonId: lesson.id,
      order: parseInt(row.order),
      exampleSentence: row.exampleSentence || null,
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
  const csvFile = fs.readFileSync(csvPath, "utf8");

  const { data } = Papa.parse<KanjiCSVRow>(csvFile, {
    header: true,
    skipEmptyLines: true,
  });

  console.log(`📖 Parsed ${data.length} kanji entries`);

  for (const row of data) {
    const lessonNum = parseInt(row.lessonNumber);
    const lesson = await prisma.lesson.findFirst({
      where: { number: lessonNum },
    });

    if (!lesson) continue;

    await prisma.kanjiEntry
      .create({
        data: {
          kanji: row.kanji,
          definition: row.definition,
          onyomi: row.onyomi ? row.onyomi.split(",").map((s) => s.trim()) : [],
          kunyomi: row.kunyomi
            ? row.kunyomi.split(",").map((s) => s.trim())
            : [],
          strokeCount: row.strokeCount ? parseInt(row.strokeCount) : null,
          jlptLevel: row.jlptLevel ? parseInt(row.jlptLevel) : null,
          lessonId: lesson.id,
        },
      })
      .catch(() => {
        // Skip duplicates
      });
  }

  console.log(`✅ Seeded kanji`);
}

async function seedHiragana() {
  console.log("🌱 Seeding hiragana...");

  const csvPath = path.join(__dirname, "data", "hiragana.csv");
  const csvFile = fs.readFileSync(csvPath, "utf8");

  const { data } = Papa.parse<KanaCSVRow>(csvFile, {
    header: true,
    skipEmptyLines: true,
  });

  const hiraganaData = data.map((row) => ({
    character: row.character,
    romaji: row.romaji,
    type: row.type,
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
  const csvFile = fs.readFileSync(csvPath, "utf8");

  const { data } = Papa.parse<KanaCSVRow>(csvFile, {
    header: true,
    skipEmptyLines: true,
  });

  const katakanaData = data.map((row) => ({
    character: row.character,
    romaji: row.romaji,
    type: row.type,
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

**4. Update package.json**

```json
{
  "scripts": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

**5. Create CSV Data Directory**

```
prisma/
├── seed.ts
└── data/
    ├── vocabulary.csv
    ├── kanji.csv
    ├── hiragana.csv
    └── katakana.csv
```

**6. Run Seed Script**

```bash
# Clear existing data (optional)
npx prisma migrate reset --skip-seed

# Run seed
npm run seed

# Or run automatically after migration
npx prisma migrate dev
```

**7. Data Conversion Tips**

**Converting Your TypeScript Files:**
Your current `src/data/vocab/lesson1.ts` has data in this format:

```typescript
{
  word: "だいがく",
  reading: "daigaku",
  meaning: "College; University",
  type: "noun",
  category: "school",
  order: 1,
}
```

To convert to CSV:

1. Use a script or manual Excel/Sheets editing
2. Export as CSV
3. Ensure proper UTF-8 encoding for Japanese characters

**Current Gap:**

- Need to create CSV files from existing TypeScript data
- Need to implement seed script
- Need to migrate all lesson data (currently have lesson 1-2 partially)
- Need to populate Hiragana/Katakana tables

---

## 6. Technical Architecture

### Frontend Architecture

```
nihon-go_frontend/
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (protected)/              # Protected route group
│   │   │   ├── dashboard/
│   │   │   ├── lessons/
│   │   │   │   ├── [slug]/
│   │   │   │   │   ├── page.tsx      # Lesson overview
│   │   │   │   │   ├── flashcards/   # Flashcard review
│   │   │   │   │   └── study/        # Study new cards
│   │   │   ├── quiz/
│   │   │   └── chat/
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/
│   │   │   │   └── sync/
│   │   │   ├── vocab/
│   │   │   │   ├── review/
│   │   │   │   └── progress/
│   │   │   ├── quiz/
│   │   │   │   ├── generate/
│   │   │   │   └── submit/
│   │   │   └── chat/
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── flashcard/
│   │   │   ├── VocabCard.tsx
│   │   │   ├── ReviewSession.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── quiz/
│   │   │   ├── QuizQuestion.tsx
│   │   │   ├── AnswerOption.tsx
│   │   │   └── QuizResults.tsx
│   │   ├── chat/
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── TypingIndicator.tsx
│   │   │   └── ChatInput.tsx
│   │   ├── lesson/
│   │   │   ├── LessonCard.tsx
│   │   │   └── LessonProgress.tsx
│   │   └── ui/                       # Radix UI components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── srs-algorithm.ts
│   │   ├── quiz-generator.ts
│   │   ├── db.ts                     # Prisma client
│   │   └── utils.ts
│   ├── stores/
│   │   ├── review-store.ts
│   │   ├── quiz-store.ts
│   │   └── auth-store.ts
│   └── types/
│       ├── lesson.ts
│       ├── vocab.ts
│       ├── quiz.ts
│       └── user.ts
└── prisma/
    ├── schema.prisma
    ├── seed.ts
    └── data/
        ├── vocabulary.csv
        ├── kanji.csv
        ├── hiragana.csv
        └── katakana.csv
```

### Data Flow

**1. Authentication Flow**

```
User → Login Page → Supabase Auth → Auth Callback →
→ API /auth/sync → Create User in DB → Redirect to Dashboard
```

**2. Review Session Flow**

```
Dashboard → Click Lesson → API: Fetch Due Cards →
→ Review Session → User Rates Card → API: Update SRS →
→ Calculate Next Review → Save Progress → Next Card
```

**3. Quiz Flow**

```
Quiz Type Selection → API: Generate Quiz →
→ User Answers → Instant Feedback → Next Question →
→ Results Summary → API: Save Attempt → Return to Dashboard
```

**4. Chat Flow**

```
Chat Input → API: /chat (streaming) →
→ Stream Response to UI → Save Messages to DB → Continue Conversation
```

---

## 7. Implementation Roadmap

### Week 1 Sprint Breakdown

#### Day 1-2: Foundation & Authentication

- [ ] Update Prisma schema with all new models
- [ ] Run migrations
- [ ] Set up Supabase Auth (email + Google OAuth)
- [ ] Create auth pages (login, signup)
- [ ] Implement middleware for protected routes
- [ ] Create landing page with CTA

**Deliverable**: Users can sign up, log in, and access protected dashboard

#### Day 3-4: Database Seeding & Flashcards

- [ ] Create CSV files from existing TypeScript data
- [ ] Add Hiragana/Katakana CSVs
- [ ] Implement seed script with PapaParser
- [ ] Seed database with Lessons 1-5
- [ ] Build flashcard UI with Framer Motion
- [ ] Implement SRS algorithm
- [ ] Create review API routes
- [ ] Build dashboard with lesson cards

**Deliverable**: Users can review vocabulary with SRS tracking

#### Day 5: Quizzes

- [ ] Implement quiz generation logic
- [ ] Build quiz UI components
- [ ] Create quiz API routes
- [ ] Add quiz results page
- [ ] Track quiz attempts in database

**Deliverable**: Users can take Kana and Kanji quizzes

#### Day 6: AI Tutor

- [ ] Migrate Gemini to Next.js API route
- [ ] Install Vercel AI SDK
- [ ] Implement chat streaming
- [ ] Build chat UI
- [ ] Add system prompts
- [ ] Save chat history

**Deliverable**: Users can chat with AI tutor

#### Day 7: Polish & Deploy

- [ ] Add loading states and error handling
- [ ] Implement toast notifications
- [ ] Mobile responsive testing
- [ ] Performance optimization
- [ ] Deploy to Vercel
- [ ] Test production build

**Deliverable**: Live production application

---

## 8. Changes from Current Project

### What to Add

1. **Dependencies**

```bash
npm install framer-motion zustand react-hot-toast papaparse @types/papaparse ai @google/generative-ai @supabase/ssr @supabase/supabase-js
```

2. **Schema Changes**

- Add User, UserVocabProgress, UserKanjiProgress, QuizAttempt, ChatMessage, HiraganaEntry, KatakanaEntry models
- Update Lesson, VocabEntry, KanjiEntry models

3. **New Directories**

- `src/lib/supabase/` - Auth utilities
- `src/stores/` - Zustand state management
- `src/components/flashcard/` - Flashcard components
- `src/components/quiz/` - Quiz components
- `src/components/chat/` - Chat components
- `prisma/data/` - CSV files

4. **API Routes**

- `/api/auth/sync` - User sync
- `/api/vocab/review` - SRS review
- `/api/quiz/*` - Quiz endpoints
- `/api/chat` - AI streaming

### What to Remove

1. **Python Backend**

- Delete `nihon-go_backend/` directory entirely
- You won't need FastAPI or Python environment

2. **Manual Data Entry Scripts**

- Remove `src/scripts/add-lesson.ts`
- Remove `src/scripts/admin-operations.ts`
- Replace with CSV seeding approach

3. **TypeScript Data Files** (after conversion to CSV)

- Move `src/data/vocab/*.ts` to CSV format
- Move `src/data/kanji/*.ts` to CSV format

### What to Modify

1. **Existing Components**

- Update `src/app/lessons/[slug]/page.tsx` to include review button
- Add auth checks to all lesson pages
- Update MainHeader with auth status

2. **Environment Variables**
   Add to `.env.local`:

```env
DATABASE_URL=your_supabase_db_url
DIRECT_URL=your_supabase_direct_url
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key  # Move from Python
```

3. **prisma/schema.prisma**

- Complete rewrite with all new models

---

## 9. Success Criteria & Testing

### Definition of Done (DOD)

Each feature is complete when:

1. ✅ All acceptance criteria are met
2. ✅ Feature works on mobile and desktop
3. ✅ Error states are handled gracefully
4. ✅ Loading states are implemented
5. ✅ Data persists correctly in database
6. ✅ No console errors in production build

### Manual Testing Checklist

**Authentication:**

- [ ] Sign up with email/password
- [ ] Receive verification email
- [ ] Log in with Google OAuth
- [ ] Protected routes redirect correctly
- [ ] Log out clears session

**Flashcards:**

- [ ] Cards flip smoothly
- [ ] Rating buttons update SRS correctly
- [ ] Next review date is calculated
- [ ] Progress bar updates
- [ ] Review session completes

**Quizzes:**

- [ ] Questions display correctly
- [ ] Correct/incorrect feedback works
- [ ] Score tallies correctly
- [ ] Results page displays properly
- [ ] Quiz attempts save to database

**AI Chat:**

- [ ] Messages stream in real-time
- [ ] Chat history persists
- [ ] AI stays in tutor role
- [ ] Clear history works
- [ ] Messages save to database

---

## 10. Future Enhancements (Post-Launch)

### Phase 2 Features

- **Progress Dashboard**: Charts showing study streaks, accuracy trends
- **Listening Practice**: Audio pronunciation for vocab/sentences
- **Writing Practice**: Stroke order animations for kanji
- **Community**: Discussion forum for learners
- **Mobile App**: React Native version
- **Offline Mode**: PWA with offline flashcard access

### Gamification

- **Achievements**: Badges for milestones (100 cards reviewed, 7-day streak)
- **Leaderboards**: Compare progress with friends
- **Daily Goals**: Set and track daily study targets
- **XP System**: Earn points for reviews, quizzes, chat usage

### Content Expansion

- **Genki Lessons 6-12**: Complete beginner textbook
- **Grammar Explanations**: Dedicated grammar sections
- **Reading Passages**: Short stories for comprehension practice
- **Cultural Notes**: Videos and articles about Japanese culture

---

## 11. Resources & References

### Documentation

- [Next.js App Router Docs](https://nextjs.org/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Prisma Best Practices](https://www.prisma.io/docs/guides)
- [Framer Motion Animation Guide](https://www.framer.com/motion/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)

### SRS Algorithm

- [SuperMemo SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Anki SRS Implementation](https://faqs.ankiweb.net/what-spaced-repetition-algorithm.html)

### Design Inspiration

- Wanikani (kanji SRS)
- Anki (flashcard interface)
- Duolingo (gamification)
- Bunpro (grammar progression)

---

## 12. Risk Assessment

| Risk                                                  | Impact | Likelihood | Mitigation                                     |
| ----------------------------------------------------- | ------ | ---------- | ---------------------------------------------- |
| **Scope creep**: Adding too many features             | High   | High       | Stick to MVP features only, defer enhancements |
| **Data entry time**: CSV creation takes too long      | Medium | Medium     | Focus on Lessons 1-3 first, add 4-5 later      |
| **SRS complexity**: Algorithm too hard to implement   | Medium | Low        | Use simplified SM-2, test with sample data     |
| **Gemini API limits**: Free tier quota exceeded       | Medium | Low        | Cache responses, implement rate limiting       |
| **Authentication bugs**: User can't access content    | High   | Medium     | Test thoroughly, have rollback plan            |
| **Mobile responsiveness**: UI breaks on small screens | Medium | Medium     | Use mobile-first Tailwind classes, test early  |

---

## Appendix: Quick Reference

### Environment Setup

```bash
# Install dependencies
cd nihon-go_frontend
npm install framer-motion zustand react-hot-toast papaparse @types/papaparse ai @google/generative-ai @supabase/ssr @supabase/supabase-js

# Update schema
npx prisma migrate dev --name add_srs_and_auth

# Seed database
npm run seed

# Run development server
npm run dev
```

### Key Files to Create

```
✅ PRD_NihonGo.md (this file)
✅ prisma/schema.prisma (updated)
✅ prisma/seed.ts
✅ prisma/data/*.csv (4 files)
✅ lib/supabase/client.ts
✅ lib/supabase/server.ts
✅ lib/srs-algorithm.ts
✅ app/api/chat/route.ts
✅ app/api/vocab/review/route.ts
✅ app/(auth)/login/page.tsx
✅ components/flashcard/VocabCard.tsx
```

### Useful Commands

```bash
# Reset database
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# View database
npx prisma studio

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

---

**End of PRD**

Last Updated: October 12, 2025  
Document Owner: Product Team  
Next Review: Post-Launch (October 19, 2025)
