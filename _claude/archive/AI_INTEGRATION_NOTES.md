# AI Integration - Implementation Notes

## Overview
This document tracks the AI tutor implementation for Colormxr Studio, integrating Claude API to deliver David's color theory methodology through an interactive sidebar interface.

## Date: February 22, 2026

---

## Architecture

### Backend (API Route)
**File:** `/app/api/chat/route.ts`

**Key Features:**
- Claude Sonnet 4.5 integration (`claude-sonnet-4-5-20250929`)
- Prompt caching for cost efficiency (90% savings on cached lesson content)
- User authentication via localStorage access tokens
- Server-side lesson content loading from `_text_content/` directory
- Token usage tracking and cost calculation
- Conversation storage in Supabase

**System Prompt:**
- Designed to teach David's Interactive Color Composition methodology
- Action-oriented, brief responses (under 200 tokens)
- Redirects to experiential learning in Colormixer
- Supports interactive response pills (JSON format)
- Never judges color choices (perception is subjective)

**Authentication Flow:**
1. Client sends `accessToken` in request body
2. Server validates with `supabase.auth.getUser(accessToken)`
3. Respects Row Level Security (RLS) policies

### Frontend Components

#### TutorSidebar (`/components/Modals/TutorSidebar.jsx`)
**Purpose:** Main sidebar UI combining lesson content with AI chat

**Features:**
- Paragraph-based content chunking
- Sequential reveal (click/tap anywhere to continue)
- Word-by-word fade-in animation (15ms delay, 0.15s fade)
- Smart auto-scrolling (kicks in when content exceeds 50% viewport height)
- Click-anywhere navigation
- Integrated AI chat below lesson content

**State Management:**
- `currentParagraph` - tracks which paragraph user has reached
- `shouldAutoScroll` - enables scroll once threshold reached
- `messages` - AI conversation history

#### TutorSidebarWithLesson (`/components/Modals/TutorSidebarWithLesson.jsx`)
**Purpose:** Wrapper that auto-loads markdown lessons

**Features:**
- Fetches lessons from `/api/lessons/[filename]` endpoint
- Splits content by double newlines (`\n\n`) into paragraphs
- Converts markdown to HTML
- Passes paragraphs array to TutorSidebar

#### ChatMessage (`/components/Modals/ChatMessage.jsx`)
**Purpose:** Displays individual chat messages

**Features:**
- Markdown rendering (bold, line breaks, paragraphs)
- Interactive suggestion pills
- No avatar display (per user request)
- Full-width AI messages, constrained user messages

#### ChatInput (`/components/Modals/ChatInput.jsx`)
**Purpose:** Message input field with send button

**Features:**
- Submit on Enter key
- Send button with icon
- Disabled state during loading

### Database Schema

**Tables:**
1. `ai_conversations` - Stores conversation history (JSONB messages)
2. `ai_token_usage` - Tracks API usage and costs
3. `ai_lesson_progress` - (Planned) User progress tracking

**Row Level Security (RLS):**
- Users can only access their own conversations
- Service role key NOT used (security best practice)

### Lesson Content System

**Location:** `/_text_content/`

**Current Files:**
- `welcome.md` - Welcome page lesson
- `colormixing_101.md` - Main lesson content

**Format:**
- Markdown files
- Split by `---` delimiters for slides (legacy)
- Split by `\n\n` for paragraph chunking (current)

**Loading:**
- Server-side via `fs.readFileSync()` in API route
- Cached with prompt caching for cost efficiency
- Converted to HTML client-side via `markdownToHTML()`

### Styling

**Design:**
- Dark sidebar (#2d2d2d background)
- Gray gradient pills (matching next_pill.svg style)
- 16px body text, 10pt hint text
- Word-by-word fade animation on new paragraphs
- Transparent AI message background
- Blue bubble user messages

**Animations:**
- Word fade-in: 0.15s duration, 15ms stagger
- Smooth scroll behavior
- Loading dots animation

---

## User Experience Flow

1. **Initial Load:**
   - Sidebar opens automatically with first paragraph visible
   - Hint text: "Tap or click anywhere to continue"

2. **Content Progression:**
   - User clicks/taps anywhere in content area
   - Next paragraph loads with word-by-word fade animation
   - Previous paragraphs remain visible (sequential reveal)
   - Auto-scroll engages when content exceeds 50% viewport

3. **AI Interaction:**
   - User can type messages at any time
   - AI responds with text and optional suggestion pills
   - Pills appear inline with AI messages
   - Clicking pill sends it as user's message

4. **Suggestion Pills:**
   - AI can provide 2-4 clickable options
   - Examples: ["Let's begin", "Tell me more", "What is Colormxr?"]
   - Styled as gray gradient buttons
   - Wrap to multiple lines if needed

---

## API Integration Details

### Request Format
```json
{
  "message": "User's message",
  "lessonId": "colormixing_101",
  "exerciseId": "single_mix",
  "conversationHistory": [...],
  "accessToken": "user_session_token",
  "sessionId": "user_id"
}
```

### Response Format
```json
{
  "response": "AI message text",
  "ui": {
    "type": "pills",
    "options": ["Option 1", "Option 2"]
  },
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 567,
    "cache_creation_tokens": 60000,
    "cache_read_tokens": 0,
    "cost_usd": 0.0023
  }
}
```

### JSON Parsing
- AI returns raw JSON (no markdown code blocks)
- Server strips code block wrappers if present
- Fallback to plain text if JSON parsing fails

---

## Cost Optimization

### Prompt Caching Strategy
- Lesson content (~60K words) cached in system prompt
- 90% cost reduction on cache hits
- Cache duration: ~5 minutes (ephemeral)

### Pricing (Claude Sonnet 4.5)
- Input: $3/million tokens
- Output: $15/million tokens
- Cache write: $3.75/million tokens
- Cache read: $0.30/million tokens (90% savings)

### Rate Limiting
- Max 50 messages per session
- Max 500 characters per message

---

## Implementation Challenges Solved

### 1. Authentication Mismatch
**Problem:** App uses localStorage, API tried to use cookies
**Solution:** Pass `accessToken` from client, validate server-side

### 2. JSON Parsing
**Problem:** AI wrapped JSON in markdown code blocks
**Solution:** Strip wrappers with regex, instruct AI to return raw JSON

### 3. Paragraph Rendering Errors
**Problem:** `removeChild` errors on React re-renders
**Solution:** Better key generation, null checks, safe ref handling

### 4. Scrolling Timing
**Problem:** Content wasn't scrolling at midpoint
**Solution:** Track `shouldAutoScroll` state, use `requestAnimationFrame`

### 5. Word Animation
**Problem:** Needed teletype effect
**Solution:** Parse HTML, wrap words in spans with staggered animation delays

---

## Files Modified/Created

### Created:
- `/app/api/chat/route.ts`
- `/app/api/lessons/[filename]/route.js`
- `/components/Modals/TutorSidebar.jsx`
- `/components/Modals/TutorSidebarWithLesson.jsx`
- `/components/Modals/ChatMessage.jsx`
- `/components/Modals/ChatInput.jsx`
- `/components/Modals/TutorSidebar.module.css`
- `/components/Modals/ChatMessage.module.css`
- `/components/Modals/ChatInput.module.css`
- `/utils/lessonParser.js`
- `/db/migrations/create-ai-tutor-tables.sql`
- `/_text_content/welcome.md`
- `/_text_content/colormixing_101.md`

### Modified:
- `/app/welcome/page.tsx` - Changed to single-mix exercise, integrated TutorSidebarWithLesson
- `/app/exercise/section1/single-mix/page.jsx` - Integrated TutorSidebarWithLesson
- `/package.json` - Added `@anthropic-ai/sdk`

---

## Next Steps / Potential Enhancements

### Content Strategy (See: AI_STRATEGY.md)
- Implement EXPOSITION/CHECKPOINT/ENGAGE/OBSERVE modes
- Create structured markdown format with content markers
- Build parser to switch between sequential and AI-engaged modes

### Features to Consider:
1. Progress tracking (resume where user left off)
2. Exercise-specific AI context (current exercise state)
3. Voice mode integration
4. Image generation for color concepts
5. User-specific lesson customization
6. Analytics on learning patterns
7. Multi-language support

### Technical Improvements:
1. Streaming responses for faster perceived speed
2. Optimistic UI updates
3. Offline mode with cached responses
4. Error recovery and retry logic
5. Migration to App Router API (Next.js 15)

---

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Note:** Service role key is NOT required (we use user session auth)

---

## Documentation References

- [AI_TUTOR_SETUP.md](/AI_TUTOR_SETUP.md) - Setup instructions
- [VERCEL_DEPLOYMENT.md](/VERCEL_DEPLOYMENT.md) - Deployment guide
- [INTEGRATION_EXAMPLE.md](/INTEGRATION_EXAMPLE.md) - Integration examples
- [TEST_MODE_README.md](TEST_MODE_README.md) - Testing guide
- [AI_STRATEGY.md](/AI_STRATEGY.md) - Content strategy options (NEW)
