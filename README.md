# AILP - AI Learning Platform

An AI-powered personalized learning platform that teaches from first principles, detects learner weaknesses, and adapts teaching style dynamically.

## 🎯 Core Philosophy

This platform is **NOT a chatbot**. It is a structured, subject-aware AI teacher that:
- Teaches from first principles
- Detects learner weaknesses
- Adapts teaching style dynamically
- Uses the Socratic method with checkpoints
- Avoids long monologues

## ✅ What's Implemented

### Frontend (Complete)
- ✅ Landing Page
- ✅ Subject Selection Page
- ✅ Assessment Page (3 questions)
- ✅ Roadmap Page (timeline view)
- ✅ Learning Page (with sidebar, checkpoints)
- ✅ Feedback Page (weak point remediation)

### Core Engines (Complete)
- ✅ **LLM Service Abstraction** - Provider-agnostic LLM interface
- ✅ **Assessment Engine** - Analyzes responses, generates confidence scores
- ✅ **Curriculum Generator** - Creates personalized learning roadmap
- ✅ **Teaching Strategy Controller** - Decides HOW to teach each concept
- ✅ **Content Generator** - Generates teaching content dynamically
- ✅ **Checkpoint Analyzer** - Assesses understanding from responses
- ✅ **Weak Point Recognition** - Detects learning gaps and triggers remediation

### API Routes (Complete)
- ✅ `POST /api/assessment/analyze` - Analyze assessment responses
- ✅ `GET /api/roadmap` - Get personalized roadmap
- ✅ `POST /api/roadmap` - Update roadmap after completion
- ✅ `GET /api/learning/[conceptId]` - Get learning content
- ✅ `POST /api/learning/[conceptId]/checkpoint` - Analyze checkpoint
- ✅ `POST /api/weak-points` - Detect weak points

### Authentication System (Complete)
- ✅ Signup and Login pages
- ✅ Session-based authentication
- ✅ Password hashing with bcrypt
- ✅ Protected routes middleware
- ✅ `/api/auth/signup` - User registration
- ✅ `/api/auth/login` - User login
- ✅ `/api/auth/logout` - User logout
- ✅ `/api/auth/me` - Get current user

### Database Integration (Complete)
- ✅ Type-safe database queries
- ✅ Concept mastery tracking
- ✅ Learning session management
- ✅ Assessment response storage
- ✅ Weak point detection storage
- ✅ User authentication
- ✅ Learner profiles
- ✅ Concept mastery tracking
- ✅ Learning sessions
- ✅ Assessment responses
- ✅ Weak points
- ✅ Checkpoint responses

### Knowledge Graph (Complete)
- ✅ 12 Python concepts with prerequisites
- ✅ Three levels: beginner, intermediate, confident
- ✅ Prerequisite dependency system

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (or SQLite for MVP)
- OpenAI API key

### Installation

1. **Clone and install:**
```bash
git clone https://github.com/Yashshokeen-11/AILP.git
cd AILP
npm install
```

2. **Set up environment variables:**
Create a `.env.local` file in the root directory with:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ailp

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# LLM API (choose one)
OPENAI_API_KEY=your-openai-api-key-here
# OR
ANTHROPIC_API_KEY=your-anthropic-api-key-here

# App Configuration
NODE_ENV=development
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

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Landing page
│   ├── subjects/                 # Subject selection
│   ├── assessment/               # Diagnostic assessment
│   ├── roadmap/                  # Learning roadmap
│   ├── learn/[conceptId]/       # Learning page
│   ├── feedback/                 # Weak point feedback
│   └── api/                      # API routes
│       ├── auth/                 # Authentication
│       ├── assessment/
│       ├── roadmap/
│       ├── learning/
│       └── weak-points/
│
├── lib/                         # Core business logic
│   ├── services/                # Service layer
│   │   ├── llm/                 # LLM abstraction
│   │   ├── assessment/          # Assessment engine
│   │   ├── curriculum/          # Curriculum generator
│   │   ├── teaching/            # Teaching controller
│   │   └── weak-points/         # Weak point detector
│   ├── knowledge-graph/         # Python knowledge graph
│   ├── db/                      # Database schema & client
│   └── utils.ts                 # Utilities
│
├── components/                  # React components
│   └── ui/                      # Design system components
│
└── types/                       # TypeScript types
```

## 🏛️ Architecture

### Core Principles

1. **Separation of Concerns**: Teaching logic separate from LLM calls
2. **Controller Pattern**: All teaching decisions go through controller
3. **LLMs Generate Content, NOT Control Flow**: Business logic controls flow
4. **Knowledge Graph**: Prerequisite-based curriculum generation
5. **Progress Tracking**: Mastery and confidence scores per concept

### How It Works

```
User Flow:
1. Assessment → Assessment Engine → Confidence Scores
2. Confidence Scores → Curriculum Generator → Personalized Roadmap
3. User clicks concept → Teaching Strategy Controller → Lesson Plan
4. Lesson Plan → Content Generator (LLM) → Teaching Content
5. User answers checkpoint → Checkpoint Analyzer → Understanding Score
6. Repeated errors → Weak Point Detector → Remediation Trigger
```

## 🎨 Design System

Matches Figma design:
- **Colors**: Neutral grays, Emerald green (success), Amber (active)
- **Typography**: Tight tracking for headings, relaxed leading for body
- **Components**: Rounded corners, subtle borders, hover states

## 📚 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **AI**: OpenAI (extensible to other providers)
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio
```

## 📝 Documentation

- [NEXT_STEPS.md](./NEXT_STEPS.md) - Detailed next steps and roadmap
- [ENGINES_IMPLEMENTATION.md](./ENGINES_IMPLEMENTATION.md) - Engine implementation details

## 🚧 Next Steps

### To Make It Fully Functional:
1. **Connect Frontend to APIs** - Replace mock data with API calls
2. **Database Integration** - Connect engines to database (partially done)
3. **Error Handling** - Better error messages and fallbacks

### Future Enhancements:
1. **Enhanced Features**
   - [ ] Email verification
   - [ ] Password reset functionality
   - [ ] Progress analytics dashboard
   - [ ] Social learning features
   - [ ] Export learning certificates

2. **Advanced Teaching**
   - [ ] Adaptive difficulty adjustment
   - [ ] Personalized learning pace
   - [ ] Multi-modal content (diagrams, interactive examples)
   - [ ] Spaced repetition system

3. **Additional Subjects**
   - [ ] Mathematics
   - [ ] Physics
   - [ ] Web Development
   - [ ] Data Science

4. **Technical Improvements**
   - [ ] Caching - Cache generated content
   - [ ] Streaming - Stream LLM responses
   - [ ] Testing - Unit and integration tests
   - [ ] Monitoring - Track LLM usage and costs

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 🤝 Contributing

This is an MVP. Contributions welcome!

---

**Built with ❤️ for personalized learning**
