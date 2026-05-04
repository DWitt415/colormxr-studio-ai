# Colormxr Studio AI — Current Context

## What This App Is
Interactive color theory education app. Users learn RGB/CMY color composition through hands-on exercises using a custom **Colormixer** interface. An AI-powered **Course Guide** (Claude API) delivers creator David Witt's teaching methodology.

---

## Tech Stack
- **Framework**: Next.js 15 (App Router), React 18
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Hosting**: Vercel

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=   # server-side only, never expose to client
```

---

## Project Structure

```
app/
  api/
    chat/route.ts              # Claude API endpoint
    lessons/[filename]/route.js # Serves markdown lesson files
  exercise/section1/           # Basic exercises
  exercise/section3/           # Advanced exercises
  welcome/page.tsx             # Onboarding (uses TutorSidebarWithLesson)
  gallery/                     # User compositions gallery

components/
  ColorControllerUI.js         # Main interactive color component
  layouts/
    GridLayout.jsx
    CosmicLayout.jsx
    RadiantLayout.jsx
    SVGLayout.jsx
  Modals/
    TutorSidebar.jsx           # AI tutor sidebar UI
    TutorSidebarWithLesson.jsx # Loads markdown, passes paragraphs to TutorSidebar
    ChatMessage.jsx            # Message display with pill support
    ChatInput.jsx              # Message input

hooks/
  useColorState.js
  useColorSliders.js
  useShapeSelection.js

utils/
  supabase.js
  lessonParser.js              # Currently splits by \n\n — needs replacing

_text_content/
  welcome.md
  colormixing_101.md           # Needs reformatting with content markers

db/migrations/
  create-ai-tutor-tables.sql
```

---

## AI Tutor — Current Implementation

### What Works
- Sequential paragraph reveal (click/tap anywhere to advance)
- Word-by-word fade-in animation on new paragraphs
- AI chat below lesson content
- Suggestion pills in AI responses (only after user sends a message)
- Prompt caching (90% cost reduction on cached content)
- Auth via localStorage `accessToken` passed to server

### What's Missing (Phase 2 — build this next)
Content markers in markdown are not yet parsed or acted on. The lesson content and AI chat are separate — not interweaved. Pills only appear after a user-initiated chat exchange.

---

## Phase 2: Content Strategy Implementation

### Goal
Blend sequential lesson content with AI-driven interaction at defined points.

### Three Content Modes

| Mode | Behavior |
|------|----------|
| `EXPOSITION` | Sequential reveal, user clicks to advance |
| `CHECKPOINT` | Pauses flow, AI automatically sends a message with pills |
| `ENGAGE` / `OBSERVE` / `EXPERIMENT` | AI coaches hands-on activity in Colormixer |

### Markdown Format (to implement in `_text_content/`)

```markdown
## [EXPOSITION]
Plain lesson text here. User clicks to advance.

## [EXPOSITION]
More text.

## [CHECKPOINT: understanding]
<!-- AI_PROMPT: Check if user wants to continue or needs clarification -->
<!-- CONTEXT: Just introduced the Colormxr concept -->
<!-- PILLS: ["Let's begin", "Tell me more", "What will I learn?"] -->

## [ENGAGE: open_interface]
<!-- AI_PROMPT: Direct user to open the Colormixer interface -->
<!-- REQUIRED_ACTION: open_interface -->
<!-- PILLS: ["Open Colormixer now", "Tell me more first"] -->

## [OBSERVE: interface_overview]
<!-- AI_PROMPT: Ask what they notice about the interface -->
<!-- FOCUS: Three main sliders, color square, background -->
<!-- PILLS: ["I see three sliders", "What should I notice?"] -->

## [EXPERIMENT: slider_exploration]
<!-- AI_PROMPT: Guide user to experiment with top slider -->
<!-- PILLS: ["I see it changing", "What am I looking for?"] -->
```

### Parser (replace `utils/lessonParser.js`)

```javascript
function parseLesson(markdownContent) {
  const chunks = markdownContent.split(/^## \[(.*?)\]$/gm);
  return chunks.map(chunk => ({
    type: extractType(chunk),       // EXPOSITION, CHECKPOINT, ENGAGE, OBSERVE, EXPERIMENT
    content: extractContent(chunk), // Plain text/HTML for EXPOSITION
    metadata: {
      aiPrompt: extractComment(chunk, 'AI_PROMPT'),
      pills: extractComment(chunk, 'PILLS'),        // JSON array string
      context: extractComment(chunk, 'CONTEXT'),
      requiredAction: extractComment(chunk, 'REQUIRED_ACTION'),
      focus: extractComment(chunk, 'FOCUS'),
    }
  }));
}
```

### Mode-Switching Logic (update `TutorSidebar.jsx`)

```javascript
const [mode, setMode] = useState('sequential'); // 'sequential' | 'ai_engaged'
const [currentChunk, setCurrentChunk] = useState(0);

function handleNextChunk() {
  const chunk = chunks[currentChunk];

  if (chunk.type === 'EXPOSITION') {
    displayParagraph(chunk.content);
    setCurrentChunk(prev => prev + 1);
  } else {
    // CHECKPOINT, ENGAGE, OBSERVE, EXPERIMENT
    setMode('ai_engaged');
    activateAI({
      prompt: chunk.metadata.aiPrompt,
      context: chunk.metadata.context,
      pills: chunk.metadata.pills,
    });
  }
}
```

### State Shape

```javascript
{
  mode: 'sequential' | 'ai_engaged',
  currentChunk: 5,
  chunkType: 'CHECKPOINT',
  lessonId: 'colormixing_101',
  aiContext: {
    lastReadContent: '...',
    waitingForAction: 'open_interface',
    userProgress: {
      hasOpenedInterface: false,
      hasMovedSlider: false,
    }
  },
  conversationHistory: [...]
}
```

---

## AI Behavior Rules

- Speaks as **"Colormxr Course Guide"** — never as "Claude" or "an AI"
- UI label: "Course Guide" or "Ask David" — NOT "AI Chat"
- **Max one question per response**
- Get students into the Colormixer as fast as possible
- Never judge color choices (perception is subjective)
- Redirect off-topic questions back to current lesson
- Allowed questions: observation-tied ("What did you notice when..."), readiness checks ("Ready to move on?")
- Prohibited: open-ended opinion questions, discussion fishing

### System Prompt (in `/app/api/chat/route.ts`)
```
You are the Colormxr Course Guide, teaching David's Interactive Color Composition methodology.
Keep responses brief and action-oriented (under 200 tokens).
After every explanation, direct the student to try something in the Colormixer.
Maximum one question per response.
Never refer to yourself as Claude or as an AI.
Color perception is subjective — never judge a student's color choices.
```

---

## API — Request / Response Format

### Request (`/api/chat`)
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

### Response
```json
{
  "response": "AI message text",
  "ui": {
    "type": "pills",
    "options": ["Option 1", "Option 2", "Option 3"]
  },
  "usage": {
    "input_tokens": 1234,
    "output_tokens": 56,
    "cache_read_tokens": 60000,
    "cost_usd": 0.003
  }
}
```

---

## Database Schema (AI Tables)

### `ai_conversations`
```
id                UUID PK
user_id           UUID FK → auth.users
lesson_id         TEXT
exercise_id       TEXT
session_id        TEXT
messages          JSONB
created_at        TIMESTAMP
updated_at        TIMESTAMP
last_message_at   TIMESTAMP
```

### `ai_token_usage`
```
id                    UUID PK
user_id               UUID FK → auth.users
conversation_id       UUID FK → ai_conversations
lesson_id             TEXT
input_tokens          INTEGER
output_tokens         INTEGER
cache_creation_tokens INTEGER
cache_read_tokens     INTEGER
total_cost_usd        DECIMAL(10,6)
model                 TEXT
created_at            TIMESTAMP
```

RLS enabled on all AI tables — users access only their own data.

---

## Component Integration

### TutorSidebarWithLesson Props
| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | boolean | Controls visibility |
| `closeModal` | function | Close callback |
| `lessonFilename` | string | File in `_text_content/` |
| `lessonId` | string | Sent to AI for context |
| `exerciseId` | string | Sent to AI for context |
| `lessonTitle` | string | Header display text |

### Adding a New Exercise
1. Create `app/exercise/section[N]/[name]/page.jsx`
2. Add `TutorSidebarWithLesson` with appropriate `lessonFilename` + `lessonId`
3. Add `ColorControllerUI` with layout props
4. Create matching markdown file in `_text_content/`

### ColorControllerUI Layout Modes
```jsx
<ColorControllerUI
  layoutMode="grid"      // grid | cosmic | radiant | svg
  row={5} col={5}
  width={150} height={150}
  hSpace={20} vSpace={20}
/>
```

---

## Pill Design Rules
- Always offer 3 types: **Forward** ("Got it"), **Depth** ("Tell me more"), **Support** ("I'm stuck")
- 2–5 words max per pill
- No more than 4 pills total
- Always include open text input alongside pills

---

## Cost Controls
- Max 300 tokens per AI response
- Rate limit: 50 messages/session, 500 chars/message
- Prompt caching: lesson content cached in system prompt (~90% savings)
- Cache duration: ~5 minutes (ephemeral)

---

## Auth Pattern
App uses localStorage-based sessions. Pass `accessToken` from client:
```javascript
const { data: { session } } = await supabase.auth.getSession();
// send session.access_token in request body
// server validates with supabase.auth.getUser(accessToken)
```
Service role key is NOT used.
