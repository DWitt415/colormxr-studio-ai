# Colormxr — Content Strategy & Phase 2 Spec

Read this when working on:

- `utils/lessonParser.js` (needs full replacement)
- `components/Modals/TutorSidebar.jsx` (mode-switching logic)
- `components/Modals/TutorSidebarWithLesson.jsx`
- `_text_content/*.md` (authoring lesson content)

---

## Current State (Phase 1)

- `lessonParser.js` splits markdown naively on `\n\n` — paragraphs only, no mode awareness
- `TutorSidebar` renders sequential paragraphs; user clicks to advance
- AI chat sits below lesson content — separate, not interweaved
- Pills only appear after a user-initiated message
- Content mode markers exist in the spec but are **not yet parsed or acted on**

---

## Goal (Phase 2)

Blend sequential lesson delivery with AI-triggered interaction at defined points in the content. The markdown file is the single source of truth for both content and interaction choreography.

---

## Three Content Modes

|Mode|Who Acts|Behavior|
|---|---|---|
|`EXPOSITION`|User clicks to advance|Sequential text reveal, word-by-word fade-in|
|`CHECKPOINT`|AI auto-triggers|Pauses flow, AI sends a message with pills automatically|
|`ENGAGE` / `OBSERVE` / `EXPERIMENT`|AI coaches|AI guides hands-on Colormixer activity; waits for student response|

---

## Markdown Format

Lesson files live in `_text_content/`. Each chunk is delimited by a `## [MODE]` header. HTML comments carry metadata for the AI.

```markdown
## [EXPOSITION]
Plain lesson text here. Rendered sequentially. User clicks to advance.

## [EXPOSITION]
More exposition. Each EXPOSITION chunk = one paragraph reveal.

## [CHECKPOINT: understanding]
<!-- AI_PROMPT: Check if the student wants to continue or needs clarification -->
<!-- CONTEXT: Just introduced the RGB+CMY concept -->
<!-- PILLS: ["Let's begin", "Tell me more", "What will I learn?"] -->

## [ENGAGE: open_interface]
<!-- AI_PROMPT: Direct the student to open the Colormixer interface -->
<!-- REQUIRED_ACTION: open_interface -->
<!-- PILLS: ["Open Colormixer now", "Tell me more first"] -->

## [OBSERVE: interface_overview]
<!-- AI_PROMPT: Ask what they notice about the interface -->
<!-- FOCUS: Three main sliders, color square, background -->
<!-- PILLS: ["I see three sliders", "What should I notice?"] -->

## [EXPERIMENT: slider_exploration]
<!-- AI_PROMPT: Guide the student to move the top slider and observe -->
<!-- PILLS: ["I see it changing", "What am I looking for?"] -->
```

**Notes:**

- `CHECKPOINT` / `ENGAGE` / `OBSERVE` / `EXPERIMENT` chunks have no visible body text — metadata only
- `PILLS` value is a JSON array string
- `REQUIRED_ACTION` signals the UI to wait for a specific student action before advancing

---

## Parser Replacement (`utils/lessonParser.js`)

Replace the current naive splitter with this structure:

```javascript
function parseLesson(markdownContent) {
  // Split on mode headers: ## [TYPE] or ## [TYPE: subtype]
  const chunks = markdownContent.split(/^## \[([^\]]+)\]$/gm);

  return chunks
    .filter(chunk => chunk.trim())
    .map(chunk => {
      const typeMatch = chunk.match(/^([A-Z]+)(?::[\s\w_]+)?/);
      const type = typeMatch ? typeMatch[1] : 'EXPOSITION';

      return {
        type,                                      // EXPOSITION | CHECKPOINT | ENGAGE | OBSERVE | EXPERIMENT
        subtype: extractSubtype(chunk),            // e.g. 'open_interface', 'slider_exploration'
        content: extractContent(chunk),            // Plain text (EXPOSITION only)
        metadata: {
          aiPrompt:       extractComment(chunk, 'AI_PROMPT'),
          pills:          JSON.parse(extractComment(chunk, 'PILLS') || '[]'),
          context:        extractComment(chunk, 'CONTEXT'),
          requiredAction: extractComment(chunk, 'REQUIRED_ACTION'),
          focus:          extractComment(chunk, 'FOCUS'),
        }
      };
    });
}

function extractComment(chunk, key) {
  const match = chunk.match(new RegExp(`<!--\\s*${key}:\\s*(.+?)\\s*-->`));
  return match ? match[1].trim() : null;
}

function extractSubtype(chunk) {
  const match = chunk.match(/^[A-Z]+:\s*([\w_]+)/);
  return match ? match[1] : null;
}

function extractContent(chunk) {
  // Strip the mode header line and all HTML comments
  return chunk
    .replace(/^.*\n/, '')
    .replace(/<!--.*?-->/gs, '')
    .trim();
}
```

---

## Mode-Switching Logic (`TutorSidebar.jsx`)

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
      requiredAction: chunk.metadata.requiredAction,
    });
  }
}

function handleAIComplete() {
  // Called when AI interaction at a chunk is resolved
  setMode('sequential');
  setCurrentChunk(prev => prev + 1);
}
```

---

## Full State Shape

```javascript
{
  mode: 'sequential' | 'ai_engaged',
  currentChunk: 5,
  chunkType: 'CHECKPOINT',             // type of current non-EXPOSITION chunk
  lessonId: 'colormixing_101',
  aiContext: {
    lastReadContent: '...',            // last EXPOSITION text, for AI reference
    waitingForAction: 'open_interface', // null if no REQUIRED_ACTION
    userProgress: {
      hasOpenedInterface: false,
      hasMovedSlider: false,
    }
  },
  conversationHistory: []
}
```

---

## Lesson Authoring Guidelines

When writing or editing files in `_text_content/`:

- One idea per `EXPOSITION` chunk — keep them short (2–4 sentences)
- `CHECKPOINT` after every major concept introduction
- `ENGAGE` before asking a student to open or interact with the Colormixer
- `OBSERVE` after an action — always tied to something specific they just did
- `EXPERIMENT` for open exploration with a defined focus
- Pills follow the 3-type rule: **Forward**, **Depth**, **Support** (see `ai-tutor-context.md`)
- Never put visible body text in non-EXPOSITION chunks

---

## Files That Need Work Before Phase 2 Can Launch

1. `utils/lessonParser.js` — replace with parser above
2. `_text_content/colormixing_101.md` — reformat with content mode markers
3. `components/Modals/TutorSidebar.jsx` — add mode-switching logic
4. `app/api/chat/route.ts` — handle auto-triggered AI messages (no user input) at CHECKPOINT/ENGAGE/OBSERVE/EXPERIMENT chunks