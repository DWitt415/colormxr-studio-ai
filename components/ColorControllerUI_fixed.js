import { useEffect, useRef, useState } from 'react';
import ColorSlider from './ColorSlider';

/* ------------------- Color Controller UI ------------------- */
/* ----exercise page may or may not define background color and shape colors---- */
/* ----if not defined, default values are used: black shapes, white background---- */



const initColorArray = [
    'rgb(175, 175, 175)',
    'rgb(180, 180, 180',
    'rgb(185, 185, 185)',
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
];

const rgbToCmy = (r, g, b) => {
    // Ensure RGB values are in the range 0–255
    const clamp = (value) => Math.min(255, Math.max(0, value));
    r = clamp(r);
    g = clamp(g);
    b = clamp(b);
  
    // Normalize RGB to 0–1
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
  
    // Convert to CMY
    const c = Math.round((1 - rNorm) * 100);
    const m = Math.round((1 - gNorm) * 100);
    const y = Math.round((1 - bNorm) * 100);
  
    // Return CMY as an object
    return {
      c,
      m,
      y,
    };
  };

//const ColorControllerUI = () => {
const ColorControllerUI = ({ row, col, width, height, hSpace, vSpace, bgColor = 'rgb(255,255,255)', initShapeColors, onPaletteChange, onBackgroundChange, onShapeColorsChange, hidePalette, showPalette }) => {
    // For backward compatibility: if showPalette is defined, it overrides hidePalette
    const shouldHidePalette = showPalette !== undefined ? !showPalette : hidePalette;

    const [red, setRed] = useState(0);
    const [green, setGreen] = useState(0);
    const [blue, setBlue] = useState(0);
    const [black, setBlack] = useState(0);
    const [yellow, setYellow] = useState(0);
    const [cyan, setCyan] = useState(0);
    const [magenta, setMagenta] = useState(0);
    const [isZPressed, setIsZPressed] = useState(false);
    // Track shift key state
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    // Variable to track the currently selected palette color (CPC)
    const [currentPaletteColor, setCurrentPaletteColor] = useState(null);
    // Track which palette index is currently active
    const [activePaletteIndex, setActivePaletteIndex] = useState(null);
    // Track shapes linked to each palette color (map from palette index to shape index or array)
    const [paletteLinkedShapes, setPaletteLinkedShapes] = useState({});
    // Default palette colors
    const [colorPalette, setColorPalette] = useState([
        '#D9D9D9', '#D9D9D9', '#D9D9D9', '#D9D9D9', '#D9D9D9'
    ]);
    // State to track if we're in a section1 exercise
    const [isSection1Exercise, setIsSection1Exercise] = useState(false);
    
    // Add state to track which shape is being actively pressed
    const [activeShape, setActiveShape] = useState(null);
    
    // Track state for shift-click color relationships
    const [lastShiftClickedShape, setLastShiftClickedShape] = useState(null);
    const [lastShiftClickedBackground, setLastShiftClickedBackground] = useState(false);

   //const backgroundColor = 'rgb(255,255,255)'; // Initial background color

    //set up refs and vars for init background color
    const backgroundShape = useRef(null);  //DW: reference to the background SVG shape
    const [backgroundColor, setBackgroundColor] = useState(bgColor || 'rgb(255,255,255)'); 

    // Notify parent component when background color changes
    useEffect(() => {
        if (onBackgroundChange && typeof onBackgroundChange === 'function') {
            onBackgroundChange(backgroundColor);
        }
    }, [backgroundColor, onBackgroundChange]);
    
    // Check if we're in a section1 exercise
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Check if the current path contains 'section1'
            const isSection1 = window.location.pathname.includes('/exercise/section1/');
            setIsSection1Exercise(isSection1);
        }
    }, []);

    //var to set initial shape color to single var
    const initColor = 'rgb(0,0,0)'; // Initial color for the shapes



    // ------- HARD CODED GRID / SHAPE VALUES--------- //
    /*const row = 5;
    const col = 5;
    const width = 150;
    const height = 150;
    const hSpace = 0;
    const vSpace = 0;*/

    //calculate grid number based on row and col
    const shapeNum = row * col;

    const outputColorCode = `rgb(${red},${green},${blue})`;

    // Add z-key event listeners
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'z') {
                setIsZPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'z') {
                setIsZPressed(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Add shift-key event listeners
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Shift') {
                setIsShiftPressed(true);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'Shift') {
                setIsShiftPressed(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // DW: Disable right-click context menu
    useEffect(() => {
        const disableContextMenu = (event) => {
            event.preventDefault();
        };

        document.addEventListener('contextmenu', disableContextMenu);

        return () => {
            document.removeEventListener('contextmenu', disableContextMenu);
        };
    }, []);

    // Handle slider changes - SINGLE DEFINITION
    const handleSliderChange = (color, value) => {
        let newRed = red;
        let newGreen = green;
        let newBlue = blue;

        if (isZPressed) {
            // When Z is pressed, adjust all channels proportionally
            switch (color) {
                case 'Red':
                    const deltaRed = value - red;
                    newRed = value;
                    newGreen = Math.min(Math.max(green + deltaRed, 0), 255);
                    newBlue = Math.min(Math.max(blue + deltaRed, 0), 255);
                    break;
                case 'Green':
                    const deltaGreen = value - green;
                    newRed = Math.min(Math.max(red + deltaGreen, 0), 255);
                    newGreen = value;
                    newBlue = Math.min(Math.max(blue + deltaGreen, 0), 255);
                    break;
                case 'Blue':
                    const deltaBlue = value - blue;
                    newRed = Math.min(Math.max(red + deltaBlue, 0), 255);
                    newGreen = Math.min(Math.max(green + deltaBlue, 0), 255);
                    newBlue = value;
                    break;
                default:
                    break;
            }
        } else {
            // Original slider behavior
            switch (color) {
                case 'Red':
                    newRed = value;
                    break;
                case 'Green':
                    newGreen = value;
                    break;
                case 'Blue':
                    newBlue = value;
                    break;
                case 'Black':
                    // Moving black slider should update all other sliders to same value as black slider
                    newRed = value;
                    newGreen = value;
                    newBlue = value;
                    // Use a single update at the end of the function instead of individual updates here
                    break;
                case 'Yellow':
                    if (value > yellow) {
                        if (green > red) {
                            newGreen = green > 255 ? 255 : green + (value - yellow);
                            newRed = red + (value - yellow);
                            newRed = newRed > 255 ? 255 : newRed;
                        } else {
                            newRed = red > 255 ? 255 : red + (value - yellow);
                            newGreen = green + (value - yellow);
                            newGreen = newGreen > 255 ? 255 : newGreen;
                        }

                    } else {
                        if (green < red) {
                            newGreen = green < 0 ? 0 : green - (yellow - value);
                            newRed = red - (yellow - value);
                            newRed = newRed < 0 ? 0 : newRed;
                        } else {
                            newRed = red < 0 ? 0 : red - (yellow - value);
                            newGreen = green - (yellow - value);
                            newGreen = newGreen < 0 ? 0 : newGreen;
                        }

                    }

                    value = value > 255 ? 255 : value;
                    value = value < 0 ? 0 : value;
                    newGreen = newGreen > 255 ? 255 : newGreen;
                    newGreen = newGreen < 0 ? 0 : newGreen;
                    newRed = newRed > 255 ? 255 : newRed;
                    newRed = newRed < 0 ? 0 : newRed;
                    // Skip setYellow here to avoid circular dependency
                    // The useEffect that watches RGB will update yellow
                    break;
                case 'Cyan':
                    if (value > cyan) {
                        // when cyan slider is moving up
                        if (green > blue) {
                            newGreen = green > 255 ? 255 : green + (value - cyan);
                            newBlue = blue + (value - cyan);
                            newBlue = newBlue > 255 ? 255 : newBlue;
                        } else {
                            newBlue = blue > 255 ? 255 : blue + (value - cyan);
                            newGreen = green + (value - cyan);
                            newGreen = newGreen > 255 ? 255 : newGreen;
                        }
                    } else {
                        // when cyan slider is moving down
                        if (green < blue) {
                            newGreen = green < 0 ? 0 : green - (cyan - value);
                            newBlue = blue - (cyan - value);
                            newBlue = newBlue < 0 ? 0 : newBlue;
                        } else {
                            newBlue = blue < 0 ? 0 : blue - (cyan - value);
                            newGreen = green - (cyan - value);
                            newGreen = newGreen < 0 ? 0 : newGreen;
                        }
                    }

                    value = value > 255 ? 255 : value;
                    value = value < 0 ? 0 : value;
                    newGreen = newGreen > 255 ? 255 : newGreen;
                    newGreen = newGreen < 0 ? 0 : newGreen;
                    newBlue = newBlue > 255 ? 255 : newBlue;
                    newBlue = newBlue < 0 ? 0 : newBlue;

                    // Skip setCyan here to avoid circular dependency
                    // The useEffect that watches RGB will update cyan
                    break;
                case 'Magenta':
                    if (value > magenta) {
                        // when magenta slider is moving up
                        if (red > blue) {
                            newRed = red > 255 ? 255 : red + (value - magenta);
                            newBlue = blue + (value - magenta);
                            newBlue = newBlue > 255 ? 255 : newBlue;
                        } else {
                            newBlue = blue > 255 ? 255 : blue + (value - magenta);
                            newRed = red + (value - magenta);
                            newRed = newRed > 255 ? 255 : newRed;
                        }
                    } else {
                        // when magenta slider is moving down
                        if (red < blue) {
                            newRed = red < 0 ? 0 : red - (magenta - value);
                            newBlue = blue - (magenta - value);
                            newBlue = newBlue < 0 ? 0 : newBlue;
                        } else {
                            newBlue = blue < 0 ? 0 : blue - (magenta - value);
                            newRed = red - (magenta - value);
                            newRed = newRed < 0 ? 0 : newRed;
                        }
                    }

                    value = value > 255 ? 255 : value;
                    value = value < 0 ? 0 : value;
                    newRed = newRed > 255 ? 255 : newRed;
                    newRed = newRed < 0 ? 0 : newRed;
                    newBlue = newBlue > 255 ? 255 : newBlue;
                    newBlue = newBlue < 0 ? 0 : newBlue;

                    // Skip setMagenta here to avoid circular dependency
                    // The useEffect that watches RGB will update magenta
                    break;
                default:
                    break;
            }
        }

        // Update just the base RGB values
        // Let the useEffect hook handle calculating and updating the derived values
        // (black, yellow, cyan, magenta)
        // Only update if values have actually changed to prevent circular dependencies
        if (newRed !== red) setRed(newRed);
        if (newGreen !== green) setGreen(newGreen);
        if (newBlue !== blue) setBlue(newBlue);
        
        // Remove the individual updates for derived values
        // This prevents the circular dependencies that were causing the infinite loop
    };

    // This effect updates the derived color values (black, yellow, cyan, magenta) when RGB values change
    useEffect(() => {
        // Calculate all values in one batch to avoid triggering multiple renders
        const newBlack = Math.round((red + green + blue) / 3);
        const newYellow = Math.round(red + (green - red) / 2);
        const newCyan = Math.round(green + (blue - green) / 2);
        const newMagenta = Math.round(red + (blue - red) / 2);

        // Check if the derived values are actually different to prevent circular updates
        if (newBlack !== black) setBlack(newBlack);
        if (newYellow !== yellow) setYellow(newYellow);
        if (newCyan !== cyan) setCyan(newCyan);
        if (newMagenta !== magenta) setMagenta(newMagenta);
        
        // This useEffect only runs when RGB values change directly
        // not when they are changed by the sliders for Yellow, Cyan, or Magenta
    }, [red, green, blue]); // Only depend on RGB values, not on derived values




    // ------------------- GRID Color Controller UI ------------------- //

    const [outputColor, setOutputColor] = useState(outputColorCode); // Initial output color
    const [shapeColors, setShapeColors] = useState(
      Array.from({ length: shapeNum }, (_, i) => initShapeColors ? initShapeColors[i % initShapeColors.length] : initColor)
    );
    let [selectedShape, setSelectedShape] = useState(null); // State to keep track of the selected shape
    
    // Grid class for layout
    const gridClass = "grid gap-[0px]";
    
    // Function to create the grid of shapes
    const createGrid = (row, col, width, height, hSpace, vSpace) => {
        const shapes = [];
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                const index = i * col + j;
                
                // Determine if this shape is selected (either individually or as part of a group)
                const isSelected = Array.isArray(selectedShape) 
                    ? selectedShape.includes(index) 
                    : selectedShape === index;
                
                // Get the shape color, considering if it's active (being pressed)
                let shapeColor = shapeColors[index];
                
                // Check if this shape is active - could be a single shape or part of a group
                const isActive = Array.isArray(activeShape) 
                    ? activeShape.includes(index) // Check if in active group
                    : activeShape === index;      // Check if is the active shape
                
                // Apply opacity if shape is being pressed
                let shapeStyle = { 
                    width: `${width}px`, 
                    height: `${height}px`,
                    margin: `${vSpace / 2}px ${hSpace / 2}px`,
                    position: 'relative',
                    cursor: 'pointer'
                };
                
                // Create RGBA color with 60% opacity for active shapes
                let fillColor = shapeColor;
                if (isActive && shapeColor) {
                    if (shapeColor.startsWith('rgb(')) {
                        // If it's already RGB format, convert to RGBA
                        fillColor = shapeColor.replace('rgb(', 'rgba(').replace(')', ', 0.6)');
                    } else if (shapeColor.startsWith('#')) {
                        // If it's a hex color, parse and convert to RGBA
                        const r = parseInt(shapeColor.slice(1, 3), 16);
                        const g = parseInt(shapeColor.slice(3, 5), 16);
                        const b = parseInt(shapeColor.slice(5, 7), 16);
                        fillColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
                    }
                }
                
                // Check if shape color matches background color to add stroke
                const normalizeColor = (color) => {
                    if (!color) return '#ffffff';
                    // If it's already hex, just return lowercase
                    if (color.startsWith('#')) { return color.toLowerCase(); }
                    // If it's RGB format, convert to hex
                    if (color.startsWith('rgb')) {
                        const rgbValues = color.match(/\d+/g);
                        if (rgbValues && rgbValues.length === 3) {
                            const [r, g, b] = rgbValues.map(Number);
                            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase()}`;
                        }
                    }
                    return color.toLowerCase();
                };
                
                const normalizedShapeColor = normalizeColor(shapeColor);
                const normalizedBgColor = normalizeColor(backgroundColor);
                const colorMatches = normalizedShapeColor === normalizedBgColor;
                
                shapes.push(
                    <div 
                        key={index}
                        className="shape-container" 
                        style={shapeStyle}
                        onClick={() => handleShapeClick(index)}
                        onMouseDown={() => handleShapeMouseDown(index)}
                        onMouseUp={() => handleShapeMouseUp()}
                        onMouseOut={() => handleShapeMouseUp()}
                        onMouseLeave={() => handleShapeMouseUp()}
                        onTouchStart={() => handleShapeMouseDown(index)}
                        onTouchEnd={() => handleShapeMouseUp()}
                    >
                        <svg 
                            width="100%" 
                            height="100%" 
                            viewBox={`0 0 ${width} ${height}`}
                            preserveAspectRatio="none"
                            style={{
                                cursor: 'pointer'
                            }}
                        >
                            <rect 
                                x="0" 
                                y="0" 
                                width="100%" 
                                height="100%" 
                                fill={fillColor}
                                stroke="none"
                                strokeWidth="0"
                                rx="0"
                                ry="0"
                            />
                        </svg>
                    </div>
                );
            }
        }
        return shapes;
    };
    
    // Handle mouse down to set active shape
    const handleShapeMouseDown = (index) => {
        // If this shape is part of a selected group, highlight the entire group
        if (Array.isArray(selectedShape) && selectedShape.includes(index)) {
            setActiveShape(selectedShape);
        } else {
            // Otherwise just highlight this specific shape
            setActiveShape(index);
        }
    };
    
    // Handle mouse up to clear active shape, restoring 100% opacity
    const handleShapeMouseUp = () => {
        // Clear the active shape state to restore 100% opacity
        setActiveShape(null);
    };
    
    // Handle background interactions
    const handleBackgroundClick = () => {
        // Store current selection for reference
        const oldSelection = selectedShape;
        
        // If shift is pressed, handle group creation and color cloning
        if (isShiftPressed) {
            if (selectedShape !== null && selectedShape !== 'background') {
                // If a shape or group is selected with shift, apply the shape's color to background
                if (Array.isArray(selectedShape)) {
                    // For groups, use the current slider value for consistent behavior
                    setBackgroundColor(outputColorCode);
                } else {
                    // For single shape, use its specific color
                    setBackgroundColor(shapeColors[selectedShape]);
                }
                
                // Track the relationship between the selected shapes and background
                if (Array.isArray(selectedShape)) {
                    setLastShiftClickedShape([...selectedShape]); // Copy the array
                } else {
                    setLastShiftClickedShape(selectedShape);
                }
                setLastShiftClickedBackground(true);
                
                // Keep the existing selection active but also mark background as selected
                // We use 'background' special value to maintain the selection context
                setSelectedShape('background');
            } else if (currentPaletteColor) {
                // If a palette color is active, apply it to the background
                setBackgroundColor(currentPaletteColor);
                setSelectedShape('background');
                
                updateSlidersFromColor(currentPaletteColor);
            }
            
            return;
        }
        
        // Regular click (no shift): select only the background
        setSelectedShape('background');
        
        // Update sliders based on background color
        updateSlidersFromColor(backgroundColor);
        
        // Reset shared color tracking
        setLastShiftClickedShape(null);
        setLastShiftClickedBackground(false);
        
        // We don't reset activePaletteIndex because we want to keep tracking associations
        // But we should deselect any active palette color to prevent confusion
        setCurrentPaletteColor(null);
    };
    
    // Handle background mouse down for visual feedback
    const handleBackgroundMouseDown = () => {
        if (backgroundShape.current) {
            // Style for active state
            backgroundShape.current.style.opacity = '0.7';
            
            // If background is linked to shapes, also mark those shapes as active
            if (lastShiftClickedBackground && lastShiftClickedShape) {
                if (Array.isArray(lastShiftClickedShape)) {
                    // Set the entire array as active
                    setActiveShape(lastShiftClickedShape);
                } else {
                    // Set just this shape as active
                    setActiveShape(lastShiftClickedShape);
                }
            }
        }
    };
    
    // Handle background mouse up to reset visual states
    const handleBackgroundMouseUp = () => {
        // Reset opacity on mouse up
        if (backgroundShape.current) {
            backgroundShape.current.style.opacity = '1';
        }
        
        // Reset active shape state
        setActiveShape(null);
    };
    
    // Function to update sliders from color string
    const updateSlidersFromColor = (colorString) => {
        if (!colorString) return;
        
        let r, g, b;
        
        // Handle hex colors
        if (colorString.startsWith('#')) {
            r = parseInt(colorString.slice(1, 3), 16);
            g = parseInt(colorString.slice(3, 5), 16);
            b = parseInt(colorString.slice(5, 7), 16);
        } 
        // Handle rgb colors
        else if (colorString.startsWith('rgb')) {
            const match = colorString.match(/\d+/g);
            if (match && match.length >= 3) {
                r = parseInt(match[0]);
                g = parseInt(match[1]);
                b = parseInt(match[2]);
            } else {
                return; // Invalid format
            }
        } else {
            return; // Unsupported color format
        }
        
        // Update RGB values
        setRed(r);
        setGreen(g);
        setBlue(b);
        
        // CMYK values will be updated by the useEffect that watches RGB values
    };

    // Function to compare two shape selections (handling both individual and group selections)
    const areSelectionsEqual = (selection1, selection2) => {
        // Handle different types
        if (typeof selection1 !== typeof selection2) {
            return false;
        }
        
        // Handle simple cases (both are 'background' or both are null)
        if (selection1 === selection2) {
            return true;
        }
        
        // Handle array comparison
        if (Array.isArray(selection1) && Array.isArray(selection2)) {
            if (selection1.length !== selection2.length) {
                return false;
            }
            
            // Sort arrays for consistent comparison since order shouldn't matter
            const sorted1 = [...selection1].sort();
            const sorted2 = [...selection2].sort();
            
            // Compare each element by position (safer than using includes)
            for (let i = 0; i < sorted1.length; i++) {
                if (sorted1[i] !== sorted2[i]) {
                    return false;
                }
            }
            return true;
        }
        
        return false;
    };
    
    // Function to handle color changes
    const handleColorChange = (color) => {
        setOutputColor(color);
        
        // If a shape is selected update its color
        if (selectedShape !== null && selectedShape !== 'background') {
            const newShapeColors = [...shapeColors]; // Create a copy of shapeColors
            
            if (Array.isArray(selectedShape)) {
                // Update all shapes in the group
                selectedShape.forEach((index) => {
                    newShapeColors[index] = color; // Update the color of each selected shape
                });
                
                // If background was shift-clicked after these shapes, update it too
                if (lastShiftClickedBackground && lastShiftClickedShape) {
                    if (Array.isArray(lastShiftClickedShape)) {
                        // If the selected shapes include any of the last shift-clicked shapes, update background
                        const hasCommonShape = lastShiftClickedShape.some(shapeIndex => 
                            selectedShape.includes(shapeIndex)
                        );
                        
                        if (hasCommonShape) {
                            setBackgroundColor(color);
                        }
                    } else if (selectedShape.includes(lastShiftClickedShape)) {
                        setBackgroundColor(color);
                    }
                }
                
                // Update palette colors that are linked to the current shape selection
                Object.entries(paletteLinkedShapes).forEach(([paletteIndex, linkedShape]) => {
                    const palIndex = parseInt(paletteIndex);
                    
                    // Check if the linked shape matches our current selection
                    if (areSelectionsEqual(linkedShape, selectedShape)) {
                        // Convert color to hex for the palette
                        if (color.startsWith('rgb')) {
                            const rgbValues = color.match(/\d+/g);
                            if (rgbValues && rgbValues.length === 3) {
                                const [r, g, b] = rgbValues.map(Number);
                                const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                                
                                // Update the palette color
                                const newPalette = [...colorPalette];
                                newPalette[palIndex] = hexColor;
                                setColorPalette(newPalette);
                                
                                // Update current palette color if this is the active palette
                                if (activePaletteIndex === palIndex) {
                                    setCurrentPaletteColor(color);
                                }
                            }
                        }
                    }
                });
            } else {
                // Update just the one selected shape
                newShapeColors[selectedShape] = color;
                
                // Only update background if it was shift-clicked after this shape
                if (lastShiftClickedBackground && lastShiftClickedShape === selectedShape) {
                    setBackgroundColor(color);
                }
                
                // Update palette colors that are linked to this shape
                Object.entries(paletteLinkedShapes).forEach(([paletteIndex, linkedShape]) => {
                    const palIndex = parseInt(paletteIndex);
                    
                    // Check if the linked shape matches our current selection
                    if (linkedShape === selectedShape) {
                        // Convert color to hex for the palette
                        if (color.startsWith('rgb')) {
                            const rgbValues = color.match(/\d+/g);
                            if (rgbValues && rgbValues.length === 3) {
                                const [r, g, b] = rgbValues.map(Number);
                                const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                                
                                // Update the palette color
                                const newPalette = [...colorPalette];
                                newPalette[palIndex] = hexColor;
                                setColorPalette(newPalette);
                                
                                // Update current palette color if this is the active palette
                                if (activePaletteIndex === palIndex) {
                                    setCurrentPaletteColor(color);
                                }
                            }
                        }
                    }
                });
            }
            
            setShapeColors(newShapeColors);
        }
        
        // If background is selected, update background color and linked shapes
        if (selectedShape === 'background') {
            setBackgroundColor(color);
            
            // Update any linked shapes
            if (lastShiftClickedBackground && lastShiftClickedShape !== null) {
                const newShapeColors = [...shapeColors];
                
                if (Array.isArray(lastShiftClickedShape)) {
                    // Update all shapes in the linked group
                    lastShiftClickedShape.forEach(index => {
                        newShapeColors[index] = color;
                    });
                } else {
                    // Update the single linked shape
                    newShapeColors[lastShiftClickedShape] = color;
                }
                
                setShapeColors(newShapeColors);
            }
            
            // Update palette colors linked to the background
            Object.entries(paletteLinkedShapes).forEach(([paletteIndex, linkedShape]) => {
                const palIndex = parseInt(paletteIndex);
                
                // Check if this palette is linked to the background
                if (linkedShape === 'background') {
                    // Convert color to hex for the palette
                    if (color.startsWith('rgb')) {
                        const rgbValues = color.match(/\d+/g);
                        if (rgbValues && rgbValues.length === 3) {
                            const [r, g, b] = rgbValues.map(Number);
                            const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                            
                            // Update the palette color
                            const newPalette = [...colorPalette];
                            newPalette[palIndex] = hexColor;
                            setColorPalette(newPalette);
                            
                            // Update current palette color if this is the active palette
                            if (activePaletteIndex === palIndex) {
                                setCurrentPaletteColor(color);
                            }
                        }
                    }
                }
            });
        }
    };

    // Call handleColorChange when any of the color sliders are changed
    useEffect(() => {
        // Only apply color changes if we have a valid selection
        if (selectedShape !== null) {
            console.log('Color sliders changed, applying to current selection:', selectedShape);
            handleColorChange(outputColorCode);
        } else {
            console.log('Color sliders changed but no selection to apply to');
        }
    }, [outputColorCode, selectedShape]);

    // Notify parent component when shape colors change
    useEffect(() => {
        if (onShapeColorsChange && typeof onShapeColorsChange === 'function') {
            onShapeColorsChange(shapeColors);
        }
    }, [shapeColors, onShapeColorsChange]);
    
    // Notify parent component when palette colors change
    useEffect(() => {
        if (onPaletteChange && typeof onPaletteChange === 'function') {
            onPaletteChange(colorPalette);
        }
    }, [colorPalette, onPaletteChange]);
    
    // Debug logging for palette associations
    useEffect(() => {
        console.log('Palette associations updated:', JSON.stringify(paletteLinkedShapes));
    }, [paletteLinkedShapes]);
    
    // Debug logging for selection changes
    useEffect(() => {
        console.log('Selection changed to:', selectedShape);
    }, [selectedShape]);
    
    // Notify parent component when background color changes
    useEffect(() => {
        if (onBackgroundChange && typeof onBackgroundChange === 'function') {
            onBackgroundChange(backgroundColor);
            console.log("Background color changed to:", backgroundColor);
        }
    }, [backgroundColor, onBackgroundChange]);
    
    // Handle clicks on palette squares
    const handlePaletteClick = (index) => {
        console.log('Palette click on', index, 'current selection:', selectedShape);
        
        // If shift is pressed and a shape is selected, copy color FROM selected shape TO this palette square
        if (isShiftPressed && selectedShape !== null) {
            console.log('Shift-clicked palette', index, 'with selection', selectedShape);
            
            // Get and store color from the current selection
            let colorToStore;
            
            if (selectedShape === 'background') {
                colorToStore = backgroundColor;
            } else if (Array.isArray(selectedShape)) {
                colorToStore = outputColorCode; // Use the current slider value for consistent behavior
            } else {
                colorToStore = shapeColors[selectedShape]; // Use the specific shape color
            }
            
            // Convert rgb to hex for storing in palette
            if (colorToStore?.startsWith('rgb')) {
                const rgbValues = colorToStore.match(/\d+/g);
                if (rgbValues && rgbValues.length === 3) {
                    const [r, g, b] = rgbValues.map(Number);
                    colorToStore = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                }
            }
            
            // Update the palette
            const newPalette = [...colorPalette];
            newPalette[index] = colorToStore || '#D9D9D9'; // Fallback to default if colorToStore is undefined
            setColorPalette(newPalette);
            
            // Store the association between this palette square and the current shape selection
            const newPaletteLinkedShapes = { ...paletteLinkedShapes };
            // For arrays, create a deep copy to avoid reference issues
            if (Array.isArray(selectedShape)) {
                newPaletteLinkedShapes[index] = [...selectedShape]; // Deep copy the array
            } else {
                newPaletteLinkedShapes[index] = selectedShape;
            }
            setPaletteLinkedShapes(newPaletteLinkedShapes);
            console.log('Linking palette', index, 'to shape', newPaletteLinkedShapes[index]);
            
            // Make this the active palette index and store its color
            setActivePaletteIndex(index);
            setCurrentPaletteColor(colorToStore);
            
            return; // Skip the rest of the function
        }
        
        // Regular click: Set the current palette color and update appropriate selections
        const hexColor = colorPalette[index];
        
        try {
            // Convert hex to RGB
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);
            
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                const rgbColor = `rgb(${r},${g},${b})`;                    // Set this as the active palette color
                    setCurrentPaletteColor(rgbColor);
                    setActivePaletteIndex(index);
                    
                    // If this palette has a linked shape or group, select it
                    if (paletteLinkedShapes[index]) {
                        const linkedSelection = paletteLinkedShapes[index];
                        console.log('Selecting linked shape', linkedSelection, 'from palette', index);
                        console.log('All palette links:', JSON.stringify(paletteLinkedShapes));
                        
                        // Make sure to create a fresh copy if it's an array to avoid reference issues
                        if (Array.isArray(linkedSelection)) {
                            setSelectedShape([...linkedSelection]);
                        } else {
                            setSelectedShape(linkedSelection);
                        }
                        
                        // Update sliders to reflect the selected palette color
                        updateSlidersFromColor(rgbColor);
                        
                        // DO NOT apply color changes here - we just want to select the shapes
                        // and set up the sliders, but not actually change any colors yet
                        // The user will use the sliders to change colors after selection
                } else {
                    // If no link exists, just update sliders and use current selection
                    updateSlidersFromColor(rgbColor);
                    
                    // DO NOT apply color changes here either
                    // Let the user initiate color changes through the sliders
                }
            }
        } catch (err) {
            console.error('Error parsing palette color:', hexColor, err);
        }
    };

    // Function to handle clicking on shapes
    const handleShapeClick = (index) => {
        console.log('Shape clicked:', index);
        
        // If shift is pressed, handle group creation and color cloning
        if (isShiftPressed) {
            if (selectedShape === 'background') {
                // If background is selected and shift is pressed, apply background color to this shape
                const newShapeColors = [...shapeColors];
                newShapeColors[index] = backgroundColor;
                setShapeColors(newShapeColors);
                
                // Store old selection for reference
                const oldSelection = selectedShape;
                
                // Create or expand selection group to include both background and this shape
                setSelectedShape([index]); // Start fresh group with this shape
                
                // Track relationship for synchronized color changes
                setLastShiftClickedShape(index);
                setLastShiftClickedBackground(true);
            } else if (selectedShape !== null && selectedShape !== 'background') {
                // Store current selection for reference
                const oldSelection = selectedShape;
                
                // If a shape or group is already selected with shift, toggle this shape in the group
                // Always create a fresh deep copy of the array to avoid reference issues
                const newSelectedShapes = Array.isArray(selectedShape) 
                    ? [...selectedShape] 
                    : [selectedShape];
                
                // Check if shape is already in group (toggle behavior)
                const shapeIndex = newSelectedShapes.indexOf(index);
                if (shapeIndex !== -1) {
                    // Remove this shape from the group
                    newSelectedShapes.splice(shapeIndex, 1);
                    
                    let newSelection;
                    if (newSelectedShapes.length === 1) {
                        // Convert back to single selection if only one remains
                        newSelection = newSelectedShapes[0];
                        setSelectedShape(newSelection);
                    } else if (newSelectedShapes.length === 0) {
                        // Clear selection if all shapes are removed
                        newSelection = null;
                        setSelectedShape(newSelection);
                    } else {
                        // Keep as group
                        newSelection = newSelectedShapes;
                        setSelectedShape(newSelection);
                    }
                    
                    // Update any palette color links that were tied to the old group
                    const newPaletteLinkedShapes = { ...paletteLinkedShapes };
                    Object.entries(paletteLinkedShapes).forEach(([palIndex, linkedSelection]) => {
                        // Only update arrays and if they match the previous selection
                        if (Array.isArray(linkedSelection) && areSelectionsEqual(linkedSelection, oldSelection)) {
                            // If we now have a single item or null, store that, otherwise store the new array
                            newPaletteLinkedShapes[palIndex] = Array.isArray(newSelection) 
                                ? [...newSelection]  // Deep copy the array
                                : newSelection;      // Store single value or null
                        }
                    });
                    setPaletteLinkedShapes(newPaletteLinkedShapes);
                } else {
                    // Add this shape to the group
                    newSelectedShapes.push(index);
                    setSelectedShape(newSelectedShapes);
                    
                    // Apply the current group's color to the newly added shape
                    const newShapeColors = [...shapeColors];
                    newShapeColors[index] = outputColorCode; // Use current slider values
                    setShapeColors(newShapeColors);
                    
                    // Update any palette color links that are tied to the old group
                    // This ensures palette links update when group membership changes
                    const newPaletteLinkedShapes = { ...paletteLinkedShapes };
                    Object.entries(paletteLinkedShapes).forEach(([palIndex, linkedSelection]) => {
                        // Only update arrays and if they match the previous selection
                        if (Array.isArray(linkedSelection) && areSelectionsEqual(linkedSelection, oldSelection)) {
                            newPaletteLinkedShapes[palIndex] = [...newSelectedShapes]; // Deep copy
                        }
                    });
                    setPaletteLinkedShapes(newPaletteLinkedShapes);
                }
            } else if (currentPaletteColor) {
                // Store current selection for reference
                const oldSelection = selectedShape;
                
                // If a palette color is active, apply it to this shape
                const newShapeColors = [...shapeColors];
                newShapeColors[index] = currentPaletteColor;
                setShapeColors(newShapeColors);
                
                // Select this shape
                setSelectedShape(index);
                
                // Update sliders to reflect the color
                updateSlidersFromColor(currentPaletteColor);
            } else {
                // Store current selection for reference
                const oldSelection = selectedShape;
                
                // No previous selection, just select this shape
                setSelectedShape(index);
                
                // Update sliders based on this shape's color
                updateSlidersFromColor(shapeColors[index]);
            }
            
            return;
        }
        
        // Store current selection for reference
        const oldSelection = selectedShape;
        
        // Regular click (no shift): select only this shape
        setSelectedShape(index);
        
        // Update sliders based on this shape's color
        updateSlidersFromColor(shapeColors[index]);
        
        // Reset shared color tracking
        setLastShiftClickedShape(null);
        setLastShiftClickedBackground(false);
        
        // Reset active shape state
        setActiveShape(null);
        
        // We don't reset activePaletteIndex because we want to keep tracking associations
        // But we should deselect any active palette color to prevent confusion
        setCurrentPaletteColor(null);
    };

    /*-------------------DW: added SVG background shape -------------------*/

    return (
        <div
            id='main-div'
            className=" min-h-[100vh] w-full relative pb-10 flex justify-center items-center"
            style={{ position: 'relative' }} >
            
            <svg ref={backgroundShape}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                onClick={() => handleBackgroundClick()}
                onMouseDown={() => handleBackgroundMouseDown()}
                onMouseUp={() => handleBackgroundMouseUp()}
                onTouchStart={() => handleBackgroundMouseDown()}
                onTouchEnd={() => {
                    handleBackgroundMouseUp();
                    handleBackgroundClick();
                }}
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={backgroundColor}
                    className="cursor-pointer"
                />
            </svg>
            
            {/* Vertical Color Palette - Fixed to the left side */}
            {/* We'll use useEffect to check the path and conditionally render */}
            <div 
                className="fixed left-2 top-1/2 transform -translate-y-1/2 z-10" 
                style={{ 
                    background: "transparent", 
                    padding: "10px 10px", 
                    borderRadius: "0 4px 4px 0",
                    boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
                    border: "1px solid transparent",
                    borderImage: "linear-gradient(to bottom, #C8C8C8, #626262) 1",
                    minWidth: "50px",
                    display: shouldHidePalette === true || isSection1Exercise ? 'none' : 'block' // Show palette by default unless explicitly hidden or in section1
                }}
            >
                <div className="flex flex-col gap-2">
                    {colorPalette.map((color, index) => (
                        <div 
                            key={index}
                            className={`palette-square shadow-sm hover:shadow-md transition-shadow ${activePaletteIndex === index ? 'active-palette' : ''}`}
                            style={{
                                width: "30px",
                                height: "30px",
                                backgroundColor: color,
                                cursor: "pointer",
                                position: "relative",
                                border: activePaletteIndex === index ? "2px solid white" : "none",
                                boxShadow: activePaletteIndex === index ? "0 0 4px rgba(0,0,0,0.5)" : "none"
                            }}
                            onClick={() => handlePaletteClick(index)}
                            onMouseDown={(e) => { 
                                e.target.style.opacity = 0.8;
                            }}
                            onMouseUp={(e) => { 
                                e.target.style.opacity = 1; 
                                // Always clear the active shape on mouse up to restore 100% opacity
                                setActiveShape(null);
                            }}
                            onTouchStart={(e) => { 
                                e.target.style.opacity = 0.8;
                            }}
                            onTouchEnd={(e) => {
                                e.target.style.opacity = 1;
                                // Always clear the active shape on touch end to restore 100% opacity  
                                setActiveShape(null);
                                handlePaletteClick(index); // Handle the click on touch end
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-center gap-10 scale-90 lg:scale-100 relative top-5">
                {
                    <div
                        style={
                            {
                                display: 'grid',
                                gridTemplateColumns: `repeat(${col}, 1fr)`,
                            }
                        }
                        className={` ${gridClass}`}
                    >
                        {createGrid(row, col, width, height, hSpace, vSpace)}
                    </div>
                }
            </div>




            {/* --------------- SLIDER PANEL ---------------- */}
            <div className="flex flex-col justify-center bg-background pt-10 rounded-2xl absolute scale-75 bottom-5 right-0 lg:right-0 lg:scale-90 lg:bottom-9" 
                style={{ 
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                    position: 'absolute',
                    overflow: 'hidden',
                    margin: '0 0px 0px 0',
                    bottom: '30px',
                    right: '0px'
                }}
            > 
                {/* Gradient border overlay */}
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        borderRadius: '1rem',
                        border: '3px solid transparent',
                        background: 'linear-gradient(to bottom, #C8C8C8, #626262) border-box',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                        pointerEvents: 'none'
                    }}
                />
                
                <div className="flex items-center flex-wrap pl-3 pr-3">
                    <ColorSlider svg="/GS_handle.svg" color="white" value={black} onChange={(value) => handleSliderChange('Black', value)} />
                    <ColorSlider svg="/R_handle.svg" color="Red" value={red} onChange={(value) => handleSliderChange('Red', value)} />
                    <ColorSlider svg="/Y_handle.svg" color="Yellow" value={yellow} onChange={(value) => handleSliderChange('Yellow', value)} />
                    <ColorSlider svg="/G_handle.svg" color="Green" value={green} onChange={(value) => handleSliderChange('Green', value)} />
                    <ColorSlider svg="/C_handle.svg" color="Cyan" value={cyan} onChange={(value) => handleSliderChange('Cyan', value)} />
                    <ColorSlider svg="/B_handle.svg" color="Blue" value={blue} onChange={(value) => handleSliderChange('Blue', value)} />
                    <ColorSlider svg="/M_handle.svg" color="Magenta" value={magenta} onChange={(value) => handleSliderChange('Magenta', value)} />
                </div>
                <div className="flex justify-center items-center gap-1 pt-7">
                    <div className='bg-[#A9A9A9] dark:bg-zinc-600 text-white text-center w-1/2 p-3 rounded-bl-2xl'>
                        <h2>
                            {
                                `${red}.${green}.${blue}`
                            }
                        </h2>
                    </div>
                    <div className='bg-[#565656]  text-white text-center w-1/2 p-3 rounded-br-2xl'>
                        <h2>
                            {
                                //hexadecimal value in #000000 format 
                                `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1).toUpperCase()}`
                               
                            }
                        </h2>
                    </div>
                </div>
            </div>



        </div>
    );

    // Effect to update palette colors when linked shapes' colors change
    useEffect(() => {
        // We don't need this effect anymore since palette updates are handled directly
        // in the handleColorChange function when shapes change color
    }, [red, green, blue, selectedShape]);
};

export default ColorControllerUI;
