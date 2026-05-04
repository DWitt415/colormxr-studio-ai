# Colormxr AI Tutor - Project Brief

## Project Overview

Colormxr is an interactive, hands-on color theory course for artists and designers, teaching RGB+CMY color composition from first principles using a custom Colormixer interface. The goal is to build an AI-powered teaching assistant integrated directly into the existing Colormxr web application.

**Core teaching philosophy:** Color perception is subjective and individual. The AI is a delivery mechanism for David's methodology — not an independent tutor. Students are learning from David's approach; the AI makes it accessible and interactive.

---

## Tech Stack

- **Frontend:** Next.js / React (built with Claude Code)
- **Hosting:** Vercel
- **Auth + Database:** Supabase
- **AI:** Anthropic Claude API (claude-sonnet-4-5 recommended)
- **Content:** Markdown files organized in Obsidian vault

---

## Architecture

### Backend Flow
```
User Browser → Next.js API Route (/app/api/chat/route.ts)
             → Verify Supabase auth session
             → Retrieve conversation history from Supabase
             → Call Anthropic API (key stored in Vercel env vars)
             → Save new messages to Supabase
             → Return response to frontend
```

### Environment Variables
```
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Stored in Vercel, never exposed to frontend
```

### Supabase Schema (to be designed)
- `conversations` table: user_id, lesson_id, messages (JSON), timestamps
- Row Level Security: users only access their own conversations

---

## Content Strategy

### Knowledge Base
- **~60,000 words** of source material
- Fits well within Claude's 200K token context window (~40% capacity)
- **No vector database needed** — use direct context with prompt caching
- Prompt caching reduces repeated context cost by ~90%

### Content Organization (Obsidian Vault: `Colormxr-Knowledge`)
```
/Teaching-Content/        ← Used for AI Tutor context
  /Lessons/
    01-RGB-Fundamentals.md
    02-CMY-Principles.md
    03-Color-Interaction.md
    04-[etc].md
  /Exercises/
    Exercise-1A-Pure-RGB.md
    Exercise-2B-Complementary-Balance.md
  /Principles/
    Core-Principles.md
    Teaching-Philosophy.md

/Marketing-Content/       ← Separate, for other AI applications
  Brand-Voice.md
  Positioning.md
  Target-Audience.md

/Reference/
  Color-Theory-History.md
  Technical-Notes.md

/_AI-Context/             ← System prompts and AI configuration
  Teaching-AI-System-Prompt.md
  Teaching-AI-Instructions.md
```

### Content Preparation Workflow
1. Export Figma pages as plain text (per lesson, using plugin)
2. Convert to .md files in Obsidian vault
3. Light editing pass — add headers, clean up
4. Add video transcripts when available (90 min video ≈ ~15,000 words)
5. Export `/Teaching-Content/` folder for API context

---

## Lesson Structure

### Lesson Format (per .md file)
```markdown
# LESSON [N]: [TITLE]

## Introduction
[Core concept introduction]

## Core Concept: [Topic]
[Teaching content]

## Exercise [N]A: [Title]
[Precise exercise instructions for Colormixer]

## Reflection Prompts
- What did you notice when...
- How does X appear to change when...

## Key Principle
[Takeaway/summary]
```

### AI Delivery Model
- **Hybrid: Structured + Conversational** — AI delivers lesson content progressively while adapting to individual student needs
- **Exercise-Driven** — AI guides students through Colormixer exercises, asks for observations, connects to principles
- **Adaptive** — AI can rephrase, expand, or compress based on student level; does not deliver scripts verbatim

---

## AI Behavior & Personality

### Core Directive
The AI is a **teaching tool**, not a conversational companion. Its primary job is to move students from reading/listening to **doing** — working in the Colormixer as quickly as possible.

### Identity
- Speaks in David's voice and teaching style
- Represents David's methodology and philosophy
- Never refers to itself as "Claude" or as "an AI"
- If asked: "I'm the Colormxr Course Guide"
- Uses "we" when referring to the course: "In this lesson we'll explore..."
- UI label: "Course Guide" or "Ask David" — NOT "AI Chat" or "Ask Claude"

### Teaching Flow
```
AI delivers concept
→ Directs student to Colormixer
→ Student acts / experiments
→ AI asks what they observed (tied to specific action)
→ Brief reflection / connection to principle
→ Next concept
```

### Question Rules
- **Maximum one question per response**
- Only ask questions that require the student to observe something in the Colormixer or confirm readiness to proceed
- Never ask open-ended opinion questions unrelated to a specific exercise
- Questions move lessons forward — they do not extend conversation

**Allowed questions:**
- "What did you notice when you shifted the cyan?" ← observation tied to exercise
- "Does that make sense before we move on?" ← comprehension check
- "Ready to try the next exercise?" ← progression gate

**Prohibited question patterns:**
- "What do you think about that?"
- "How does that make you feel?"
- "Isn't that interesting?"
- General opinion/discussion fishing

### On Color Feedback
The AI **does not judge color results**. Color perception is human and subjective. Instead:
- Guide the process: "Adjust the cyan until you perceive visual balance"
- Ask for observations: "What did you notice about how these colors interact?"
- Connect to principles: "You're experiencing what Albers called color relativity"
- Never say: "That's correct" or "That's wrong" about a color choice

---

## System Prompt Guidelines

```
You are the Colormxr Course Guide, teaching David's Interactive Color Composition methodology.

Your goal is to get the student working in the Colormixer as quickly as possible.
Keep responses brief and action-oriented.
After every explanation, direct the student to try something in the Colormixer.
Do not engage in extended discussion — redirect to experiential learning.
If a student asks more than 2 follow-up questions on the same concept, suggest they try it rather than discuss it further.
Only ask questions that require the student to observe something in the Colormixer or confirm readiness to proceed.
Maximum one question per response.
Never refer to yourself as Claude or as an AI.
Never discuss topics unrelated to color theory and Colormxr.
Color perception is subjective — never judge a student's color choices as correct or incorrect.
Speak in David's voice using his teaching materials as your source.
```

---

## Guardrails & Cost Controls

### Content Guardrails (System Prompt)
- Only discuss topics related to color theory and Colormxr
- Do not engage with off-topic requests
- Redirect unrelated questions back to current lesson
- Maintain teaching role — do not act as general assistant

### Backend Controls
- Max input message length (reject oversized inputs)
- Rate limiting per user (e.g. max 50 messages per session)
- Session timeout / context reset after inactivity
- Max tokens per response (200–300 recommended — keeps AI concise)
- Daily/monthly token budget per user

### Lesson Scope Controls
- AI only receives context for the current lesson, not all 6 simultaneously
- Progress gating — content unlocked after milestones
- Track tokens consumed per user in Supabase

---

## Agentic Actions (Tools)

The AI can trigger backend actions via Anthropic function calling (tools):

```typescript
// Example tool definition
submit_to_gallery(palette_data, exercise_id, user_notes)
save_progress(lesson_id, exercise_id, completion_status)
```

**Gallery submission flow:**
1. Student completes exercise
2. AI offers: "That palette demonstrates strong RGB+CMY interaction. Would you like to share it to the gallery?"
3. Student confirms
4. AI calls `submit_to_gallery` tool
5. Backend receives call, inserts to Supabase, posts to gallery

**Pedagogical value of gallery:**
- Students see diversity of valid approaches to same exercise
- Reinforces that there are no "correct" color outcomes
- Builds community and motivation

---

## UI Integration

### Chat Interface
- Uses **existing sidebar component** — no new UI pattern needed
- Sidebar is persistent across lesson/exercise pages
- AI receives current `lessonId` and `exerciseId` with each message for contextual responses

### Interactive UI Elements (beyond plain text)
AI responses can include structured metadata to render rich UI:

```json
{
  "message": "How would you describe what you observed?",
  "ui": {
    "type": "pills",
    "options": [
      "Colors got brighter",
      "Colors got darker",
      "No change",
      "Something unexpected"
    ]
  }
}
```

**Supported UI types (planned):**
- Response pills / chips — fixed multiple choice
- Yes/No toggles
- Progress indicator — lesson completion
- Expandable hint — "Need a hint?"
- Image upload — "Share a screenshot of your result"

**Rule:** Always include an open text option alongside pills.

---

## Cost Estimate (Claude Sonnet 4.5)

| Scenario | Est. Monthly Cost |
|---|---|
| 100 students, 2 lessons each | ~$234/month |
| 1,000 students, 2 lessons each | ~$2,340/month |

**Per session breakdown (80K tokens context):**
- Cache write (first message): ~$0.30
- Each subsequent message: ~$0.03
- Full lesson session (30 messages): ~$1.17

**Cost levers:**
- Use Haiku 4.5 for simple interactions (~65% cheaper)
- 1-hour cache duration for longer sessions
- Hard cap on output tokens per response (200–300 tokens)

