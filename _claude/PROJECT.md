# Colormxr Studio - Project Overview

## Project Summary
Colormxr Studio is an interactive color theory education web application built with Next.js. It provides visual, hands-on exercises for learning color mixing, relationships, and theory through customizable shape grids and layouts. Users can manipulate RGB/CMY color values via sliders and save their work to a gallery.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4
- **Language**: JavaScript/TypeScript (mixed)
- **Backend**: Supabase (database + storage)
- **State Management**: React Context API
- **UI Components**: Headless UI, SweetAlert2
- **Additional**: html2canvas (for image capture), lightgallery (for image galleries)

## Project Structure

```
colormxr_studio_ai/
├── app/                          # Next.js app router pages
│   ├── api/                     # API routes (NEW)
│   │   ├── chat/                # Claude AI chat endpoint
│   │   └── lessons/             # Lesson content server
│   ├── exercise/                 # Color theory exercises
│   │   ├── section1/            # Basic exercises (color wheel, mixing, etc.)
│   │   └── section3/            # Advanced exercises (balancing, HSL, etc.)
│   ├── gallery/                 # User-created compositions gallery
│   ├── palette-gallery/         # Palette browsing
│   ├── shapeset-creator/        # Tool for creating custom shape sets
│   ├── svg-viewer/              # SVG file viewer
│   ├── welcome/                 # Onboarding page
│   ├── layout.tsx               # Root layout with providers
│   └── globals.css              # Global styles
├── components/
│   ├── ColorControllerUI.js     # Main color manipulation component
│   ├── SVGColorControllerUI.jsx # SVG-specific controller
│   ├── layouts/                 # Layout rendering components
│   │   ├── GridLayout.jsx      # Rectangular grid layout
│   │   ├── CosmicLayout.jsx    # Concentric shapes layout
│   │   ├── RadiantLayout.jsx   # Radial/sunburst layout
│   │   └── SVGLayout.jsx       # External SVG file loader
│   ├── Modals/                  # Modal components
│   │   ├── ExerciseModalV.jsx  # Exercise instructions
│   │   ├── ImportSVGModal.jsx  # SVG import dialog
│   │   ├── NewShapesetModal.jsx # Shapeset creation
│   │   ├── SeriesGalleryAddModal.jsx # Gallery add
│   │   ├── TutorSidebar.jsx    # AI tutor sidebar (NEW)
│   │   ├── TutorSidebarWithLesson.jsx # Lesson loader wrapper (NEW)
│   │   ├── ChatMessage.jsx     # AI chat message display (NEW)
│   │   └── ChatInput.jsx       # Chat input field (NEW)
│   └── [other UI components]
├── hooks/                       # Custom React hooks
│   ├── useColorState.js        # RGB/CMY color state management
│   ├── useColorSliders.js      # Slider logic and calculations
│   └── useShapeSelection.js    # Shape selection and linking
├── contexts/
│   └── ModalContext.js         # Modal state management
├── utils/                       # Utility functions
│   ├── auth.js                 # Supabase auth utilities
│   ├── supabase.js             # Supabase client
│   ├── navigation.js           # Navigation helpers
│   ├── lessonParser.js         # Markdown lesson parser (NEW)
│   └── [other utilities]
├── _text_content/               # Lesson content (NEW)
│   ├── welcome.md              # Welcome page lesson
│   └── colormixing_101.md      # Main color theory lesson
├── db/                          # Database migrations (NEW)
│   └── migrations/
│       └── create-ai-tutor-tables.sql
└── public/                      # Static assets

```

## Core Concepts

### 1. ColorControllerUI Component
The heart of the application. Renders interactive color grids where users can:
- Select shapes and adjust RGB/CMY values via sliders
- Link shapes to change colors together
- Switch between different layout modes (grid, cosmic, radiant, SVG)
- Save compositions as images to gallery

**Key Props:**
- `layoutMode`: "grid" | "cosmic" | "radiant" | "svg"
- `row`, `col`: Grid dimensions
- `width`, `height`: Shape dimensions
- `hSpace`, `vSpace`: Spacing between shapes
- `svgPath`, `svgContent`: For SVG mode

### 2. Layout System
Modular layout architecture supporting multiple rendering modes:
- **GridLayout**: Standard rectangular grid (default, backward compatible)
- **CosmicLayout**: Concentric shapes emanating from center
- **RadiantLayout**: Radial/sunburst pattern
- **SVGLayout**: External SVG files with colorable elements

All layouts share the same color manipulation hooks and selection logic.

### 3. Custom Hooks
**useColorState**: Manages RGB/CMY color values
**useColorSliders**: Handles slider interactions and color calculations
**useShapeSelection**: Manages shape selection and linking behavior

These hooks enable consistent color manipulation across all layout modes.

### 4. Exercise Structure
Exercises are organized by section and difficulty:
- **Section 1**: Fundamentals (color wheel, primary/secondary, mixing, relationships)
- **Section 3**: Advanced (balancing, HSL experiments, transparency illusions)

Each exercise is a separate Next.js page with its own configuration.

## Key Features

### AI Tutor Integration (NEW - Feb 2026)
**Status**: ✅ Implemented

An interactive AI-powered teaching assistant that delivers David's color theory methodology through conversational learning.

**Components:**
- **TutorSidebar** - Main sidebar UI with sequential paragraph reveal and integrated chat
- **ChatMessage** - AI/user message display with suggestion pills
- **ChatInput** - Message input field

**Features:**
- Sequential content reveal (click/tap anywhere to continue)
- Word-by-word fade-in animation on new paragraphs
- Suggestion pills for guided responses
- Smart auto-scrolling (engages at 50% viewport)
- Markdown lesson loading from `_text_content/` directory
- Claude Sonnet 4.5 API integration with prompt caching

**Backend:**
- `/app/api/chat/route.ts` - Claude API integration
- `/app/api/lessons/[filename]/route.js` - Lesson content server
- Supabase tables: `ai_conversations`, `ai_token_usage`
- Row Level Security (RLS) for user data protection

**Documentation:**
- [AI_INTEGRATION_NOTES.md](AI_INTEGRATION_NOTES.md) - Technical implementation details
- [AI_STRATEGY.md](AI_STRATEGY.md) - Content strategy and learning experience design
- [AI_TUTOR_SETUP.md](AI_TUTOR_SETUP.md) - Setup instructions

**Cost Optimization:**
- Prompt caching reduces costs by 90% on cached content
- Rate limiting: 50 messages/session, 500 chars/message

### Gallery System
- Users can save compositions as PNG images
- Gallery organized by series (collections)
- Backed by Supabase storage and database
- Supports metadata (colors, dimensions, timestamps)

### Shapeset Creator
- Tool for creating custom shape arrangements
- Import external SVG files
- Define colorable elements
- Save/load custom shapesets

### Authentication
- Supabase-based user authentication
- Protected routes for saving/managing content
- AuthProvider wraps entire app (app/layout.tsx:25)
- localStorage-based session management

### Responsive Design
- iOS bounce prevention (DisableIOSBounce component)
- Tailwind CSS for responsive layouts
- Mobile-friendly exercise interface

## Database Schema (Supabase)

### shapeset_gallery table
```
- id: uuid (primary key)
- filename: text
- shape_colors: jsonb
- background_color: text
- rows: integer
- cols: integer
- created_at: timestamp
```

### ai_conversations table (NEW)
```
- id: uuid (primary key)
- user_id: uuid (foreign key to auth.users)
- lesson_id: text
- exercise_id: text
- session_id: text
- messages: jsonb (conversation history)
- created_at: timestamp
- updated_at: timestamp
- last_message_at: timestamp
```

### ai_token_usage table (NEW)
```
- id: uuid (primary key)
- user_id: uuid (foreign key to auth.users)
- lesson_id: text
- input_tokens: integer
- output_tokens: integer
- cache_creation_tokens: integer
- cache_read_tokens: integer
- total_cost_usd: decimal(10,6)
- model: text
- created_at: timestamp
```

### Storage
- `gallery` bucket: Stores user-generated images

### Row Level Security (RLS)
- All AI tables have RLS policies enabled
- Users can only access their own conversations and token usage data

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=sk-ant-api03-...   # For AI tutor integration
```

**Note:** Service role key is NOT required for AI integration (we use user session authentication)

## Development Workflow

### Getting Started
```bash
npm install
npm run dev          # Start dev server
npm run dev:clean    # Clear port 3000 first, then start
npm run build        # Production build
npm run start        # Start production server
```

### Key Scripts
- `utils/clear-port.js`: Kills processes on port 3000
- `utils/navigation.js`: Navigation helpers
- `utils/setup-supabase.js`: Database setup utilities

## Recent Refactoring
The project underwent a major refactoring to support multiple layout modes (see REFACTORING_SUMMARY.md). The previous monolithic ColorControllerUI was split into:
1. Modular layout components
2. Reusable custom hooks
3. Orchestrator component

This enables easy addition of new layout modes without modifying core logic.

## Current Status
- ✅ Grid layout fully functional
- ✅ Cosmic layout implemented
- ✅ Radiant layout implemented
- ✅ SVG layout implemented
- ✅ Gallery system operational
- ✅ Multiple exercises completed
- 🚧 Some files show modifications (git status shows M files)

## Modified Files (Current Session)
```
M app/gallery/page.jsx
M app/gallery/series/[id]/page.jsx
M app/shapeset-creator/page.jsx
M app/welcome/page.tsx
M components/ColorControllerUI.js
M components/Modals/ExerciseModalV.jsx
M components/Modals/ImportSVGModal.jsx
M components/Modals/NewShapesetModal.jsx
M components/Modals/SeriesGalleryAddModal.jsx
```

## Architecture Patterns

### Component Composition
- Layout components receive shape data and event handlers as props
- Hooks encapsulate stateful logic
- Main controller orchestrates everything

### State Management
- Local state via useState for component-specific data
- Context API for cross-component state (modals, auth)
- No global state management library (Redux, Zustand, etc.)

### File Organization
- Page components in `app/` directory (Next.js App Router)
- Reusable components in `components/` directory
- Business logic in `utils/` and `hooks/`
- Layouts separated into `components/layouts/`

## Common Tasks

### Adding a New Exercise
1. Create new directory in `app/exercise/section[N]/[exercise-name]/`
2. Add `page.jsx` with exercise configuration
3. Configure ColorControllerUI with appropriate props
4. Add exercise metadata and instructions

### Adding a New Layout Mode
1. Create layout component in `components/layouts/`
2. Implement shape rendering logic
3. Export component
4. Add case to layout switcher in ColorControllerUI
5. Document props and usage

### Modifying Color Logic
- Edit hooks in `hooks/` directory
- Changes automatically apply to all layouts
- Test across different layout modes

## Important Notes
- Project uses both .js and .tsx files (mixed JavaScript/TypeScript)
- Multiple config files exist for same tools (e.g., next.config.js and next.config.mjs)
- Some template files in `_template/` and `_template_ext/` directories
- Custom fonts in `_fonts/` directory
- iOS-specific optimizations included

## External Dependencies
- **Supabase**: Backend database and storage
- **Anthropic SDK**: Claude AI API integration (NEW)
- **Tailwind**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **LightGallery**: Image gallery lightbox
- **html2canvas**: Client-side screenshot/image generation
- **SweetAlert2**: Beautiful alert/modal dialogs

## Git Information
- **Current Branch**: main
- **Recent Commits**:
  - e46d8c5: relative sliders
  - 738c3aa: feature additions
  - ead121f: refactor save
  - 20a2da8: Initial commit

## Quick Reference

### Main Entry Points
- `/` - Home page (app/page.tsx)
- `/welcome` - Onboarding page
- `/exercise/section1/*` - Basic exercises
- `/exercise/section3/*` - Advanced exercises
- `/gallery` - User gallery
- `/shapeset-creator` - Shapeset creation tool

### Key Components to Know
- `ColorControllerUI.js` - Main interactive component
- `layouts/*.jsx` - Layout rendering engines
- `hooks/*.js` - Reusable color/selection logic
- `Modals/*.jsx` - Dialog components

### When Working on This Project
1. Check REFACTORING_SUMMARY.md for architecture details
2. Use existing hooks for color manipulation
3. Follow layout pattern for new visual modes
4. Test changes across different layout modes
5. Ensure backward compatibility with existing exercises

---

## Additional Documentation

- [AI_INTEGRATION_NOTES.md](AI_INTEGRATION_NOTES.md) - Detailed technical notes on AI tutor implementation
- [AI_STRATEGY.md](AI_STRATEGY.md) - Content strategy for blending sequential and AI-driven learning
- [AI_TUTOR_SETUP.md](AI_TUTOR_SETUP.md) - Setup and configuration guide
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Deployment instructions
- [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - Architecture refactoring details

---

**Last Updated**: 2026-02-22
**Project Version**: 0.2.0 (with AI Integration)
**Node Version**: Compatible with Node 20+
**Next.js Version**: 15.5.12
