'use strict';

const fs = require('fs');
const path = require('path');

// Root directory containing sections
const exerciseRoot = path.join(process.cwd(), 'app', 'exercise');
const sections = ['section2', 'section3', 'section4', 'sectionX'];

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

  // Add ExerciseIconsPanel import after other component imports
  const updatedContent = content.replace(
    /import\s+.*\s+from\s+['"]@\/components\/.*['"]/g,
    (match) => {
      // Find the last import statement
      if (match.includes('GalleryAddButton')) {
        return `${match}\nimport ExerciseIconsPanel from '@/components/ExerciseIconsPanel'`;
      }
      return match;
    }
  );
  
  return updatedContent;
}

/**
 * Updated the component to use ExerciseIconsPanel
 */
function updateComponentUsage(content) {
  // Simple case: just an info icon
  const infoIconPattern = /onClick={instructionModalOpen}\s*className=['"]cursor-pointer fixed bottom-12 left-5['"]\s*>\s*<img src="\/info\.svg"/;
  
  if (infoIconPattern.test(content)) {
    return content.replace(
      /<div\s+onClick={instructionModalOpen}\s+className=['"]cursor-pointer fixed bottom-12 left-5['"]\s*>\s*<img src="\/info\.svg"[^>]*>\s*<\/div>/,
      `<ExerciseIconsPanel
        onInstructionOpen={instructionModalOpen}
        shapeColors={initShapeColors || []}
        backgroundColor={backgroundColor}
        row={row}
        col={col}
      />`
    );
  }
  
  // Complex case: already has palette, gallery, and more
  // Check if there's a gallery section
  if (content.includes('paletteModalOpen') && content.includes('shapesetModalOpen')) {
    return content.replace(
      /<div\s+className=['"]fixed bottom-12 left-5[^>]*>[\s\S]*?<\/div>\s*<\/div>/m,
      `<ExerciseIconsPanel
        onPaletteOpen={paletteModalOpen}
        onShapesetOpen={shapesetModalOpen}
        onImportSVGOpen={importSVGModalOpen}
        onInstructionOpen={instructionModalOpen}
        shapeColors={shapesetColors || initShapeColors || []}
        backgroundColor={currentBgColor || backgroundColor}
        row={row}
        col={col}
      /></div>`
    );
  }
  
  return content;
}

/**
 * Process a page.jsx file
 */
function processFile(filePath) {    try {
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
console.log('🔄 Starting update of exercise pages with ExerciseIconsPanel component...');

// Process each section
for (const section of sections) {
  const sectionPath = path.join(exerciseRoot, section);
  if (fs.existsSync(sectionPath)) {
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
