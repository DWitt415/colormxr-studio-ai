
# Colormxr Studio — Claude Code Context

## What This Is

Interactive color theory education app. Students learn RGB/CMY color composition through hands-on exercises in a custom **Colormixer** interface. An AI-powered **Course Guide** (backed by Claude API) delivers the creator David Witt's teaching methodology.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router), React 18
- **Styling**: Tailwind CSS — do not change styles without explicit instruction
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Anthropic Claude API — model `claude-sonnet-4-5-20250929`
- **Hosting**: Vercel

---

## Key File Locations

```
app/api/chat/route.ts                     # Claude API endpoint (server only)
app/api/lessons/[filename]/route.js       # Serves markdown lesson files
app/welcome/page.tsx                      # Onboarding — uses TutorSidebarWithLesson
app/exercise/section1/                    # Basic exercises
app/exercise/section3/                    # Advanced exercises

components/ColorControllerUI.js           # Main interactive color component
components/layouts/                       # GridLayout, CosmicLayout, RadiantLayout, SVGLayout
components/Modals/TutorSidebar.jsx        # AI tutor sidebar UI
components/Modals/TutorSidebarWithLesson.jsx  # Loads markdown, wraps TutorSidebar
components/Modals/ChatMessage.jsx         # Message + pill rendering
components/Modals/ChatInput.jsx           # Message input

hooks/useColorState.js                    # RGB/CMY state
hooks/useColorSliders.js                  # Slider logic
hooks/useShapeSelection.js               # Shape selection + linking

utils/lessonParser.js                     # Parses markdown into chunks — needs replacing (see Phase 2)
utils/supabase.js                         # Supabase client

_text_content/                            # Lesson markdown files
  welcome.md
  colormixing_101.md                      # Needs content markers added (Phase 2)

db/migrations/create-ai-tutor-tables.sql
```

---

## Dev Commands

```bash
npm run dev           # Start dev server
npm run dev:clean     # Kill port 3000, then start
npm run build
npm run sync-content  # Sync Obsidian vault → /content/ before deploying
```

---

## Hard Rules — Never Violate

- **ANTHROPIC_API_KEY is server-side only.** Never reference it in client code, never expose to browser.
- **Do not make styling or design changes without explicit instruction.** This includes colors, spacing, layout, typography — anything visual.
- **Auth uses localStorage accessToken, not service role key.** Pattern: client gets session → passes `access_token` in request body → server calls `supabase.auth.getUser(accessToken)`.
- **Do not modify color manipulation hooks** (`useColorState`, `useColorSliders`, `useShapeSelection`) unless specifically asked — changes affect all layouts.
- **Do not add new npm packages** without confirming first.

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=        # server-side only
```

---

## Database — AI Tables (RLS enabled, users see only their own data)

**`ai_conversations`**: `id`, `user_id`, `lesson_id`, `exercise_id`, `session_id`, `messages` (JSONB), timestamps

**`ai_token_usage`**: `id`, `user_id`, `conversation_id`, `lesson_id`, input/output/cache token counts, `total_cost_usd`, `model`, `created_at`

---

## API Shape

**Request to `/api/chat`:**

```json
{ "message": "", "lessonId": "", "exerciseId": "", "conversationHistory": [], "accessToken": "", "sessionId": "" }
```

**Response:**

```json
{ "response": "", "ui": { "type": "pills", "options": [] }, "usage": { "input_tokens": 0, "output_tokens": 0, "cache_read_tokens": 0, "cost_usd": 0 } }
```

---

## ColorControllerUI — Layout Modes

```jsx
<ColorControllerUI
  layoutMode="grid"   // grid | cosmic | radiant | svg
  row={5} col={5}
  width={150} height={150}
  hSpace={20} vSpace={20}
/>
```

---

## TutorSidebarWithLesson — Props

|Prop|Type|Description|
|---|---|---|
|`isOpen`|boolean|Controls visibility|
|`closeModal`|function|Close callback|
|`lessonFilename`|string|File in `_text_content/`|
|`lessonId`|string|Sent to AI for context|
|`exerciseId`|string|Sent to AI for context|
|`lessonTitle`|string|Header display text|

---

## What's Currently Broken / Pending

- `utils/lessonParser.js` — currently splits naively on `\n\n`. Needs full replacement for Phase 2.
- `_text_content/colormixing_101.md` — needs content mode markers added before Phase 2 can work.
- Pills only appear after user-initiated chat. Phase 2 will have AI auto-trigger at CHECKPOINT markers.

---

## Phase 2 — Content Mode System (next major build)

For detailed spec, read: `claude/content-strategy.md`

**Short version:** Lesson markdown will be chunked by mode type. Three modes:

- `EXPOSITION` — sequential reveal, user clicks to advance
- `CHECKPOINT` — pauses flow, AI auto-sends a message with pills
- `ENGAGE` / `OBSERVE` / `EXPERIMENT` — AI coaches hands-on Colormixer activity

---

## Adding a New Exercise (checklist)

1. Create `app/exercise/section[N]/[name]/page.jsx`
2. Add `<TutorSidebarWithLesson>` with `lessonFilename` + `lessonId`
3. Add `<ColorControllerUI>` with layout props
4. Create matching `.md` in `_text_content/`

---

## For AI Tutor Behavior / Persona Rules

Read: `_claude/ai-tutor-context.md`

## For Phase 2 Content Format / Parser Spec

Read: `_claude/content-strategy.md`