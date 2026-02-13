'use strict';

const fs = require('fs');
const path = require('path');

// Base directory for exercises
const exercisesRoot = path.join(__dirname, '..', 'app', 'exercise');
const sections = ['section2', 'section3', 'section4', 'sectionX'];

// Stats
let totalFiles = 0;
let updatedFiles = 0;

// Process a single exercise page
function processFile(filePath) {
  totalFiles++;
  console.log(`Processing: ${filePath}`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Step 1: Fix or add import
    if (content.includes('ExerciseIconsPanel') && !content.includes("import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'")) {
      // Fix malformed import
      content = content.replace(/ExerciseIconsPanel.*import/, 'ExerciseIconsPanel\nimport');
    } else if (!content.includes('ExerciseIconsPanel')) {
      // Add import after CustomText import
      content = content.replace(
        /import\s+{.*BoldText.*}\s+from\s+['"]@\/components\/CustomText['"]/,
        (match) => `${match}\nimport ExerciseIconsPanel from '@/components/ExerciseIconsPanel'`
      );
    }
    
    // Step 2: Replace icon div with component
    const infoIconRegex = /<div\s+[^>]*onClick={instructionModalOpen}[^>]*[^>]*>\s*<img[^>]*info\.svg[^>]*>\s*<\/div>/;
    
    if (infoIconRegex.test(content)) {
      content = content.replace(
        infoIconRegex,
        `<ExerciseIconsPanel
                        onInstructionOpen={instructionModalOpen}
                        shapeColors={initShapeColors || []}
                        backgroundColor={backgroundColor || 'rgb(255,255,255)'}
                        row={row || 1}
                        col={col || 1}
                    />`
      );
    }
    
    // Only write if content changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated ${filePath}`);
      updatedFiles++;
    } else {
      console.log(`⏭️ No changes needed: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}: ${error.message}`);
  }
}

// Process each section
sections.forEach(section => {
  const sectionPath = path.join(exercisesRoot, section);
  
  if (!fs.existsSync(sectionPath)) {
    console.warn(`⚠️ Section not found: ${sectionPath}`);
    return;
  }
  
  console.log(`\nProcessing ${section}...`);
  
  // Find and process all page.jsx files in this section
  function processDir(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        processDir(fullPath);
      } else if (entry.name === 'page.jsx') {
        processFile(fullPath);
      }
    }
  }
  
  processDir(sectionPath);
});

console.log(`\nSummary: Updated ${updatedFiles} out of ${totalFiles} files.`);
