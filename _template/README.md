# 🎨 Exercise Template Reference Implementation

This directory contains the clean, refactored architecture for creating new exercises with minimal code duplication.

## 📊 Benefits

- **66% Less Code**: From 374+ lines down to ~127 lines per exercise
- **Zero Modal Duplication**: All modal management handled by footer
- **Config-Driven**: Easy feature flags and settings
- **Maintainable**: Clear separation of concerns

## 📁 Template Files

### 1. `ExercisePageTemplate.jsx` - Main Exercise Page
The complete, clean exercise page template with inline configuration.

**Key Features:**
- ✅ **Shapeset Configuration** - Grid size, colors, dimensions
- ✅ **Exercise Configuration** - Feature flags for functionality  
- ✅ **Exercise Information** - Metadata (lesson, title, number)
- ✅ **Clean Architecture** - No modal state management duplication

### 2. `InstructionContentTemplate.jsx` - Instruction Content
Template for creating exercise-specific instruction content.

**Key Features:**
- ✅ **Slide Content** - For slideshow-style instructions
- ✅ **Regular Content** - For traditional modal instructions
- ✅ **Reusable Components** - Uses BoldText, ExText, Slide components

### 3. `BaseExerciseComponent.jsx` - Reusable Component
Optional reusable component approach for maximum code reuse.

## 🚀 How to Create a New Exercise

### Option A: Direct Template (Recommended)

1. **Copy the template:**
   ```bash
   cp _template/ExercisePageTemplate.jsx app/exercise/section1/ex-1-1/page.jsx
   cp _template/InstructionContentTemplate.jsx app/exercise/section1/ex-1-1/InstructionContent.jsx
   ```

2. **Customize the configuration:**
   ```jsx
   // ✅ Update Shapeset Configuration
   const SHAPESET_CONFIG = {
       row: 3,  // ← Change grid size
       col: 3,
       backgroundColor: 'rgb(240,240,240)', // ← Change background
       initShapeColors: [
           // ← Add exactly row × col colors
           'rgb(255,0,0)', 'rgb(0,255,0)', 'rgb(0,0,255)',
           // ... (9 colors total for 3×3 grid)
       ]
   };

   // ✅ Update Exercise Configuration  
   const EXERCISE_CONFIG = {
       useSlideshow: false,  // ← Choose instruction style
       features: {
           importSVG: false,        // ← Disable SVG import
           exportPalette: true,     // ← Enable palette export
           exportComposition: false // ← Disable shapeset export
       }
   };

   // ✅ Update Exercise Information
   const EXERCISE_INFO = {
       lesson: 'Color Theory',
       exerciseNumber: '1-1', 
       title: "Primary Colors"
   };
   ```

3. **Customize instruction content:**
   ```jsx
   // In InstructionContent.jsx
   export const PrimaryColorsInstructions = ({ title = "Primary Colors" }) => {
       const slideContent = [
           <Slide key="slide-0">
               <ExText TopMargin>
                   <BoldText>{title}</BoldText>
               </ExText>
           </Slide>,
           // Add your exercise-specific slides...
       ];
       // ...
   };
   ```

4. **Update the import:**
   ```jsx
   // In page.jsx
   import { PrimaryColorsInstructions } from './InstructionContent'
   // And update the function call
   const { slideContent, regularContent } = PrimaryColorsInstructions({ title: EXERCISE_INFO.title });
   ```

### Option B: Component-Based Approach

Use `BaseExerciseComponent.jsx` for maximum reusability:

```jsx
import BaseExercise from '@/components/templates/BaseExercise'
import { YourInstructions } from './InstructionContent'

export default function YourExercisePage() {
    const instructionContent = YourInstructions({ title: "Your Title" });
    
    return (
        <BaseExercise 
            shapesetConfig={SHAPESET_CONFIG}
            exerciseConfig={EXERCISE_CONFIG}
            instructionContent={instructionContent}
            exerciseInfo={EXERCISE_INFO}
        />
    );
}
```

## ⚙️ Configuration Reference

### Shapeset Configuration
```jsx
const SHAPESET_CONFIG = {
    row: 5,                     // Grid rows
    col: 5,                     // Grid columns  
    width: 150,                 // Shape width in pixels
    height: 150,                // Shape height in pixels
    hSpace: 0,                  // Horizontal spacing
    vSpace: 0,                  // Vertical spacing
    backgroundColor: 'rgb(255,255,255)',  // Background color
    initShapeColors: [...]      // Array of initial colors (must equal row × col)
};
```

### Exercise Configuration
```jsx
const EXERCISE_CONFIG = {
    showColorPalette: true,     // Show color palette panel
    useSlideshow: true,         // Use slideshow vs regular modal
    features: {
        importSVG: true,           // Show import SVG icon
        exportPalette: true,       // Show export palette icon
        exportComposition: true    // Show export shapeset icon
    }
};
```

### Exercise Information
```jsx
const EXERCISE_INFO = {
    lesson: 'Color Theory',     // Lesson category
    exerciseNumber: '1-1',      // Exercise number  
    title: "Exercise Title"     // Exercise title
};
```

## 🎯 Modal System

The new architecture uses a **footer-based modal system**:

- ✅ **No Modal State** in exercise pages
- ✅ **Event-Driven** communication via `window.dispatchEvent`
- ✅ **Global Management** in `GalleryFooter.jsx`
- ✅ **Feature Flags** control which icons are shown

### How It Works:
1. User clicks export/import icon in exercise
2. `ExerciseIconsPanel` dispatches custom event with data
3. `GalleryFooter` receives event and opens appropriate modal
4. Current colors accessed via `window.getCurrentColors()`

## 🔧 Legacy Compatibility

The `ExerciseIconsPanel` maintains backward compatibility:
- Still accepts old props for existing exercises
- New `config` prop takes precedence when provided
- Gradual migration path available

## 📈 Migration Benefits

**Before (Old Architecture):**
- 374+ lines per exercise
- 25+ lines of redundant modal state
- 50+ lines of redundant modal handlers  
- 60+ lines of redundant modal components
- 100+ lines of inline instruction content

**After (New Architecture):**
- ~127 lines per exercise  
- Only instruction modal state needed
- Config-driven feature flags
- External instruction content files
- Footer-based modal management

## 🎨 Best Practices

1. **Keep Colors Consistent**: Use standard RGB format
2. **Match Grid Size**: Ensure `initShapeColors` length equals `row × col`
3. **Descriptive Titles**: Use clear, descriptive exercise titles
4. **Modular Content**: Keep instruction content in separate files
5. **Feature Flags**: Only enable features needed for each exercise

## 🚨 Common Issues

1. **Color Array Length**: Must match grid dimensions exactly
2. **Import Paths**: Update import paths when copying templates  
3. **Function Names**: Update instruction function names to be unique
4. **Missing Features**: Ensure required feature flags are enabled

## 📚 Example Exercises

See the working implementation:
- `app/exercise/section4/ex-5-4/` - Fully refactored exercise
- Uses all new architecture patterns
- Demonstrates clean code organization