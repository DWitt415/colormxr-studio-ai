# Colormxr Extended Template for Monorepo

This extended template directory (`_template_ext`) contains a complete, self-contained implementation of the Colormxr app with all modal functionalities, galleries, and supporting components. It's designed for use in monorepo configurations where multiple variations of the app need to be deployed.

## 📁 Directory Structure

```
_template_ext/
├── components/
│   ├── Modals/              # All modal components
│   │   ├── PaletteModal.jsx          # Color palette export modal
│   │   ├── CompositionModal.jsx      # Shapeset composition export modal  
│   │   ├── ImportSVGModal.jsx        # SVG file import modal
│   │   ├── InstructionModalV.jsx     # Instruction display modal
│   │   └── SlideInstructionModalSimple.jsx  # Slide-based instruction modal
│   ├── ExerciseIconsPanel.jsx       # Exercise control icons with feature flags
│   ├── Footer.jsx                   # Main footer with gallery navigation
│   └── GalleryFooter.jsx            # Gallery-specific footer with modal state
├── pages/                    # Page templates (structure only)
│   ├── palette-gallery/
│   ├── gallery/
│   └── gallery-entry/
├── styles/
│   ├── globals.css                  # Main CSS with Tailwind and modal styles
│   └── SlideInstructionModalSimple.module.css  # CSS modules for slide modal
├── utils/
│   └── navigation.js               # Navigation utilities and storage management
└── README.md                       # This file
```

## 🧩 Component Overview

### Modal System
All modals use Headless UI for accessibility and smooth transitions:

- **PaletteModal.jsx** - Exports color palettes as PNG/SVG with gallery integration
- **CompositionModal.jsx** - Exports shapeset compositions with grid rendering
- **ImportSVGModal.jsx** - Imports SVG files with automatic color extraction
- **InstructionModalV.jsx** - Standard instruction modal with fixed positioning  
- **SlideInstructionModalSimple.jsx** - Advanced slide-based instruction system

### Global Modal State Management
The template uses a global event system for modal control:

```javascript
// Open palette modal from anywhere
window.dispatchEvent(new CustomEvent('openPaletteModal', {
  detail: { colors: [], backgroundColor: 'rgb(255,255,255)' }
}));

// Open composition modal  
window.dispatchEvent(new CustomEvent('openCompositionModal', {
  detail: { shapeColors: [], row: 5, col: 5 }
}));

// Open import SVG modal
window.dispatchEvent(new CustomEvent('openImportSVGModal', {
  detail: { onSVGImport: handleFunction }
}));
```

### Footer Components
- **Footer.jsx** - Main app footer with exercise info and gallery access
- **GalleryFooter.jsx** - Gallery-specific footer with modal listeners and navigation

## ⚙️ Configuration System

### Exercise Feature Flags
Use the config-based system to control which features are available:

```javascript
const exerciseConfig = {
  features: {
    importSVG: true,        // Show SVG import icon
    exportPalette: true,    // Show palette export icon  
    exportComposition: true // Show composition export icon
  }
}

// Pass to ExerciseIconsPanel
<ExerciseIconsPanel 
  config={exerciseConfig}
  onInstructionOpen={openInstructions}
/>
```

### Shapeset Configuration
Configure shapeset properties for consistent modal behavior:

```javascript
const shapesetConfig = {
  initShapeColors: ['#FF0000', '#00FF00', '#0000FF'],
  backgroundColor: '#FFFFFF',
  row: 5,
  col: 5
}
```

## 🎨 Styling System

### CSS Architecture
- **globals.css** - Tailwind directives, modal hierarchy, responsive design
- **SlideInstructionModalSimple.module.css** - Modular styles for slide animations

### Modal Z-Index Hierarchy
```css
.instruction-modal { z-index: 50 !important; }
.exercise-modal { z-index: 45 !important; }
.utility-modal { z-index: 40 !important; }
.palette-modal { z-index: 30 !important; }
```

## 🛠 Integration Guide

### 1. Copy Template to Your App
```bash
# Copy the entire template structure
cp -r _template_ext/* your-app/src/
```

### 2. Update Import Paths
All components use relative imports that need adjustment for your app structure:

```javascript
// Update these imports based on your directory structure
import PaletteModal from './Modals/PaletteModal'
import { storePreviousExercisePath } from '../utils/navigation'
```

### 3. Install Dependencies
Ensure these packages are installed:

```json
{
  "@headlessui/react": "^1.7.17",
  "html2canvas": "^1.4.1",
  "next": "^14.0.0",
  "react": "^18.2.0"
}
```

### 4. Configure Your Exercise Page
```javascript
import ExerciseIconsPanel from './components/ExerciseIconsPanel'
import Footer from './components/Footer'

function ExercisePage() {
  const config = {
    features: { importSVG: true, exportPalette: true, exportComposition: true }
  }
  
  const shapesetConfig = {
    initShapeColors: [], // Your shapeset colors
    backgroundColor: '#FFFFFF',
    row: 5,
    col: 5
  }

  return (
    <div>
      {/* Your exercise content */}
      
      <ExerciseIconsPanel 
        config={config}
        shapesetConfig={shapesetConfig}
        onInstructionOpen={() => setShowInstructions(true)}
      />
      
      <Footer 
        lesson="Section 4"
        exerciseNumber="Exercise 5-4" 
        title="Color Matching"
      />
    </div>
  )
}
```

### 5. Gallery Integration
For gallery pages, use GalleryFooter instead of Footer:

```javascript
import GalleryFooter from './components/GalleryFooter'

function GalleryPage() {
  return (
    <div>
      {/* Gallery content */}
      <GalleryFooter title="Color Compositions" />
    </div>
  )
}
```

## 📱 Navigation System

### Exercise Path Storage
The navigation system automatically stores exercise paths for seamless gallery→exercise transitions:

```javascript
import { storePreviousExercisePath, getPreviousExercisePath } from './utils/navigation'

// Store current path before navigating to gallery
storePreviousExercisePath()

// Get stored path when returning from gallery  
const previousPath = getPreviousExercisePath()
```

### Gallery State Management
Track which gallery the user last visited:

```javascript
import { storeLastViewedGallery, getLastViewedGallery, GALLERY_TYPES } from './utils/navigation'

// Store gallery type
storeLastViewedGallery(GALLERY_TYPES.PALETTES)

// Retrieve for gallery-entry redirection
const lastGallery = getLastViewedGallery()
```

## 🚀 Deployment Considerations

### Monorepo Setup
Each app in your monorepo can:
1. Copy this template as a base
2. Customize the config objects for different feature sets
3. Maintain consistent modal behavior across apps
4. Share the same navigation and storage utilities

### Environment Variables
Set up Supabase for gallery functionality:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Asset Dependencies  
Ensure these public assets are available:
- `/palette-icon.svg`
- `/gallery-add-icon.svg` 
- `/open-icon.svg`
- `/info.svg`
- `/gallery-icon.svg`
- `/home-icon.svg`
- `/slide-arrow.svg`

## 🔧 Customization

### Adding New Modals
1. Create modal component in `components/Modals/`
2. Add event listener in `GalleryFooter.jsx`
3. Add trigger in `ExerciseIconsPanel.jsx`
4. Update feature flags in config

### Styling Customization
- Modify `globals.css` for global styles
- Create new CSS modules for component-specific styles
- Update Tailwind classes in components

### Navigation Customization  
- Modify `utils/navigation.js` for custom path logic
- Update `DEFAULT_EXERCISE_PATHS` for your app structure
- Add new storage keys for additional state

## 🐛 Troubleshooting

### Common Issues
1. **Modal not opening** - Check event listener registration in GalleryFooter
2. **Import path errors** - Adjust relative paths for your directory structure
3. **Missing assets** - Ensure all SVG icons are in public directory
4. **Navigation issues** - Check sessionStorage/localStorage in browser dev tools

### Debug Utilities
```javascript
import { debugSessionStorage } from './utils/navigation'

// Call anywhere to inspect navigation state
debugSessionStorage()
```

## 📄 License
This template is part of the Colormxr project and follows the same license terms as the main application.

---
*Generated from Colormxr Extended Template System v1.0*