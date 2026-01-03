# Next Steps: Core Engines Implementation

## ✅ What's Complete

1. **UI/UX Layer** - All pages implemented matching Figma design
2. **Knowledge Graph** - Python concept structure with prerequisites
3. **Database Schema** - Complete schema for all data models
4. **Project Structure** - Next.js setup with TypeScript

## 🚧 What Needs Implementation

### 1. **LLM Service Abstraction Layer** (Priority: HIGH)
**Purpose**: Abstract LLM calls so we can switch providers easily

**Files to create**:
- `lib/services/llm/client.ts` - LLM client wrapper
- `lib/services/llm/prompts.ts` - Prompt templates
- `lib/services/llm/types.ts` - Type definitions

**Key Features**:
- Support for OpenAI, Anthropic, or local models
- Retry logic and error handling
- Token counting and cost tracking
- Streaming support (optional)

---

### 2. **Assessment Engine** (Priority: HIGH)
**Purpose**: Analyze learner responses and identify starting knowledge state

**Files to create**:
- `lib/services/assessment/analyzer.ts` - Main analyzer
- `lib/services/assessment/weak-point-detector.ts` - Detect weaknesses from responses

**Key Features**:
- Analyze text responses using LLM
- Extract confidence scores per concept
- Identify weak foundational concepts
- Generate initial concept mastery scores

**API Route**: `app/api/assessment/analyze/route.ts`

---

### 3. **Curriculum Generator** (Priority: HIGH)
**Purpose**: Generate personalized learning roadmap based on assessment

**Files to create**:
- `lib/services/curriculum/generator.ts` - Main generator
- `lib/services/curriculum/prerequisites.ts` - Prerequisite checking logic

**Key Features**:
- Use knowledge graph to determine available concepts
- Set initial mastery scores from assessment
- Unlock concepts based on prerequisites
- Generate ordered learning path

**API Route**: `app/api/roadmap/route.ts`

---

### 4. **Teaching Strategy Controller** (Priority: HIGH)
**Purpose**: Decide HOW to teach each concept (the core philosophy)

**Files to create**:
- `lib/services/teaching/strategy-controller.ts` - Main controller
- `lib/services/teaching/content-generator.ts` - Generate teaching content
- `lib/services/teaching/checkpoint-analyzer.ts` - Analyze checkpoint responses

**Key Features**:
- Decide teaching method: explanation, analogy, question, example
- Avoid long monologues - break into sections
- Insert checkpoints at appropriate intervals
- Adapt based on learner responses
- Generate content dynamically (not hardcoded)

**API Routes**:
- `app/api/learning/[conceptId]/route.ts` - Get learning content
- `app/api/learning/[conceptId]/checkpoint/route.ts` - Submit checkpoint

---

### 5. **Weak Point Recognition Engine** (Priority: MEDIUM)
**Purpose**: Detect repeated errors and trigger remediation

**Files to create**:
- `lib/services/weak-points/detector.ts` - Main detector
- `lib/services/weak-points/classifier.ts` - Classify weakness type
- `lib/services/weak-points/remediation.ts` - Generate remediation path

**Key Features**:
- Track error patterns across sessions
- Classify: conceptual vs foundational vs application
- Calculate severity scores
- Trigger remediation when threshold met
- Generate personalized feedback

**API Route**: `app/api/weak-points/route.ts`

---

### 6. **Learner Profile System** (Priority: MEDIUM)
**Purpose**: Track and update learner knowledge state

**Files to create**:
- `lib/services/learner/profile-manager.ts` - Manage profiles
- `lib/services/learner/mastery-tracker.ts` - Update mastery scores

**Key Features**:
- Create/update learner profiles
- Track concept mastery over time
- Update confidence scores
- Calculate overall progress

**API Routes**:
- `app/api/learner/profile/route.ts` - Get/update profile
- `app/api/learner/progress/route.ts` - Get progress data

---

## Implementation Order

### Phase 1: Foundation (Do First)
1. ✅ LLM Service Abstraction
2. ✅ Database connection setup
3. ✅ Basic API route structure

### Phase 2: Core Engines (Critical Path)
1. ✅ Assessment Engine
2. ✅ Curriculum Generator
3. ✅ Teaching Strategy Controller

### Phase 3: Intelligence Layer
1. ✅ Weak Point Recognition
2. ✅ Learner Profile System

### Phase 4: Integration
1. ✅ Connect frontend to APIs
2. ✅ Replace mock data with real data
3. ✅ Add error handling and loading states

---

## Architecture Principles (Remember!)

1. **Separation of Concerns**: Teaching logic separate from LLM calls
2. **Controller Pattern**: All teaching decisions go through controller
3. **LLMs Generate Content, NOT Control Flow**: Business logic controls flow
4. **Prefer Clarity Over Abstraction**: Code should be readable
5. **Comment Thoroughly**: Explain WHY, not just WHAT

---

## Environment Variables Needed

```env
# LLM Provider (choose one)
OPENAI_API_KEY=your_key_here
# OR
ANTHROPIC_API_KEY=your_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ailp

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Testing Strategy

1. **Unit Tests**: Test each engine independently
2. **Integration Tests**: Test engine interactions
3. **E2E Tests**: Test full user flows
4. **Manual Testing**: Test with real LLM calls

---

## Next Immediate Steps

1. Set up LLM service abstraction
2. Implement Assessment Engine
3. Create API routes
4. Connect frontend to backend
5. Test end-to-end flow

