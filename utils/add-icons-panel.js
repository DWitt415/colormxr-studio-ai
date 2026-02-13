'use strict';

const fs = require('fs');
const path = require('path');

// Define the root directory
const exerciseRoot = path.join(__dirname, '..', 'app', 'exercise');

// Target sections
const sections = process.argv.length > 2 ? [process.argv[2]] : ['section2', 'section3', 'section4', 'sectionX'];

// Track statistics
let fileCount = 0;
let updatedCount = 0;
let errorCount = 0;

/**
 * Add new import statement to the file
 */
function addImportStatement(content) {
  // Check if ExerciseIconsPanel is already imported
  if (content.includes("import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'")) {
    return content;
  }

  // Find relevant imports to add our new import after
  let updatedContent = content;
  
  // Try different patterns to find where to insert the import
  const patterns = [
    /import\s+{[^}]*}\s+from\s+['"]@\/components\/CustomText['"]/,
    /import\s+.*\s+from\s+['"]@\/components\/.*['"]/g,
    /import\s+.*\s+from\s+['"].*['"]/g
  ];
  
  for (const pattern of patterns) {
    let matches;
    if (pattern.global) {
      // For global patterns, get all matches and use the last one
      const allMatches = [...content.matchAll(pattern)];
      if (allMatches.length > 0) {
        const lastMatch = allMatches[allMatches.length - 1];
        const insertPosition = lastMatch.index + lastMatch[0].length;
        updatedContent = content.slice(0, insertPosition) + 
                         "\nimport ExerciseIconsPanel from '@/components/ExerciseIconsPanel'" + 
                         content.slice(insertPosition);
        return updatedContent;
      }
    } else {
      // For non-global patterns
      const match = content.match(pattern);
      if (match) {
        const insertPosition = match.index + match[0].length;
        updatedContent = content.slice(0, insertPosition) + 
                         "\nimport ExerciseIconsPanel from '@/components/ExerciseIconsPanel'" + 
                         content.slice(insertPosition);
        return updatedContent;
      }
    }
  }
  
  // If all else fails, add at the beginning after 'use client' if present
  if (content.includes("'use client'")) {
    updatedContent = content.replace(
      "'use client'", 
      "'use client'\nimport ExerciseIconsPanel from '@/components/ExerciseIconsPanel'"
    );
    return updatedContent;
  }
  
  // Last resort: add at the very beginning
  return "import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'\n" + content;
}

/**
 * Updated the component to use ExerciseIconsPanel
 */
function updateComponentUsage(content) {
  // Case 1: Simple info icon only
  const infoIconPattern = /<div\s+[^>]*onClick={instructionModalOpen}[^>]*>\s*<img[^>]*src="\/info\.svg"[^>]*>\s*<\/div>/;
  
  if (infoIconPattern.test(content)) {
    return content.replace(
      infoIconPattern,
      `<ExerciseIconsPanel
        onInstructionOpen={instructionModalOpen}
        shapeColors={initShapeColors || []}
        backgroundColor={backgroundColor}
        row={row}
        col={col}
      />`
    );
  }
  
  // Case 2: More complex pattern with multiple icons
  const iconsPanelPattern = /<div\s+className=['"]fixed bottom-12 left-5[^>]*>[\s\S]*?<\/div>/;
  
  if (iconsPanelPattern.test(content)) {
    // Detect which modal open functions are available
    const hasPaletteModal = content.includes('paletteModalOpen');
    const hasShapesetModal = content.includes('shapesetModalOpen');
    const hasImportSVGModal = content.includes('importSVGModalOpen');
    
    // Determine which background color variable to use
    const hasCurrentBgColor = content.includes('currentBgColor');
    const bgColorVar = hasCurrentBgColor ? 'currentBgColor' : 'backgroundColor';
    
    // Determine which shape colors variable to use
    const hasShapesetColors = content.includes('shapesetColors');
    const shapeColorsVar = hasShapesetColors ? 'shapesetColors' : 'initShapeColors';
    
    // Build the component with available handlers
    let replacementComponent = '<ExerciseIconsPanel\n';
    
    if (hasPaletteModal) replacementComponent += '        onPaletteOpen={paletteModalOpen}\n';
    if (hasShapesetModal) replacementComponent += '        onShapesetOpen={shapesetModalOpen}\n';
    if (hasImportSVGModal) replacementComponent += '        onImportSVGOpen={importSVGModalOpen}\n';
    
    replacementComponent += `        onInstructionOpen={instructionModalOpen}
        shapeColors={${shapeColorsVar}}
        backgroundColor={${bgColorVar}}
        row={row}
        col={col}
      />`;
    
    return content.replace(iconsPanelPattern, replacementComponent);
  }
  
  return content;
}

/**
 * Process a page.jsx file
 */
function processFile(filePath) {
  try {
    fileCount++;
    console.log(`Processing: ${filePath}`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Step 1: Add import statement
    content = addImportStatement(content);
    console.log(`  - Import statement processed`);
    
    // Step 2: Update component usage
    content = updateComponentUsage(content);
    console.log(`  - Component usage processed`);
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      updatedCount++;
    } else {
      console.log(`⏭️ No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error);
    console.error(error.stack);
    errorCount++;
  }
}

/**
 * Process all page.jsx files in a directory
 */
function processDirectory(directoryPath) {
  try {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directoryPath, entry.name);
      
      if (entry.isDirectory()) {
        processDirectory(fullPath);
      } else if (entry.name === 'page.jsx') {
        processFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error reading directory ${directoryPath}:`, error);
    errorCount++;
  }
}

// Main execution
console.log(`🔄 Starting update of exercise pages with ExerciseIconsPanel component...`);
console.log(`Target sections: ${sections.join(', ')}`);

// Process each section
for (const section of sections) {
  const sectionPath = path.join(exerciseRoot, section);
  if (fs.existsSync(sectionPath)) {
    console.log(`\nProcessing section: ${section}`);
    processDirectory(sectionPath);
  } else {
    console.warn(`⚠️ Section directory not found: ${sectionPath}`);
  }
}

// Report results
console.log('\n📊 Update Report:');
console.log(`Total files processed: ${fileCount}`);
console.log(`Files updated: ${updatedCount}`);
console.log(`Errors: ${errorCount}`);
console.log('✅ Done!');
