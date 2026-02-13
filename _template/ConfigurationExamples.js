// 🎨 Exercise Configuration Examples
// Copy and modify these examples for common exercise types

// ═══════════════════════════════════════════════════════════════════
// 📐 GRID SIZE EXAMPLES
// ═══════════════════════════════════════════════════════════════════

// 3×3 Grid (9 colors)
const SMALL_GRID_CONFIG = {
    row: 3,
    col: 3,
    width: 100,
    height: 100,
    hSpace: 5,
    vSpace: 5,
    backgroundColor: 'rgb(255,255,255)',
    initShapeColors: [
        'rgb(200,200,200)', 'rgb(180,180,180)', 'rgb(160,160,160)',
        'rgb(180,180,180)', 'rgb(160,160,160)', 'rgb(140,140,140)', 
        'rgb(160,160,160)', 'rgb(140,140,140)', 'rgb(120,120,120)'
    ]
};

// 5×5 Grid (25 colors) - Most Common
const STANDARD_GRID_CONFIG = {
    row: 5,
    col: 5, 
    width: 150,
    height: 150,
    hSpace: 0,
    vSpace: 0,
    backgroundColor: 'rgb(255,255,255)',
    initShapeColors: [
        // 25 colors in grayscale gradient...
        'rgb(240,240,240)', 'rgb(220,220,220)', 'rgb(200,200,200)', 'rgb(180,180,180)', 'rgb(160,160,160)',
        'rgb(220,220,220)', 'rgb(200,200,200)', 'rgb(180,180,180)', 'rgb(160,160,160)', 'rgb(140,140,140)',
        'rgb(200,200,200)', 'rgb(180,180,180)', 'rgb(160,160,160)', 'rgb(140,140,140)', 'rgb(120,120,120)',
        'rgb(180,180,180)', 'rgb(160,160,160)', 'rgb(140,140,140)', 'rgb(120,120,120)', 'rgb(100,100,100)',
        'rgb(160,160,160)', 'rgb(140,140,140)', 'rgb(120,120,120)', 'rgb(100,100,100)', 'rgb(80,80,80)'
    ]
};

// 7×7 Grid (49 colors) - Large Canvas
const LARGE_GRID_CONFIG = {
    row: 7,
    col: 7,
    width: 120,
    height: 120, 
    hSpace: 2,
    vSpace: 2,
    backgroundColor: 'rgb(250,250,250)',
    initShapeColors: [
        // 49 colors - use a pattern or gradient generator...
    ]
};

// ═══════════════════════════════════════════════════════════════════
// 🎯 EXERCISE TYPE EXAMPLES  
// ═══════════════════════════════════════════════════════════════════

// Basic Color Theory Exercise
const BASIC_EXERCISE_CONFIG = {
    showColorPalette: true,
    useSlideshow: false,  // Simple instruction modal
    features: {
        importSVG: false,        // No import needed
        exportPalette: true,     // Allow palette export
        exportComposition: false // No shapeset export
    }
};

// Advanced Composition Exercise  
const ADVANCED_EXERCISE_CONFIG = {
    showColorPalette: true,
    useSlideshow: true,  // Rich slideshow instructions
    features: {
        importSVG: true,         // Allow SVG import
        exportPalette: true,     // Allow palette export  
        exportComposition: true  // Allow shapeset export
    }
};

// Simple Observation Exercise
const OBSERVATION_EXERCISE_CONFIG = {
    showColorPalette: false, // Hide palette panel
    useSlideshow: false,
    features: {
        importSVG: false,        // No import/export needed
        exportPalette: false,    
        exportComposition: false
    }
};

// Import/Export Focus Exercise
const IMPORT_EXPORT_EXERCISE_CONFIG = {
    showColorPalette: true,
    useSlideshow: true,
    features: {
        importSVG: true,         // Focus on import workflow
        exportPalette: true,     
        exportComposition: true  // Focus on export workflow
    }
};

// ═══════════════════════════════════════════════════════════════════
// 🎨 COLOR SCHEME EXAMPLES
// ═══════════════════════════════════════════════════════════════════

// Grayscale Spectrum (5×5)
const GRAYSCALE_COLORS = [
    'rgb(240,240,240)', 'rgb(220,220,220)', 'rgb(200,200,200)', 'rgb(180,180,180)', 'rgb(160,160,160)',
    'rgb(220,220,220)', 'rgb(200,200,200)', 'rgb(180,180,180)', 'rgb(160,160,160)', 'rgb(140,140,140)',
    'rgb(200,200,200)', 'rgb(180,180,180)', 'rgb(160,160,160)', 'rgb(140,140,140)', 'rgb(120,120,120)',
    'rgb(180,180,180)', 'rgb(160,160,160)', 'rgb(140,140,140)', 'rgb(120,120,120)', 'rgb(100,100,100)',
    'rgb(160,160,160)', 'rgb(140,140,140)', 'rgb(120,120,120)', 'rgb(100,100,100)', 'rgb(80,80,80)'
];

// Warm Color Palette (3×3)  
const WARM_COLORS = [
    'rgb(255,200,200)', 'rgb(255,180,120)', 'rgb(255,220,100)',
    'rgb(255,160,160)', 'rgb(255,140,80)',  'rgb(255,200,60)',
    'rgb(255,120,120)', 'rgb(255,100,40)',  'rgb(255,180,20)'
];

// Cool Color Palette (3×3)
const COOL_COLORS = [
    'rgb(200,200,255)', 'rgb(120,180,255)', 'rgb(100,220,255)',
    'rgb(160,160,255)', 'rgb(80,140,255)',  'rgb(60,200,255)', 
    'rgb(120,120,255)', 'rgb(40,100,255)',  'rgb(20,180,255)'
];

// Primary Colors Focus (3×3)
const PRIMARY_COLORS = [
    'rgb(255,100,100)', 'rgb(200,200,200)', 'rgb(100,100,255)',
    'rgb(200,200,200)', 'rgb(150,150,150)', 'rgb(200,200,200)',
    'rgb(100,255,100)', 'rgb(200,200,200)', 'rgb(255,255,100)'
];

// ═══════════════════════════════════════════════════════════════════
// 📚 EXERCISE INFO EXAMPLES
// ═══════════════════════════════════════════════════════════════════

const SECTION1_INFO = {
    lesson: 'Color Fundamentals',
    exerciseNumber: '1-1',
    title: "Primary Colors"
};

const SECTION2_INFO = {
    lesson: 'Color Relationships', 
    exerciseNumber: '2-3',
    title: "Complementary Contrast"
};

const SECTION3_INFO = {
    lesson: 'Color Harmony',
    exerciseNumber: '3-2', 
    title: "Analogous Schemes"
};

const SECTION4_INFO = {
    lesson: 'Color Composition',
    exerciseNumber: '4-1',
    title: "Spatial Color"
};

// ═══════════════════════════════════════════════════════════════════
// 🚀 READY-TO-USE COMBINATIONS
// ═══════════════════════════════════════════════════════════════════

// Beginner Exercise Template
export const BEGINNER_TEMPLATE = {
    shapeset: { ...SMALL_GRID_CONFIG, initShapeColors: PRIMARY_COLORS },
    exercise: BASIC_EXERCISE_CONFIG,
    info: { ...SECTION1_INFO, title: "Color Basics" }
};

// Intermediate Exercise Template  
export const INTERMEDIATE_TEMPLATE = {
    shapeset: { ...STANDARD_GRID_CONFIG, initShapeColors: GRAYSCALE_COLORS },
    exercise: ADVANCED_EXERCISE_CONFIG,
    info: { ...SECTION3_INFO, title: "Color Harmony" }
};

// Advanced Exercise Template
export const ADVANCED_TEMPLATE = {
    shapeset: { ...LARGE_GRID_CONFIG },
    exercise: IMPORT_EXPORT_EXERCISE_CONFIG, 
    info: { ...SECTION4_INFO, title: "Complex Composition" }
};