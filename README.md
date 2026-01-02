# AILP - AI Learning Platform

An AI-powered personalized learning platform that teaches from first principles, detects learner weaknesses, and adapts teaching style dynamically.

## 🎯 Core Philosophy

This platform is **NOT a chatbot**. It is a structured, subject-aware AI teacher that:
- Teaches from first principles
- Detects learner weaknesses
- Adapts teaching style dynamically
- Uses the Socratic method with checkpoints
- Avoids long monologues

## 🏗️ Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   ├── globals.css        # Global styles
│   └── api/               # API routes (to be implemented)
│
├── components/            # React components
│   └── ui/                # Design system components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── progress.tsx
│
├── lib/                  # Core business logic
│   ├── knowledge-graph/  # Knowledge graph system
│   │   ├── python-graph.ts
│   │   └── types.ts
│   ├── db/               # Database layer
│   │   ├── schema.ts     # Drizzle ORM schema
│   │   └── client.ts     # Database connection
│   └── utils.ts          # Utility functions
│
└── drizzle.config.ts     # Drizzle ORM configuration
```

## ✅ What's Been Built

### 1. **Project Foundation**
- ✅ Next.js 14 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS with design system colors matching Figma
- ✅ Drizzle ORM setup for database

### 2. **Python Knowledge Graph**
- ✅ 12 concepts organized by level (beginner → intermediate → confident)
- ✅ Prerequisite dependencies
- ✅ Helper functions for concept management
- ✅ Located in `lib/knowledge-graph/python-graph.ts`

### 3. **Database Schema**
- ✅ Complete PostgreSQL schema with 7 tables:
  - `users` - User authentication
  - `learner_profiles` - Overall progress tracking
  - `concept_mastery` - Per-concept mastery scores
  - `learning_sessions` - Session tracking
  - `assessment_responses` - Diagnostic answers
  - `weak_points` - Weakness detection
  - `checkpoint_responses` - Checkpoint tracking

### 4. **UI Components**
- ✅ Button component (matching Figma design)
- ✅ Input component
- ✅ Card component
- ✅ Progress component
- ✅ Utility functions (cn helper)

### 5. **Landing Page**
- ✅ Fully implemented matching Figma design
- ✅ Hero section with CTA
- ✅ Feature highlights
- ✅ Responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL (or use SQLite for MVP)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env.local
# Edit .env.local with your database URL
```

3. **Run database migrations:**
```bash
npm run db:generate
npm run db:migrate
```

4. **Start development server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the landing page.

## 📋 Next Steps

### To Be Implemented:

1. **Remaining Pages**
   - Subject Selection Page
   - Assessment Page
   - Roadmap Page
   - Learning Page (with sidebar)
   - Feedback Page

2. **API Routes**
   - Authentication endpoints
   - Assessment submission & analysis
   - Roadmap generation
   - Learning content generation
   - Weak point detection

3. **Service Layer**
   - LLM client abstraction
   - Teaching strategy controller
   - Assessment analyzer
   - Curriculum generator
   - Weak point recognition engine

4. **Database Setup**
   - Connection configuration
   - Migration scripts
   - Seed data (optional)

## 🎨 Design System

The design system matches the Figma design:
- **Colors**: Neutral grays, Emerald green (success), Amber (active/warning)
- **Typography**: Tight tracking for headings, relaxed leading for body
- **Components**: Rounded corners, subtle borders, hover states

## 🏛️ Architecture Principles

1. **Separation of Concerns**: Teaching logic separate from LLM calls
2. **Controller Pattern**: All teaching decisions go through controller layer
3. **Knowledge Graph**: Prerequisite-based curriculum generation
4. **Progress Tracking**: Mastery and confidence scores per concept

## 📚 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens

## 📝 License

See LICENSE file for details.
