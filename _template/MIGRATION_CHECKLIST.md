# 🚀 Exercise Migration Checklist

Use this checklist when converting old exercises to the new clean architecture.

## ✅ Pre-Migration Analysis

- [ ] **Identify Exercise Type**
  - [ ] Basic color theory exercise
  - [ ] Advanced composition exercise  
  - [ ] Import/export focused exercise
  - [ ] Observation-only exercise

- [ ] **Extract Current Configuration**
  - [ ] Note grid dimensions (row × col)
  - [ ] Note shape size (width × height)
  - [ ] Note spacing (hSpace × vSpace)  
  - [ ] Note background color
  - [ ] Count initial colors (must match row × col)

- [ ] **Identify Required Features**
  - [ ] Import SVG functionality needed?
  - [ ] Export palette functionality needed?
  - [ ] Export shapeset functionality needed?
  - [ ] Slideshow vs regular instructions?

## ✅ Migration Steps

### 1. Setup New Files
- [ ] Copy `_template/ExercisePageTemplate.jsx` to exercise directory as `page.jsx`
- [ ] Copy `_template/InstructionContentTemplate.jsx` to exercise directory as `InstructionContent.jsx`

### 2. Configure Shapeset
- [ ] Update `SHAPESET_CONFIG.row` and `SHAPESET_CONFIG.col`
- [ ] Update `SHAPESET_CONFIG.width` and `SHAPESET_CONFIG.height` 
- [ ] Update `SHAPESET_CONFIG.hSpace` and `SHAPESET_CONFIG.vSpace`
- [ ] Update `SHAPESET_CONFIG.backgroundColor`
- [ ] Update `SHAPESET_CONFIG.initShapeColors` (verify count = row × col)

### 3. Configure Exercise Features  
- [ ] Set `EXERCISE_CONFIG.showColorPalette` (true/false)
- [ ] Set `EXERCISE_CONFIG.useSlideshow` (true/false)
- [ ] Set `EXERCISE_CONFIG.features.importSVG` (true/false)
- [ ] Set `EXERCISE_CONFIG.features.exportPalette` (true/false)
- [ ] Set `EXERCISE_CONFIG.features.exportComposition` (true/false)

### 4. Configure Exercise Info
- [ ] Update `EXERCISE_INFO.lesson`
- [ ] Update `EXERCISE_INFO.exerciseNumber` 
- [ ] Update `EXERCISE_INFO.title`

### 5. Migrate Instruction Content
- [ ] Copy slide content from old exercise to `InstructionContent.jsx`
- [ ] Copy regular content from old exercise to `InstructionContent.jsx`  
- [ ] Update function name (e.g., `YourExerciseInstructions`)
- [ ] Update export name to match
- [ ] Update import in `page.jsx`
- [ ] Update function call in `page.jsx`

### 6. Remove Old Code
- [ ] Delete old modal state management (useState for modals)
- [ ] Delete old modal handler functions (modalOpen/modalClose functions)
- [ ] Delete old callback functions (updatePaletteColors, etc.)
- [ ] Delete old modal components from JSX (PaletteModal, ShapesetModal, etc.)
- [ ] Delete old SVG import handling logic
- [ ] Delete old modal imports at top of file
- [ ] Delete inline instruction content JSX

## ✅ Testing Checklist

### Basic Functionality  
- [ ] Exercise loads without errors
- [ ] Color controller displays correct grid
- [ ] Background color is correct
- [ ] Initial shape colors are correct
- [ ] Icons panel shows correct icons based on feature flags

### Modal System
- [ ] Instruction modal opens/closes correctly
- [ ] Content displays properly (slideshow vs regular)
- [ ] Export palette works (if enabled)
- [ ] Export shapeset works (if enabled)  
- [ ] Import SVG works (if enabled)
- [ ] Modals appear in footer (not duplicated in exercise)

### Footer Integration
- [ ] Footer displays correct lesson/title information
- [ ] Navigation between gallery/exercise works
- [ ] Color persistence works when navigating
- [ ] Modal state managed globally by footer

## ✅ Code Quality Check

- [ ] **No Modal State** - Exercise only has instruction modal state
- [ ] **No Modal Handlers** - No paletteModalOpen/shapesetModalOpen functions
- [ ] **No Modal Components** - No PaletteModal/ShapesetModal in JSX
- [ ] **Clean Imports** - Only essential imports at top
- [ ] **Config Constants** - All configuration in SHAPESET_CONFIG, EXERCISE_CONFIG, EXERCISE_INFO
- [ ] **External Instructions** - Instruction content in separate file
- [ ] **Consistent Naming** - Function names match exercise

## ✅ Performance Validation

- [ ] **Line Count Reduction** - Should be ~127 lines vs 300+ lines
- [ ] **No Redundancy** - No duplicate modal management code
- [ ] **Fast Loading** - No unnecessary state management
- [ ] **Memory Efficient** - Modals managed once in footer

## 📈 Expected Results

**Before Migration:**
- ❌ 300+ lines per exercise
- ❌ 25+ lines of modal state
- ❌ 50+ lines of modal handlers
- ❌ 60+ lines of modal components  
- ❌ 100+ lines of inline instructions

**After Migration:**
- ✅ ~127 lines per exercise
- ✅ Only instruction modal state
- ✅ Config-driven feature flags
- ✅ External instruction files
- ✅ Footer-based modal management

## 🚨 Common Issues

### Color Array Length Mismatch
**Problem:** `initShapeColors` length doesn't match `row × col`  
**Solution:** Count colors carefully, add/remove to match grid size

### Missing Feature Flags
**Problem:** Icons not showing or showing incorrectly  
**Solution:** Check `EXERCISE_CONFIG.features` settings

### Import Path Errors  
**Problem:** Cannot find instruction content  
**Solution:** Verify import path and function name match

### Modal Not Opening
**Problem:** Footer-based modals not working  
**Solution:** Verify ExerciseIconsPanel receives `config` and `shapesetConfig` props

### Instruction Content Errors
**Problem:** Slides not displaying correctly  
**Solution:** Check slide array structure and key props

## 🎯 Success Criteria

- [ ] **66%+ code reduction** achieved
- [ ] **Zero modal duplication** - all managed by footer
- [ ] **Clean configuration** - shapeset, exercise, info clearly separated  
- [ ] **Maintainable code** - easy to modify and extend
- [ ] **Consistent architecture** - matches template patterns
- [ ] **Full functionality** - all original features work correctly