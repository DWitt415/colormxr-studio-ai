/**
 * This script updates all exercise pages to use the modal control hook
 * that prevents the instruction modal from showing when returning from gallery.
 * It also fixes the z-index of instruction modals to ensure they appear above other elements,
 * and updates the text color to #ABABAB.
 * 
 * Run this script with Node.js to update all exercise pages:
 * node utils/update-exercise-pages.js
 */

const fs = require('fs');
const path = require('path');

// Base path to exercise pages
const exercisesBasePath = path.join(__dirname, '..', 'app', 'exercise');

// Import statement to add to each file
const importStatement = "import { useInstructionModalControl } from '@/utils/modalControl'";

// Function to replace the modal control code in a file
function updateExercisePage(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip files that already have the import
    if (content.includes('useInstructionModalControl')) {
      console.log(`Skipping modal control update for ${filePath} - already updated`);
      // Continue with z-index updates even if modal control is already implemented
    } else {
      // Skip files that don't have instruction modal controls
      if (!content.includes('isInstructionModalOpen') || 
          !content.includes('InstructionModal') && !content.includes('InstructionModalV')) {
        console.log(`Skipping ${filePath} - no instruction modal found`);
        return;
      }
      
      // Add import statement if not already present
      if (!content.includes(importStatement)) {
        // Find the last import statement
        const importRegex = /^import .+ from .+$/gm;
        const imports = [...content.matchAll(importRegex)];
        
        if (imports.length > 0) {
          const lastImport = imports[imports.length - 1];
          const insertPosition = lastImport.index + lastImport[0].length;
          
          // Insert our import after the last import
          content = content.slice(0, insertPosition) + 
                  `\n${importStatement}` + 
                  content.slice(insertPosition);
        }
      }

      // Add useEffect to React import if needed
      const hasUseEffect = content.includes('{ useState, useEffect }') || 
                          content.includes('{useState, useEffect}') ||
                          content.includes('{useEffect, useState}') ||
                          content.includes('{ useEffect, useState }');
                          
      if (!hasUseEffect) {
        const reactImportRegex = /import React,\s*{\s*useState\s*} from ['"]react['"]/;
        if (reactImportRegex.test(content)) {
          content = content.replace(reactImportRegex, "import React, { useState, useEffect } from 'react'");
        } else {
          // If useState is not imported in this format, try a simpler pattern
          const simpleReactImport = /import React from ['"]react['"]/;
          if (simpleReactImport.test(content)) {
            content = content.replace(simpleReactImport, "import React, { useState, useEffect } from 'react'");
          } else {
            // If neither pattern matches, insert useEffect import at the top
            const clientDirective = /'use client'/;
            if (clientDirective.test(content)) {
              content = content.replace(clientDirective, "'use client'\nimport { useEffect } from 'react'");
            }
          }
        }
      }
      
      // Find and replace the instruction modal initialization
      // This handles various patterns for setting up the modal state
      const modalStatePatterns = [
        // Pattern: let [isInstructionModalOpen, setIsInstructionModalOpen] = useState(true)
        {
          regex: /(let|const)\s+\[\s*isInstructionModalOpen\s*,\s*setIsInstructionModalOpen\s*\]\s*=\s*useState\s*\(\s*true\s*\)/,
          replacement: "const shouldShowModal = useInstructionModalControl();\n    let [isInstructionModalOpen, setIsInstructionModalOpen] = useState(true);\n    \n    // Update modal state when shouldShowModal changes\n    useEffect(() => {\n        setIsInstructionModalOpen(shouldShowModal);\n    }, [shouldShowModal])"
        },
        // Alternative pattern: const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(true)
        {
          regex: /const\s+\[\s*isInstructionModalOpen\s*,\s*setIsInstructionModalOpen\s*\]\s*=\s*useState\s*\(\s*true\s*\)/,
          replacement: "const shouldShowModal = useInstructionModalControl();\n    const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(true);\n    \n    // Update modal state when shouldShowModal changes\n    useEffect(() => {\n        setIsInstructionModalOpen(shouldShowModal);\n    }, [shouldShowModal])"
        }
      ];
      
      // Apply the first matching pattern
      for (const pattern of modalStatePatterns) {
        if (pattern.regex.test(content)) {
          content = content.replace(pattern.regex, pattern.replacement);
          break;
        }
      }
    }
    
    // Ensure instruction modals have high z-index (999) and proper text color
    // Fix props in rendered InstructionModal components
    if (content.includes('<InstructionModal')) {
      // Remove all style attributes completely - handle case with multiple style attributes
      const multiStylePattern = /(<InstructionModal[^>]*?)style={{[^}]*}}(\s*style={{[^}]*}})*([^>]*)>/g;
      content = content.replace(multiStylePattern, '$1$3>');
      
      // Clean up any leftover single style props just to be sure
      const cleanInstructionModal = /(<InstructionModal[^>]*?)style={{[^}]*}}([^>]*)>/g;
      content = content.replace(cleanInstructionModal, '$1$2>');
      
      // Then add our style prop with both z-index and color
      const instructionModalPattern = /<InstructionModal([^>]*)>/g;
      content = content.replace(instructionModalPattern, '<InstructionModal$1 style={{zIndex: 999, color: "#ABABAB"}}>');
    }
    
    // Fix props in rendered InstructionModalV components
    if (content.includes('<InstructionModalV')) {
      // Remove all style attributes completely - handle case with multiple style attributes
      const multiStylePattern = /(<InstructionModalV[^>]*?)style={{[^}]*}}(\s*style={{[^}]*}})*([^>]*)>/g;
      content = content.replace(multiStylePattern, '$1$3>');
      
      // Clean up any leftover single style props just to be sure
      const cleanInstructionModalV = /(<InstructionModalV[^>]*?)style={{[^}]*}}([^>]*)>/g;
      content = content.replace(cleanInstructionModalV, '$1$2>');
      
      // Then add our style prop with both z-index and color
      const instructionModalVPattern = /<InstructionModalV([^>]*)>/g;
      content = content.replace(instructionModalVPattern, '<InstructionModalV$1 style={{zIndex: 999, color: "#ABABAB"}}>');
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
    
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
}

// Function to recursively find page.jsx files in exercise directories
function findExercisePages(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findExercisePages(fullPath);
    } else if (file === 'page.jsx') {
      updateExercisePage(fullPath);
    }
  }
}

// Start updating exercise pages
console.log('Updating exercise pages...');
findExercisePages(exercisesBasePath);
console.log('Done updating exercise pages!');
