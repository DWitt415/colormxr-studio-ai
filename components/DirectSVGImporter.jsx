'use client'
import React, { useEffect, useRef, useState } from 'react';
import ColorSlider from './ColorSlider';

/**
 * DirectSVGImporter - A component for accurately rendering imported SVG shapes
 * This component directly uses the x/y coordinates from the imported SVG
 * and preserves the exact grid layout and spacing from the original SVG file
 */
const DirectSVGImporter = ({ svgData, onPaletteChange, onBackgroundChange, onShapeColorsChange }) => {
    // Debug log what we received
    console.log("DirectSVGImporter received data:", svgData);
    
    const canvasRef = useRef(null);
    
    // Check if svgData exists and log what we received
    if (!svgData) {
        return (
            <div className="flex flex-col items-center justify-center h-96 w-full text-red-500">
                <p>Error: No SVG data provided</p>
                <p className="text-sm mt-2">Please try importing your SVG file again.</p>
            </div>
        );
    }
    
    if (!svgData.shapesData || !Array.isArray(svgData.shapesData) || svgData.shapesData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 w-full text-red-500">
                <p>Error: Invalid SVG data (no shapes found)</p>
                <p className="text-sm mt-2">The SVG file did not contain any valid shapes.</p>
            </div>
        );
    }
    
    // Extract SVG data - focusing only on what we need
    const {
        backgroundColor = 'rgb(255,255,255)', 
        shapeColors = [], 
        shapesData = [], 
        xSpacing = svgData.xSpacing || 0, 
        ySpacing = svgData.ySpacing || 0 
    } = svgData;
    
    // State for sliders and UI
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(-1); // -1 for background, or array for multi-select
    const [isShiftPressed, setIsShiftPressed] = useState(false); // Track shift key state
    const [isZPressed, setIsZPressed] = useState(false); // Track Z key for proportional changes
    const [rgbValues, setRgbValues] = useState({ red: 0, green: 0, blue: 0 }); // Combined RGB state to prevent render loops
    const [cmykValues, setCmykValues] = useState({ cyan: 0, magenta: 0, yellow: 0, black: 0 }); // Combined CMYK state
    const [currentColors, setCurrentColors] = useState([]); // Initialize as empty array
    const [currentBgColor, setCurrentBgColor] = useState('rgb(255,255,255)'); // Default white background
    const isInitialMount = useRef(true);
    
    // Add ref to track slider dragging state
    const isSliderChanging = useRef(false);
    
    // Ref to store timeout ID
    const sliderTimeout = useRef(null);
    
    // State to track mousedown/touch on shapes
    const [activeShape, setActiveShape] = useState(null);
    const [originalShapeColors, setOriginalShapeColors] = useState({});
    
    // Parse RGB string into components
    const parseRgb = (rgbStr) => {
        // Handle hex format
        if (rgbStr && rgbStr.startsWith('#')) {
            const hex = rgbStr.substring(1);
            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);
            return { r, g, b };
        }
        
        // Handle rgb format
        const match = rgbStr ? rgbStr.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i) : null;
        if (match) {
            return {
                r: parseInt(match[1], 10),
                g: parseInt(match[2], 10),
                b: parseInt(match[3], 10)
            };
        }
        
        // Default fallback
        return { r: 0, g: 0, b: 0 };
    };
    
    // Listen for keyboard events for shift key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(true);
            }
            if (e.key === 'z') {
                setIsZPressed(true);
            }
        };
        
        const handleKeyUp = (e) => {
            if (e.key === 'Shift') {
                setIsShiftPressed(false);
            }
            if (e.key === 'z') {
                setIsZPressed(false);
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);
    
    // Initialize colors from SVG data - Fixed to run only once on mount
    useEffect(() => {
        if (!isInitialMount.current) return; // Skip if not first render
        isInitialMount.current = false;
        
        console.log("DirectSVGImporter: Initializing colors from SVG data", { 
            shapeColors: shapeColors?.length || 0, 
            backgroundColor 
        });
        
        if (shapeColors && shapeColors.length > 0) {
            // Make sure any missing colors get a default
            const normalizedColors = [...shapeColors];
            
            // Fill in missing colors with defaults if needed
            if (shapesData && normalizedColors.length < shapesData.length) {
                for (let i = normalizedColors.length; i < shapesData.length; i++) {
                    const fallbackColor = shapesData[i]?.color || 'rgb(200,200,200)';
                    normalizedColors.push(fallbackColor);
                }
            }
            
            setCurrentColors(normalizedColors);
            
            // Initialize slider values from the first shape color
            if (normalizedColors.length > 0) {
                const firstColor = normalizedColors[0];
                updateSlidersFromColor(firstColor);
            }
        }
        
        if (backgroundColor) {
            setCurrentBgColor(backgroundColor);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty dependency array - run only on mount
    
    // Separate effect to notify parent components (with debounce to prevent loops)
    useEffect(() => {
        if (isInitialMount.current) return; // Skip initial render

        // Only update externally if we're not actively dragging a slider
        if (!isSliderChanging.current) {
            const notifyTimeout = setTimeout(() => {
                if (onPaletteChange && currentColors.length > 0) {
                    onPaletteChange(currentColors.slice(0, 5));
                }
                
                if (onShapeColorsChange && currentColors.length > 0) {
                    onShapeColorsChange(currentColors);
                }
                
                if (onBackgroundChange) {
                    onBackgroundChange(currentBgColor);
                }
            }, 100);
            
            return () => clearTimeout(notifyTimeout);
        }
    }, [currentColors, currentBgColor, onShapeColorsChange, onPaletteChange, onBackgroundChange]);
    
    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            if (sliderTimeout.current) {
                clearTimeout(sliderTimeout.current);
            }
        };
    }, []);
    
    // Helper function to update sliders based on a color string
    const updateSlidersFromColor = (colorString) => {
        if (!colorString) return;
        
        // Parse the color
        const { r, g, b } = parseRgb(colorString);
        
        // Update RGB values in a single state update to prevent render loops
        setRgbValues({ red: r, green: g, blue: b });
        
        // Calculate and update CMYK values
        const black = Math.round((r + g + b) / 3);
        const yellow = Math.round(r + (g - r) / 2);
        const cyan = Math.round(g + (b - g) / 2);
        const magenta = Math.round(r + (b - r) / 2);
        
        setCmykValues({
            cyan,
            magenta,
            yellow,
            black
        });
    };
    
    // Update sliders when selection changes
    useEffect(() => {
        let color;
        
        if (selectedShapeIndex === -1) {
            // Background selected
            color = currentBgColor;
        } else if (Array.isArray(selectedShapeIndex) && selectedShapeIndex.length > 0) {
            // Multiple shapes selected - use the color of the first selected shape
            const firstSelectedIndex = selectedShapeIndex[0];
            if (firstSelectedIndex >= 0 && firstSelectedIndex < currentColors.length) {
                color = currentColors[firstSelectedIndex];
            } else {
                return;
            }
        } else if (typeof selectedShapeIndex === 'number' && selectedShapeIndex >= 0 && selectedShapeIndex < currentColors.length) {
            // Single shape selected
            color = currentColors[selectedShapeIndex];
        } else {
            return;
        }
        
        updateSlidersFromColor(color);
        
    }, [selectedShapeIndex, currentBgColor, currentColors]);
    
    // Handle color updates without causing re-renders - Modified to handle batching
    const updateColor = (r, g, b) => {
        const colorStr = `rgb(${r},${g},${b})`;
        
        if (selectedShapeIndex === -1) {
            // Update background
            setCurrentBgColor(colorStr);
            
            // Only notify parent outside of slider changes - prevents loops
            if (!isSliderChanging.current && onBackgroundChange) {
                onBackgroundChange(colorStr);
            }
        } else {
            // Update shape color(s)
            const newColors = [...currentColors];
            
            // Handle multi-selection (array of shape indices)
            if (Array.isArray(selectedShapeIndex)) {
                // Update all selected shapes with the same color
                selectedShapeIndex.forEach(index => {
                    if (index >= 0 && index < newColors.length) {
                        newColors[index] = colorStr;
                    }
                });
            } else {
                // Update single shape
                newColors[selectedShapeIndex] = colorStr;
            }
            
            setCurrentColors(newColors);
            
            // Only notify parent outside of slider changes - prevents loops
            if (!isSliderChanging.current && onPaletteChange) {
                onPaletteChange(newColors.slice(0, 5));
            }
        }
    };
    
    // Unified slider change handler - Fixed to prevent render loops
    const handleSliderChange = (color, value) => {
        isSliderChanging.current = true;
        
        const { red, green, blue } = rgbValues;
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
                    // Moving black slider should update all other sliders to same value
                    newRed = value;
                    newGreen = value;
                    newBlue = value;
                    break;
                case 'Yellow':
                    if (value > cmykValues.yellow) {
                        if (green > red) {
                            newGreen = green > 255 ? 255 : green + (value - cmykValues.yellow);
                            newRed = red + (value - cmykValues.yellow);
                            newRed = newRed > 255 ? 255 : newRed;
                        } else {
                            newRed = red > 255 ? 255 : red + (value - cmykValues.yellow);
                            newGreen = green + (value - cmykValues.yellow);
                            newGreen = newGreen > 255 ? 255 : newGreen;
                        }
                    } else {
                        if (green < red) {
                            newGreen = green < 0 ? 0 : green - (cmykValues.yellow - value);
                            newRed = red - (cmykValues.yellow - value);
                            newRed = newRed < 0 ? 0 : newRed;
                        } else {
                            newRed = red < 0 ? 0 : red - (cmykValues.yellow - value);
                            newGreen = green - (cmykValues.yellow - value);
                            newGreen = newGreen < 0 ? 0 : newGreen;
                        }
                    }
                    
                    value = value > 255 ? 255 : value;
                    value = value < 0 ? 0 : value;
                    newGreen = newGreen > 255 ? 255 : newGreen;
                    newGreen = newGreen < 0 ? 0 : newGreen;
                    newRed = newRed > 255 ? 255 : newRed;
                    newRed = newRed < 0 ? 0 : newRed;
                    break;
                case 'Cyan':
                    if (value > cmykValues.cyan) {
                        // when cyan slider is moving up
                        if (green > blue) {
                            newGreen = green > 255 ? 255 : green + (value - cmykValues.cyan);
                            newBlue = blue + (value - cmykValues.cyan);
                            newBlue = newBlue > 255 ? 255 : newBlue;
                        } else {
                            newBlue = blue > 255 ? 255 : blue + (value - cmykValues.cyan);
                            newGreen = green + (value - cmykValues.cyan);
                            newGreen = newGreen > 255 ? 255 : newGreen;
                        }
                    } else {
                        // when cyan slider is moving down
                        if (green < blue) {
                            newGreen = green < 0 ? 0 : green - (cmykValues.cyan - value);
                            newBlue = blue - (cmykValues.cyan - value);
                            newBlue = newBlue < 0 ? 0 : newBlue;
                        } else {
                            newBlue = blue < 0 ? 0 : blue - (cmykValues.cyan - value);
                            newGreen = green - (cmykValues.cyan - value);
                            newGreen = newGreen < 0 ? 0 : newGreen;
                        }
                    }
                    
                    value = value > 255 ? 255 : value;
                    value = value < 0 ? 0 : value;
                    newGreen = newGreen > 255 ? 255 : newGreen;
                    newGreen = newGreen < 0 ? 0 : newGreen;
                    newBlue = newBlue > 255 ? 255 : newBlue;
                    newBlue = newBlue < 0 ? 0 : newBlue;
                    break;
                case 'Magenta':
                    if (value > cmykValues.magenta) {
                        // when magenta slider is moving up
                        if (red > blue) {
                            newRed = red > 255 ? 255 : red + (value - cmykValues.magenta);
                            newBlue = blue + (value - cmykValues.magenta);
                            newBlue = newBlue > 255 ? 255 : newBlue;
                        } else {
                            newBlue = blue > 255 ? 255 : blue + (value - cmykValues.magenta);
                            newRed = red + (value - cmykValues.magenta);
                            newRed = newRed > 255 ? 255 : newRed;
                        }
                    } else {
                        // when magenta slider is moving down
                        if (red < blue) {
                            newRed = red < 0 ? 0 : red - (cmykValues.magenta - value);
                            newBlue = blue - (cmykValues.magenta - value);
                            newBlue = newBlue < 0 ? 0 : newBlue;
                        } else {
                            newBlue = blue < 0 ? 0 : blue - (cmykValues.magenta - value);
                            newRed = red - (cmykValues.magenta - value);
                            newRed = newRed < 0 ? 0 : newRed;
                        }
                    }
                    
                    value = value > 255 ? 255 : value;
                    value = value < 0 ? 0 : value;
                    newRed = newRed > 255 ? 255 : newRed;
                    newRed = newRed < 0 ? 0 : newRed;
                    newBlue = newBlue > 255 ? 255 : newBlue;
                    newBlue = newBlue < 0 ? 0 : newBlue;
                    break;
                default:
                    break;
            }
        }
        
        // Update RGB values with a single state update to prevent loops
        setRgbValues({ red: newRed, green: newGreen, blue: newBlue });
        
        // Calculate new CMYK values
        const newBlack = Math.round((newRed + newGreen + newBlue) / 3);
        const newYellow = Math.round(newRed + (newGreen - newRed) / 2);
        const newCyan = Math.round(newGreen + (newBlue - newGreen) / 2);
        const newMagenta = Math.round(newRed + (newBlue - newRed) / 2);
        
        // Update CMYK in a single batch
        setCmykValues({
            cyan: newCyan,
            magenta: newMagenta,
            yellow: newYellow,
            black: newBlack
        });
        
        // Update the actual color
        updateColor(newRed, newGreen, newBlue);
        
        // Use timeout to update palette only after slider change completes
        clearTimeout(sliderTimeout.current);
        sliderTimeout.current = setTimeout(() => {
            isSliderChanging.current = false;
            
            // Now it's safe to notify parent components
            if (selectedShapeIndex === -1) {
                if (onBackgroundChange) {
                    onBackgroundChange(`rgb(${newRed},${newGreen},${newBlue})`);
                }
            } else {
                if (onPaletteChange) {
                    // Notify parent about palette changes after slider stops
                    const updatedColors = [...currentColors];
                    onPaletteChange(updatedColors.slice(0, 5));
                }
            }
        }, 50); // Small timeout to batch updates
    };
    
    // Draw SVG on canvas - Keep minimal dependencies
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !shapesData || shapesData.length === 0) return;
        
        const ctx = canvas.getContext('2d');
        
        // Log all shape data for debugging
        shapesData.forEach((shape, i) => {
            console.log(`Shape #${i}: (${shape.x}, ${shape.y}) [${shape.width}×${shape.height}] Color: ${shape.color || currentColors[i] || 'unspecified'}`);
        });
        
        // Find the SVG dimensions
        const maxX = Math.max(...shapesData.map(shape => shape.x + shape.width));
        const maxY = Math.max(...shapesData.map(shape => shape.y + shape.height));
        const minX = Math.min(...shapesData.map(shape => shape.x));
        const minY = Math.min(...shapesData.map(shape => shape.y));
        
        // Calculate total dimensions with padding
        const padding = 40; // Padding for better visibility
        const svgWidth = maxX - minX;
        const svgHeight = maxY - minY;
        const canvasWidth = svgWidth + (padding * 2);
        const canvasHeight = svgHeight + (padding * 2);
        
        // Get available screen space (between header and footer)
        const headerHeight = 90; // Account for header
        const footerHeight = 40; // Approximate footer height
        const windowWidth = window.innerWidth; 
        const windowHeight = window.innerHeight - headerHeight - footerHeight + 100; // Added 100px to increase height
        
        // Fill the entire available width, maintaining aspect ratio
        const scaleX = windowWidth / canvasWidth;
        const scaleY = windowHeight / canvasHeight;
        const scale = Math.min(scaleX, scaleY); // Use entire available space
        
        // Set visible canvas size to fill the width and extended height
        const displayWidth = windowWidth;
        const displayHeight = windowHeight;
        
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;
        
        // Set internal canvas resolution (high resolution for sharp rendering)
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = displayWidth * devicePixelRatio;
        canvas.height = displayHeight * devicePixelRatio;
        
        // Calculate the offset to center the content in the canvas
        // Center horizontally
        const horizontalCenterOffset = (windowWidth / scale - svgWidth) / 2;
        const offsetX = horizontalCenterOffset - minX;
        
        // Center vertically - with proper placement
        const verticalCenterOffset = (windowHeight / scale - svgHeight) / 2;
        const offsetY = verticalCenterOffset - minY;
        
        // Save these values for click handling
        canvas._scale = scale;
        canvas._devicePixelRatio = devicePixelRatio;
        canvas._offsetX = offsetX;
        canvas._offsetY = offsetY;
        canvas._minX = minX;
        canvas._minY = minY;
        canvas._svgWidth = svgWidth;
        canvas._svgHeight = svgHeight;
        
        // Apply scaling for high-resolution rendering
        ctx.scale(devicePixelRatio * scale, devicePixelRatio * scale);
        
        // Clear canvas with background color
        ctx.fillStyle = currentBgColor;
        ctx.fillRect(0, 0, canvas.width / (devicePixelRatio * scale), canvas.height / (devicePixelRatio * scale));
        
        // Enable antialiasing for sharper rendering
        ctx.imageSmoothingEnabled = false;
        
        // Draw shapes at their exact positions with offset applied
        shapesData.forEach((shape, index) => {
            // Determine the color to use for this shape
            let shapeColor;
            
            // Use currentColors array if available (color edited by user)
            if (index < currentColors.length && currentColors[index]) {
                shapeColor = currentColors[index];
            } 
            // Otherwise use the original color from the SVG
            else if (shape.color) {
                shapeColor = shape.color;
            }
            // Last resort fallback
            else {
                shapeColor = 'rgb(200,200,200)';
            }
            
            // Apply reduced opacity if this is the active shape
            if (activeShape === index) {
                // Convert RGB to RGBA with 30% opacity
                if (shapeColor.startsWith('rgb(')) {
                    // If it's already RGB format, convert to RGBA
                    shapeColor = shapeColor.replace('rgb(', 'rgba(').replace(')', ', 0.3)');
                } else {
                    // If it's a hex color, parse and convert to RGBA
                    const { r, g, b } = parseRgb(shapeColor);
                    shapeColor = `rgba(${r}, ${g}, ${b}, 0.3)`;
                }
            }
            
            ctx.fillStyle = shapeColor;
            
            // Calculate position with offset to properly center in the canvas
            // Add a small overlap to prevent hairline gaps (0.5px overlap)
            const x = Math.floor(shape.x + offsetX);
            const y = Math.floor(shape.y + offsetY);
            const width = Math.ceil(shape.width) + 1; // Add 1px to ensure no gaps
            const height = Math.ceil(shape.height) + 1; // Add 1px to ensure no gaps
            
            // Draw the rectangle with exact dimensions from the SVG
            ctx.fillRect(x, y, width, height);
        });
    // Add activeShape to dependencies to redraw when it changes
    }, [currentBgColor, currentColors, activeShape]);
    
    // Handle mousedown on the canvas
    const handleCanvasMouseDown = (e) => {
        const canvas = canvasRef.current;
        if (!canvas || !shapesData) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Get click coordinates in canvas space
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Convert to SVG coordinates
        const canvasX = clickX / canvas._scale;
        const canvasY = clickY / canvas._scale;
        
        // Undo the offset to get original SVG coordinates
        const svgX = canvasX - canvas._offsetX;
        const svgY = canvasY - canvas._offsetY;
        
        // Check if we clicked on a shape
        // Check in reverse order to handle overlaps (top shapes are later in the array)
        for (let i = shapesData.length - 1; i >= 0; i--) {
            const shape = shapesData[i];
            
            if (
                svgX >= shape.x && 
                svgX <= shape.x + shape.width &&
                svgY >= shape.y &&
                svgY <= shape.y + shape.height
            ) {
                // Set this shape as active for opacity change
                setActiveShape(i);
                break;
            }
        }
    };
    
    // Handle mouseup to reset opacity
    const handleCanvasMouseUp = () => {
        setActiveShape(null);
    };
    
    // Handle mouseout to reset opacity when cursor leaves canvas
    const handleCanvasMouseOut = () => {
        setActiveShape(null);
    };
    
    // Handle mouse move to prevent issues with shapes getting "stuck" in active state
    const handleCanvasMouseMove = (e) => {
        // Only check if we have an active shape
        if (activeShape !== null) {
            const canvas = canvasRef.current;
            if (!canvas || !shapesData) return;
            
            const rect = canvas.getBoundingClientRect();
            
            // If mouse is outside canvas bounds, reset active shape
            if (
                e.clientX < rect.left || 
                e.clientX > rect.right || 
                e.clientY < rect.top || 
                e.clientY > rect.bottom
            ) {
                setActiveShape(null);
            }
        }
    };
    
    // Handle clicks on the canvas - modify to work with mousedown/mouseup events
    const handleCanvasClick = (e) => {
        const canvas = canvasRef.current;
        if (!canvas || !shapesData) return;
        
        const rect = canvas.getBoundingClientRect();
        
        // Get click coordinates in canvas space
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Convert to SVG coordinates
        const canvasX = clickX / canvas._scale;
        const canvasY = clickY / canvas._scale;
        
        // Undo the offset to get original SVG coordinates
        const svgX = canvasX - canvas._offsetX;
        const svgY = canvasY - canvas._offsetY;
        
        // Check if we clicked on a shape
        let clickedOnShape = false;
        
        // Check in reverse order to handle overlaps (top shapes are later in the array)
        for (let i = shapesData.length - 1; i >= 0; i--) {
            const shape = shapesData[i];
            
            if (
                svgX >= shape.x && 
                svgX <= shape.x + shape.width &&
                svgY >= shape.y &&
                svgY <= shape.y + shape.height
            ) {
                // Select this shape and update the color slider values
                if (isShiftPressed && selectedShapeIndex !== -1) {
                    // If shift is pressed, add to selection
                    setSelectedShapeIndex(prev => {
                        // Ensure we don't lose the previous selection
                        if (Array.isArray(prev)) {
                            // If the clicked shape is already selected, remove it from the selection
                            if (prev.includes(i)) {
                                return prev.filter(index => index !== i);
                            } else {
                                // Otherwise, add the new selection
                                return [...prev, i];
                            }
                        } else {
                            // First selection with shift, create an array
                            return [prev, i];
                        }
                    });
                } else {
                    // Regular selection (without shift)
                    setSelectedShapeIndex(i);
                    
                    // Update sliders based on this shape's color immediately
                    const shapeColor = currentColors[i];
                    if (shapeColor) {
                        updateSlidersFromColor(shapeColor);
                    }
                }
                
                clickedOnShape = true;
                break;
            }
        }
        
        // If no shape was clicked, select the background
        if (!clickedOnShape) {
            setSelectedShapeIndex(-1);
            
            // Update sliders based on background color immediately
            updateSlidersFromColor(currentBgColor);
        }
    };
    
    // Get RGB as hex color
    const rgbToHex = (r, g, b) => {
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
    };
    
    // Extract RGB values for use in the UI
    const { red, green, blue } = rgbValues;
    const { cyan, magenta, yellow, black } = cmykValues;
    
    return (
        <div className="flex flex-col items-center w-full h-full">
            <div className="relative w-full h-full flex items-center justify-center" style={{ marginBottom: "50px" }}>
                <canvas 
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseOut={handleCanvasMouseOut}
                    onMouseMove={handleCanvasMouseMove}
                    className="w-full h-full"
                    style={{ 
                        cursor: 'pointer',
                        boxShadow: 'none'
                    }}
                />
                
                {/* Color Control Panel - Bottom Right - Updated to match ColorControllerUI */}
                <div className="flex flex-col justify-center bg-background pt-10 rounded-2xl fixed scale-75 bottom-5 right-0 lg:right-0 lg:scale-90 lg:bottom-9" 
                    style={{ 
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                        overflow: 'hidden',
                        margin: '0 0px 0px 0',
                        bottom: '30px',
                        right: '0px',
                        zIndex: 50
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
                                    `#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1).toUpperCase()}`
                                }
                            </h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Ensure this is exported as a default export
export default DirectSVGImporter;