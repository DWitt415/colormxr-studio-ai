'use strict';

const fs = require('fs');
const path = require('path');

// Root directory for exercises
const exerciseRoot = '/Users/dwitt/Sites/colormxr_dev/app/exercise';

// Model file to use as a reference (the improved one)
const modelFilePath = path.join(exerciseRoot, 'section4/ex-5-4/page.jsx');

// Read the model file
console.log(`Reading model file from: ${modelFilePath}`);
const modelContent = fs.readFileSync(modelFilePath, 'utf8');

// Extract important patterns from the model file
const importPatterns = modelContent.match(/import .* from .*(\r\n|\n)/g) || [];
const modalDeclarations = modelContent.match(/\/\/ .*Modal Control(\r\n|\n)(.*\n)+?(?=\/\/|function)/g) || [];
const functionDeclarations = modelContent.match(/function .*Modal(Open|Close)\(\) \{(\r\n|\n).*(\r\n|\n)\}/g) || [];
const updateFunctions = modelContent.match(/const update.*Color.*= \(.*\) => \{(\r\n|\n)(\s+.*(\r\n|\n))+?\}/g) || [];

// Function to process each exercise file
function updateExerciseFile(filePath) {
    console.log(`Updating: ${filePath}`);
    
    // Skip the model file itself
    if (filePath === modelFilePath) {
        console.log(`Skipping model file`);
        return;
    }
    
    // Read the target file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Update imports - ensure all required imports are present
    const requiredImports = [
        "import PaletteModal from '@/components/Modals/PaletteModal'",
        "import ShapesetModal from '@/components/Modals/ShapesetModal'",
        "import ImportSVGModal from '@/components/Modals/ImportSVGModal'",
        "import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'",
        "import GalleryLink from '@/components/GalleryLink'"
    ];
    
    // Check if each import is already present, and add if not
    for (const importStatement of requiredImports) {
        if (!content.includes(importStatement)) {
            // Find the last import statement in the file
            const lastImportIndex = content.lastIndexOf('import ');
            const lastImportLineEnd = content.indexOf('\n', lastImportIndex);
            
            // Insert the new import after the last import
            content = content.slice(0, lastImportLineEnd + 1) + importStatement + '\n' + content.slice(lastImportLineEnd + 1);
        }
    }
    
    // 2. Add modal state declarations if not already present
    const modalStateDeclarations = [
        "// Palette Modal Control",
        "let [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false)",
        "const [paletteColors, setPaletteColors] = useState([",
        "    \"#D9D9D9\",",
        "    \"#D9D9D9\",",
        "    \"#D9D9D9\",",
        "    \"#D9D9D9\",",
        "    \"#D9D9D9\"",
        "])",
        "",
        "// Shapeset Modal Control",
        "let [isShapesetModalOpen, setIsShapesetModalOpen] = useState(false)",
        "const [shapesetColors, setShapesetColors] = useState(initShapeColors || [])",
        "",
        "// Import SVG Modal Control",
        "let [isImportSVGModalOpen, setIsImportSVGModalOpen] = useState(false)",
        "",
        "// Track the current background color",
        "const [currentBgColor, setCurrentBgColor] = useState(backgroundColor || 'rgb(255,255,255)')",
        "",
        "// Key to force ColorControllerUI to remount when we want to reset it",
        "const [controllerKey, setControllerKey] = useState(0)"
    ];
    
    // Find the instructor modal close function
    const instructorModalClosePos = content.indexOf('function instructionModalClose');
    if (instructorModalClosePos !== -1) {
        // Find the end of the function
        const functionEndPos = content.indexOf('}', instructorModalClosePos) + 1;
        
        // Check if the modal declarations are already present
        const hasModalDeclarations = content.includes('// Palette Modal Control') || 
                                    content.includes('isPaletteModalOpen');
        
        if (!hasModalDeclarations) {
            // Insert the modal declarations after the instructor modal functions
            content = content.slice(0, functionEndPos + 1) + '\n\n' + 
                     modalStateDeclarations.join('\n') + 
                     '\n\n' + content.slice(functionEndPos + 1);
        }
    }
    
    // 3. Add functions for modal control and updates (if they don't exist)
    const modalFunctions = [
        "// Function to update palette colors from ColorControllerUI",
        "const updatePaletteColors = (colors) => {",
        "    if (colors && colors.length) {",
        "        setPaletteColors(colors)",
        "    }",
        "}",
        "",
        "// Function to update shapeset colors from ColorControllerUI",
        "const updateShapeColors = (colors) => {",
        "    if (colors && colors.length) {",
        "        setShapesetColors(colors)",
        "    }",
        "}",
        "",
        "// Function to update background color from ColorControllerUI",
        "const updateBackgroundColor = (color) => {",
        "    if (color) {",
        "        setCurrentBgColor(color)",
        "    }",
        "}",
        "",
        "function paletteModalOpen() {",
        "    // Just open the modal, the colors are already in state",
        "    setIsPaletteModalOpen(true)",
        "}",
        "",
        "function paletteModalClose() {",
        "    setIsPaletteModalOpen(false)",
        "}",
        "",
        "function shapesetModalOpen() {",
        "    // Just open the modal, the colors are already in state",
        "    setIsShapesetModalOpen(true)",
        "}",
        "",
        "function shapesetModalClose() {",
        "    setIsShapesetModalOpen(false)",
        "}",
        "",
        "function importSVGModalOpen() {",
        "    setIsImportSVGModalOpen(true)",
        "}",
        "",
        "function importSVGModalClose() {",
        "    setIsImportSVGModalOpen(false)",
        "}",
        "",
        "// Handle SVG import data",
        "const handleSVGImport = (data) => {",
        "    console.log(\"SVG Import data:\", data);",
        "    ",
        "    // Prepare the updates",
        "    let newBgColor = currentBgColor;",
        "    let newShapeColors = [...shapesetColors];",
        "    ",
        "    // Update background color if available",
        "    if (data.backgroundColor) {",
        "        newBgColor = data.backgroundColor;",
        "    }",
        "    ",
        "    // Update shape colors if available",
        "    if (data.shapeColors && data.shapeColors.length > 0) {",
        "        // Check if grid dimensions match or need adaptation",
        "        const targetCells = row * col;",
        "        const sourceCells = data.shapeColors.length;",
        "        ",
        "        if (targetCells === sourceCells) {",
        "            // Perfect match - use as is",
        "            newShapeColors = [...data.shapeColors];",
        "        } ",
        "        else if (data.rowCount && data.colCount && data.rowCount * data.colCount === sourceCells) {",
        "            // SVG has different dimensions but valid grid",
        "            if (sourceCells < targetCells) {",
        "                // Need to add colors - duplicate last colors or use default",
        "                newShapeColors = [...data.shapeColors];",
        "                while (newShapeColors.length < targetCells) {",
        "                    newShapeColors.push('rgb(200,200,200)');",
        "                }",
        "            } else {",
        "                // Need to remove colors - try to preserve pattern by selecting",
        "                // colors in a way that maintains the visual distribution",
        "                newShapeColors = [];",
        "                ",
        "                // Create a mapping from source grid to target grid",
        "                for (let i = 0; i < row; i++) {",
        "                    const sourceRowIndex = Math.floor(i * data.rowCount / row);",
        "                    for (let j = 0; j < col; j++) {",
        "                        const sourceColIndex = Math.floor(j * data.colCount / col);",
        "                        const sourceIndex = sourceRowIndex * data.colCount + sourceColIndex;",
        "                        newShapeColors.push(data.shapeColors[sourceIndex]);",
        "                    }",
        "                }",
        "            }",
        "        } ",
        "        else {",
        "            // Just use colors sequentially and pad if needed",
        "            newShapeColors = [...data.shapeColors];",
        "            while (newShapeColors.length < targetCells) {",
        "                newShapeColors.push('rgb(200,200,200)');",
        "            }",
        "            ",
        "            // Trim if we have too many colors",
        "            if (newShapeColors.length > targetCells) {",
        "                newShapeColors = newShapeColors.slice(0, targetCells);",
        "            }",
        "        }",
        "    }",
        "    ",
        "    // Update all states at once",
        "    setCurrentBgColor(newBgColor);",
        "    setShapesetColors(newShapeColors);",
        "    ",
        "    // Force ColorControllerUI to remount with new colors",
        "    setControllerKey(prevKey => prevKey + 1);",
        "}"
    ];
    
    // Check if the functions are already present
    if (!content.includes('function paletteModalOpen')) {
        // Find the start of the return statement
        const returnPos = content.indexOf('return (');
        
        if (returnPos !== -1) {
            // Insert the functions before the return statement
            content = content.slice(0, returnPos) + 
                     modalFunctions.join('\n') + 
                     '\n\n' + content.slice(returnPos);
        }
    }
    
    // 4. Update ColorControllerUI component to include new props
    const oldColorControllerUI = /(<ColorControllerUI[^>]*>)/g;
    
    // Check if we need to add the controllerKey and other props
    if (content.match(oldColorControllerUI) && !content.includes('key={controllerKey}')) {
        content = content.replace(oldColorControllerUI, (match) => {
            // Remove the closing bracket temporarily
            let newComponent = match.slice(0, -1);
            
            // Add required props if not already present
            if (!newComponent.includes('key=')) {
                newComponent += ' key={controllerKey}';
            }
            if (!newComponent.includes('bgColor=')) {
                newComponent += ' bgColor={currentBgColor}';
            }
            if (!newComponent.includes('initShapeColors=')) {
                newComponent += ' initShapeColors={shapesetColors}';
            }
            if (!newComponent.includes('onPaletteChange=')) {
                newComponent += ' onPaletteChange={updatePaletteColors}';
            }
            if (!newComponent.includes('onBackgroundChange=')) {
                newComponent += ' onBackgroundChange={updateBackgroundColor}';
            }
            if (!newComponent.includes('onShapeColorsChange=')) {
                newComponent += ' onShapeColorsChange={updateShapeColors}';
            }
            
            // Add back the closing bracket
            return newComponent + '>';
        });
    }
    
    // 5. Replace the info button with ExerciseIconsPanel
    if (content.includes('onClick={instructionModalOpen}') && 
        content.includes('<img src="/info.svg"') && 
        !content.includes('<ExerciseIconsPanel')) {
        
        const infoButtonStart = content.indexOf('<div', content.indexOf('onClick={instructionModalOpen}'));
        const infoButtonEnd = content.indexOf('</div>', infoButtonStart) + 6;
        
        const exerciseIconsPanel = 
            '                    <ExerciseIconsPanel\n' +
            '                        onPaletteOpen={paletteModalOpen}\n' +
            '                        onShapesetOpen={shapesetModalOpen}\n' +
            '                        onImportSVGOpen={importSVGModalOpen}\n' +
            '                        onInstructionOpen={instructionModalOpen}\n' +
            '                        shapeColors={shapesetColors}\n' +
            '                        backgroundColor={currentBgColor}\n' +
            '                        row={row}\n' +
            '                        col={col}\n' +
            '                    />';
        
        // Replace the div containing the info button with ExerciseIconsPanel
        content = content.slice(0, infoButtonStart) + 
                 exerciseIconsPanel + 
                 content.slice(infoButtonEnd);
    }
    
    // 6. Add modal components at the end, before the closing div
    if (!content.includes('<PaletteModal')) {
        // Find the closing divs for the main component
        const closingFooterPos = content.indexOf('</Footer>');
        
        if (closingFooterPos !== -1) {
            // Find the next closing div after Footer
            const closingDivPos = content.indexOf('</div>', closingFooterPos);
            
            if (closingDivPos !== -1) {
                const modalComponents = 
                    '            <PaletteModal\n' +
                    '                isOpen={isPaletteModalOpen}\n' +
                    '                closeModal={paletteModalClose}\n' +
                    '                colorPalette={paletteColors}\n' +
                    '                backgroundColor={currentBgColor}\n' +
                    '            />\n' +
                    '            <ShapesetModal\n' +
                    '                isOpen={isShapesetModalOpen}\n' +
                    '                closeModal={shapesetModalClose}\n' +
                    '                shapeColors={shapesetColors}\n' +
                    '                backgroundColor={currentBgColor}\n' +
                    '                row={row}\n' +
                    '                col={col}\n' +
                    '                width={width}\n' +
                    '                height={height}\n' +
                    '            />\n' +
                    '            <ImportSVGModal\n' +
                    '                isOpen={isImportSVGModalOpen}\n' +
                    '                closeModal={importSVGModalClose}\n' +
                    '                onSVGImport={handleSVGImport}\n' +
                    '            />\n';
                
                // Insert the modal components before the last div
                content = content.slice(0, closingDivPos) + 
                         modalComponents + 
                         content.slice(closingDivPos);
            }
        }
    }
    
    // 7. Make sure the Footer component includes shape colors and background color
    if (content.includes('<Footer') && !content.includes('shapeColors={')) {
        const footerComponent = /<Footer[^>]*>/g;
        
        content = content.replace(footerComponent, (match) => {
            // Remove the closing bracket temporarily
            let newFooter = match.slice(0, -1);
            
            // Add shape colors and background color props if not already present
            if (!newFooter.includes('shapeColors={')) {
                newFooter += '\n                shapeColors={shapesetColors}';
            }
            if (!newFooter.includes('backgroundColor={')) {
                newFooter += '\n                backgroundColor={currentBgColor}';
            }
            if (!newFooter.includes('row={')) {
                newFooter += '\n                row={row}';
            }
            if (!newFooter.includes('col={')) {
                newFooter += '\n                col={col}';
            }
            
            // Add back the closing bracket
            return newFooter + '>';
        });
    }
    
    // 8. Add initShapeColors if not already present
    if (!content.includes('initShapeColors') && !content.includes('const initShapeColors')) {
        // Find where to insert the initShapeColors
        const backgroundColorPos = content.indexOf('const backgroundColor');
        
        // If backgroundColor is defined, insert after it, otherwise find another spot
        if (backgroundColorPos !== -1) {
            const nextLinePos = content.indexOf('\n', backgroundColorPos) + 1;
            
            const initShapeColorsCode = 
            'const initShapeColors = [\n' +
            '    \'rgb(185,185,185)\',\n' +
            '    \'rgb(195,195,195)\',\n' +
            '    \'rgb(210,210,210)\',\n' +
            '    \'rgb(195,195,195)\',\n' +
            '    \'rgb(185,185,185)\',\n' +
            '];\n';
            
            content = content.slice(0, nextLinePos) + 
                    initShapeColorsCode + 
                    content.slice(nextLinePos);
        } else {
            // If no backgroundcolor constant, find the const declarations section
            const rowColVarPos = content.indexOf('const row');
            if (rowColVarPos !== -1) {
                // Find the last const declaration
                let lastVarPos = content.lastIndexOf('const ', content.indexOf('function page'));
                let nextLinePos = content.indexOf('\n', lastVarPos) + 1;
                
                const initShapeColorsCode = 
                'const initShapeColors = [\n' +
                '    \'rgb(185,185,185)\',\n' +
                '    \'rgb(195,195,195)\',\n' +
                '    \'rgb(210,210,210)\',\n' +
                '    \'rgb(195,195,195)\',\n' +
                '    \'rgb(185,185,185)\',\n' +
                '];\n';
                
                content = content.slice(0, nextLinePos) + 
                        '\n' + initShapeColorsCode + 
                        content.slice(nextLinePos);
            }
        }
    }
    
    // 9. Add backgroundColor if not present
    if (!content.includes('const backgroundColor') && !content.includes('backgroundColor =')) {
        // Find where to insert backgroundColor
        const vSpacePos = content.indexOf('const vSpace');
        
        if (vSpacePos !== -1) {
            const nextLinePos = content.indexOf('\n', vSpacePos) + 1;
            
            content = content.slice(0, nextLinePos) + 
                    'const backgroundColor = \'rgb(255,255,255)\';\n' + 
                    content.slice(nextLinePos);
        }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

// Function to recursively process directories
function processDirectory(dirPath) {
    console.log(`Processing directory: ${dirPath}`);
    
    // Get all entries in this directory
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
            // Recursively process subdirectories
            processDirectory(fullPath);
        } else if (entry.name === 'page.jsx') {
            // Process page.jsx files
            updateExerciseFile(fullPath);
        }
    }
}

// Start processing all exercise folders
console.log('Starting exercise update process...');

// Testing with a single file first for verification
const testFilePath = path.join(exerciseRoot, 'section1/ex-3-1/page.jsx');
if (fs.existsSync(testFilePath)) {
    console.log(`Testing with file: ${testFilePath}`);
    updateExerciseFile(testFilePath);
}

console.log('Test update completed. Check the file before uncomment to update all files.');

/*
// Skip updating the model file's section
['section1', 'section2', 'section3', 'sectionX'].forEach(section => {
    const sectionPath = path.join(exerciseRoot, section);
    if (fs.existsSync(sectionPath)) {
        processDirectory(sectionPath);
    }
});

// For section4, update all exercises except the model file
const section4Path = path.join(exerciseRoot, 'section4');
if (fs.existsSync(section4Path)) {
    const entries = fs.readdirSync(section4Path, { withFileTypes: true });
    
    for (const entry of entries) {
        if (entry.isDirectory() && entry.name !== 'ex-5-4') { // Skip the model file
            const fullPath = path.join(section4Path, entry.name);
            processDirectory(fullPath);
        }
    }
}
*/

console.log('Exercise update completed!');
