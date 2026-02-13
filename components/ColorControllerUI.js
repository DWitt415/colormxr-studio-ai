'use client'
import { useEffect, useRef, useState } from 'react';
import ColorSlider from './ColorSlider';
import GridLayout from './layouts/GridLayout';
import CosmicLayout from './layouts/CosmicLayout';
import RadiantLayout from './layouts/RadiantLayout';
import SVGLayout from './layouts/SVGLayout';

/* ------------------- Modular Color Controller UI ------------------- */
/* Supports multiple layout modes: grid, cosmic, radiant, svg */

const ColorControllerUI = (props) => {
    console.log('All props received:', Object.keys(props));

    const {
        // Layout configuration
        layoutMode = 'grid', // 'grid' | 'cosmic' | 'radiant' | 'svg'
        row,
        col,
        width,
        height,
        hSpace,
        vSpace,
        fillArea = false, // For radiant layout: fill entire area like pie slices
        svgPath,
        svgContent,

        // Color configuration
        bgColor = 'rgb(255,255,255)',
        initShapeColors,

        // Callbacks
        onPaletteChange,
        onBackgroundChange,
        onShapeColorsChange,
        onInstructionClose,

        // Display options
        hidePalette,
        showPalette,
        showPanels = true  // New prop to toggle all panels
    } = props;

    // For backward compatibility: if showPalette is defined, it overrides hidePalette
    const shouldHidePalette = showPalette !== undefined ? !showPalette : (hidePalette === true);

    // ===== COLOR STATE =====
    const [red, setRed] = useState(0);
    const [green, setGreen] = useState(0);
    const [blue, setBlue] = useState(0);
    const [black, setBlack] = useState(0);
    const [yellow, setYellow] = useState(0);
    const [cyan, setCyan] = useState(0);
    const [magenta, setMagenta] = useState(0);
    const [isAPressed, setIsAPressed] = useState(false);
    const [isRPressed, setIsRPressed] = useState(false);

    // Store ratios for secondary sliders in relative mode
    const [yellowRatio, setYellowRatio] = useState(null); // Ratio of red:green
    const [cyanRatio, setCyanRatio] = useState(null); // Ratio of green:blue
    const [magentaRatio, setMagentaRatio] = useState(null); // Ratio of red:blue

    const outputColorCode = `rgb(${red},${green},${blue})`;

    // ===== SELECTION STATE =====
    const [selectedShape, setSelectedShape] = useState(null);
    const [activeShape, setActiveShape] = useState(null);
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    const [lastShiftClickedShape, setLastShiftClickedShape] = useState(null);
    const [lastShiftClickedBackground, setLastShiftClickedBackground] = useState(false);

    // ===== PALETTE STATE =====
    const [currentPaletteColor, setCurrentPaletteColor] = useState(null);
    const [activePaletteIndex, setActivePaletteIndex] = useState(null);
    const [paletteLinkedShapes, setPaletteLinkedShapes] = useState({});
    const [colorPalette, setColorPalette] = useState([
        '#D9D9D9', '#D9D9D9', '#D9D9D9', '#D9D9D9', '#D9D9D9'
    ]);
    const [isPickerHovered, setIsPickerHovered] = useState(false);

    // ===== SHAPE COLORS STATE =====
    const initColor = 'rgb(0,0,0)';
    const [svgShapeCount, setSvgShapeCount] = useState(0);
    const [svgInitialColors, setSvgInitialColors] = useState([]);
    const [loadedSvgContent, setLoadedSvgContent] = useState(null); // Store loaded SVG content for export

    // Calculate number of shapes based on layout mode
    let shapeNum;
    if (layoutMode === 'cosmic' || layoutMode === 'radiant') {
        shapeNum = col || 0; // Cosmic and radiant use col for shape count
    } else if (layoutMode === 'svg') {
        shapeNum = svgShapeCount; // For SVG, use the loaded shape count
    } else {
        shapeNum = (row || 0) * (col || 0); // Grid uses row * col
    }

    const [shapeColors, setShapeColors] = useState(
        Array.from({ length: Math.max(shapeNum, 1) }, (_, i) =>
            initShapeColors ? initShapeColors[i % initShapeColors.length] : initColor
        )
    );

    // Load SVG and extract shape colors when in SVG mode
    useEffect(() => {
        if (layoutMode !== 'svg' || !svgPath) return;

        const loadSVGShapes = async () => {
            try {
                console.log('🔄 Loading SVG to count shapes and extract colors:', svgPath);
                const response = await fetch(svgPath);
                if (!response.ok) {
                    throw new Error(`Failed to fetch SVG: ${response.status}`);
                }

                const svgText = await response.text();
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const svgElement = svgDoc.documentElement;

                // Store the loaded SVG content for export
                setLoadedSvgContent(svgText);

                // Find all colorable elements
                const colorableElements = svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, polyline');
                const count = colorableElements.length;

                console.log(`✅ Found ${count} shapes in SVG`);

                // Extract original fill colors
                const colors = Array.from(colorableElements).map((element, index) => {
                    const fill = element.getAttribute('fill') || 'rgb(0,0,0)';
                    console.log(`  Shape ${index}: ${fill}`);
                    return fill;
                });

                setSvgShapeCount(count);
                setSvgInitialColors(colors);

                // Only initialize shapeColors with SVG colors if initShapeColors wasn't provided
                // (i.e., this is a new composition, not loaded from gallery)
                if (!initShapeColors || initShapeColors.length === 0) {
                    console.log('🎨 Initializing with SVG default colors');
                    setShapeColors(colors);
                } else {
                    console.log('🎨 Keeping loaded colors from initShapeColors, not overriding with SVG defaults');
                }

            } catch (error) {
                console.error('❌ Error loading SVG shapes:', error);
            }
        };

        loadSVGShapes();
    }, [layoutMode, svgPath]);

    // Re-initialize shapeColors when SVG shape count changes
    useEffect(() => {
        if (layoutMode === 'svg' && svgShapeCount > 0 && initShapeColors && initShapeColors.length >= svgShapeCount) {
            console.log(`🔄 Re-initializing shapeColors for SVG: ${svgShapeCount} shapes, ${initShapeColors.length} init colors`);
            setShapeColors(initShapeColors.slice(0, svgShapeCount));
        }
    }, [layoutMode, svgShapeCount, initShapeColors]);

    // ===== BACKGROUND STATE =====
    const backgroundShape = useRef(null);
    const [backgroundColor, setBackgroundColor] = useState(bgColor);

    // Sync backgroundColor with bgColor prop
    useEffect(() => {
        setBackgroundColor(bgColor);
    }, [bgColor]);

    // ===== RGB TO CMY CONVERSION =====
    const rgbToCmy = (r, g, b) => {
        const clamp = (value) => Math.min(255, Math.max(0, value));
        r = clamp(r);
        g = clamp(g);
        b = clamp(b);

        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        const c = Math.round((1 - rNorm) * 100);
        const m = Math.round((1 - gNorm) * 100);
        const y = Math.round((1 - bNorm) * 100);

        return { c, m, y };
    };

    // ===== DERIVED COLOR VALUES UPDATE =====
    useEffect(() => {
        const newBlack = Math.round((red + green + blue) / 3);
        const newYellow = Math.round(red + (green - red) / 2);
        const newCyan = Math.round(green + (blue - green) / 2);
        const newMagenta = Math.round(red + (blue - red) / 2);

        if (newBlack !== black) setBlack(newBlack);
        if (newYellow !== yellow) setYellow(newYellow);
        if (newCyan !== cyan) setCyan(newCyan);
        if (newMagenta !== magenta) setMagenta(newMagenta);
    }, [red, green, blue]);

    // ===== KEYBOARD EVENT LISTENERS =====
    // A-key for absolute slider positioning mode
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'a' || event.key === 'A') setIsAPressed(true);
        };
        const handleKeyUp = (event) => {
            if (event.key === 'a' || event.key === 'A') setIsAPressed(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // R-key for relative slider positioning mode
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'r' || event.key === 'R') setIsRPressed(true);
        };
        const handleKeyUp = (event) => {
            if (event.key === 'r' || event.key === 'R') setIsRPressed(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Shift-key for group selection
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Shift') setIsShiftPressed(true);
        };
        const handleKeyUp = (event) => {
            if (event.key === 'Shift') setIsShiftPressed(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Disable right-click context menu
    useEffect(() => {
        const disableContextMenu = (event) => event.preventDefault();
        document.addEventListener('contextmenu', disableContextMenu);
        return () => document.removeEventListener('contextmenu', disableContextMenu);
    }, []);

    // ===== COLOR PERSISTENCE =====
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const { cleanupOldColorData } = require('@/utils/navigation');
            cleanupOldColorData();

            const returningFromGallery = sessionStorage.getItem('returningFromGallery');
            const exercisePath = window.location.pathname;

            console.log('🔍 Color persistence check:', {
                returningFromGallery,
                exercisePath,
                shapeNum
            });

            if (returningFromGallery === 'true') {
                console.log('🎨 Restoring colors for:', exercisePath);
                const storageKey = `colormxr_colors_${exercisePath}`;
                const storedColors = localStorage.getItem(storageKey);

                console.log('🔑 Storage key:', storageKey);
                console.log('📦 Stored data:', storedColors);

                if (storedColors) {
                    try {
                        const parsedColors = JSON.parse(storedColors);
                        console.log('🔄 Parsed colors:', parsedColors);

                        if (parsedColors.shapeColors && Array.isArray(parsedColors.shapeColors)) {
                            console.log('✅ Restoring shape colors:', parsedColors.shapeColors.length, 'colors');
                            if (parsedColors.shapeColors.length === shapeNum) {
                                setShapeColors(parsedColors.shapeColors);
                            } else {
                                console.warn('⚠️ Shape count mismatch:', parsedColors.shapeColors.length, 'vs', shapeNum);
                            }
                        }

                        if (parsedColors.backgroundColor) {
                            console.log('✅ Restoring background color:', parsedColors.backgroundColor);
                            setBackgroundColor(parsedColors.backgroundColor);
                        }

                        if (parsedColors.colorPalette && Array.isArray(parsedColors.colorPalette)) {
                            console.log('✅ Restoring palette:', parsedColors.colorPalette);
                            setColorPalette(parsedColors.colorPalette);
                        }

                        if (parsedColors.paletteLinkedShapes) {
                            console.log('✅ Restoring palette linked shapes:', parsedColors.paletteLinkedShapes);
                            setPaletteLinkedShapes(parsedColors.paletteLinkedShapes);
                        }

                        // Clear the flag after restoration
                        sessionStorage.removeItem('returningFromGallery');
                    } catch (error) {
                        console.error('❌ Error parsing stored colors:', error);
                        localStorage.removeItem(storageKey);
                    }
                } else {
                    console.log('ℹ️ No stored colors found for key:', storageKey);
                }
            }
        }
    }, [shapeNum]);

    // Store colors when they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const exercisePath = window.location.pathname;

            // Store colors for exercises AND shapeset-creator
            if (exercisePath.includes('/exercise/') || exercisePath.includes('/shapeset-creator')) {
                const colorsToStore = {
                    shapeColors,
                    backgroundColor,
                    colorPalette,
                    paletteLinkedShapes,
                    timestamp: Date.now()
                };

                try {
                    localStorage.setItem(`colormxr_colors_${exercisePath}`, JSON.stringify(colorsToStore));
                    console.log('💾 Stored colors for:', exercisePath);
                } catch (error) {
                    console.error('Error storing colors:', error);
                }
            }
        }
    }, [shapeColors, backgroundColor, colorPalette, paletteLinkedShapes]);

    // Make colors available globally for ExerciseIconsPanel
    useEffect(() => {
        if (typeof window !== 'undefined') {
            console.log('🔧 Setting window.getCurrentColors with svgPath:', svgPath);
            console.log('🔧 svgContent prop:', svgContent ? 'provided' : 'null');
            console.log('🔧 loadedSvgContent:', loadedSvgContent ? `${loadedSvgContent.length} chars` : 'null');

            window.getCurrentColors = () => ({
                shapeColors,
                backgroundColor,
                colorPalette,
                // Layout information for export
                layoutMode,
                row,
                col,
                width,
                height,
                hSpace,
                vSpace,
                // SVG-specific data (use loaded content if svgContent prop not provided)
                svgPath,
                svgContent: svgContent || loadedSvgContent
            });

            // Expose function to apply color to selected shape(s) - for image color picker
            window.applyColorToSelectedShape = (color) => {
                console.log('🎨 Applying color to selected shape:', color, 'selectedShape:', selectedShape);

                if (selectedShape === null || selectedShape === 'background') {
                    console.log('⚠️ No shape selected or background selected');
                    return;
                }

                const newShapeColors = [...shapeColors];

                if (Array.isArray(selectedShape)) {
                    // Apply to multiple shapes
                    selectedShape.forEach(index => {
                        newShapeColors[index] = color;
                    });
                } else {
                    // Apply to single shape
                    newShapeColors[selectedShape] = color;
                }

                setShapeColors(newShapeColors);
                updateSlidersFromColor(color);
            };

            // Expose function to get selected shape info
            window.getSelectedShape = () => selectedShape;
        }

        return () => {
            if (typeof window !== 'undefined') {
                delete window.getCurrentColors;
                delete window.applyColorToSelectedShape;
                delete window.getSelectedShape;
            }
        };
    }, [shapeColors, backgroundColor, colorPalette, layoutMode, row, col, width, height, hSpace, vSpace, svgPath, svgContent, loadedSvgContent, selectedShape]);

    // ===== PARENT COMPONENT NOTIFICATIONS =====
    useEffect(() => {
        if (onBackgroundChange && typeof onBackgroundChange === 'function') {
            onBackgroundChange(backgroundColor);
        }
    }, [backgroundColor, onBackgroundChange]);

    useEffect(() => {
        if (onShapeColorsChange && typeof onShapeColorsChange === 'function') {
            onShapeColorsChange(shapeColors);
        }
    }, [shapeColors, onShapeColorsChange]);

    useEffect(() => {
        if (onPaletteChange && typeof onPaletteChange === 'function') {
            onPaletteChange(colorPalette);
        }
    }, [colorPalette, onPaletteChange]);

    // ===== SLIDER CHANGE HANDLER =====
    const handleSliderChange = (color, value) => {
        let newRed = red;
        let newGreen = green;
        let newBlue = blue;

        if (isAPressed) {
            // A-key mode: absolute positioning - adjust all channels by same delta
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
            }
        } else if (isRPressed) {
            // R-key mode: relative positioning - all channels reach 255 or 0 at same time
            switch (color) {
                case 'Red':
                    if (value > red) {
                        // Tinting - moving towards 255
                        const distanceToWhiteRed = 255 - red;
                        const distanceToWhiteGreen = 255 - green;
                        const distanceToWhiteBlue = 255 - blue;

                        if (distanceToWhiteRed > 0) {
                            const redRatio = (value - red) / distanceToWhiteRed;
                            newRed = value;
                            newGreen = Math.min(green + (distanceToWhiteGreen * redRatio), 255);
                            newBlue = Math.min(blue + (distanceToWhiteBlue * redRatio), 255);
                        }
                    } else {
                        // Shading - moving towards 0
                        if (red > 0) {
                            const redRatio = (red - value) / red;
                            newRed = value;
                            newGreen = Math.max(green - (green * redRatio), 0);
                            newBlue = Math.max(blue - (blue * redRatio), 0);
                        }
                    }
                    break;
                case 'Green':
                    if (value > green) {
                        // Tinting - moving towards 255
                        const distanceToWhiteRed = 255 - red;
                        const distanceToWhiteGreen = 255 - green;
                        const distanceToWhiteBlue = 255 - blue;

                        if (distanceToWhiteGreen > 0) {
                            const greenRatio = (value - green) / distanceToWhiteGreen;
                            newRed = Math.min(red + (distanceToWhiteRed * greenRatio), 255);
                            newGreen = value;
                            newBlue = Math.min(blue + (distanceToWhiteBlue * greenRatio), 255);
                        }
                    } else {
                        // Shading - moving towards 0
                        if (green > 0) {
                            const greenRatio = (green - value) / green;
                            newRed = Math.max(red - (red * greenRatio), 0);
                            newGreen = value;
                            newBlue = Math.max(blue - (blue * greenRatio), 0);
                        }
                    }
                    break;
                case 'Blue':
                    if (value > blue) {
                        // Tinting - moving towards 255
                        const distanceToWhiteRed = 255 - red;
                        const distanceToWhiteGreen = 255 - green;
                        const distanceToWhiteBlue = 255 - blue;

                        if (distanceToWhiteBlue > 0) {
                            const blueRatio = (value - blue) / distanceToWhiteBlue;
                            newRed = Math.min(red + (distanceToWhiteRed * blueRatio), 255);
                            newGreen = Math.min(green + (distanceToWhiteGreen * blueRatio), 255);
                            newBlue = value;
                        }
                    } else {
                        // Shading - moving towards 0
                        if (blue > 0) {
                            const blueRatio = (blue - value) / blue;
                            newRed = Math.max(red - (red * blueRatio), 0);
                            newGreen = Math.max(green - (green * blueRatio), 0);
                            newBlue = value;
                        }
                    }
                    break;
                case 'Yellow':
                    // Yellow affects Red and Green proportionally
                    if (value > yellow) {
                        // Tinting - moving towards 255
                        // Capture the starting values when first moving up
                        if (yellowRatio === null) {
                            setYellowRatio({ startRed: red, startGreen: green, startYellow: yellow });
                        }

                        const distanceToWhiteRed = 255 - red;
                        const distanceToWhiteGreen = 255 - green;
                        const maxDistance = Math.max(distanceToWhiteRed, distanceToWhiteGreen);

                        if (maxDistance > 0) {
                            const ratio = (value - yellow) / maxDistance;
                            newRed = Math.min(red + (distanceToWhiteRed * ratio), 255);
                            newGreen = Math.min(green + (distanceToWhiteGreen * ratio), 255);
                        }
                    } else {
                        // Shading - moving towards 0
                        if (yellowRatio !== null) {
                            // Interpolate between 255,255 (at top) and starting values (at start position)
                            // The slider value represents where we are between startYellow and 255
                            const startY = yellowRatio.startYellow;
                            const currentY = value;

                            // Map slider position to interpolation between start and 255
                            if (currentY >= startY) {
                                // Between starting point and 255
                                const progress = (currentY - startY) / (255 - startY);
                                newRed = yellowRatio.startRed + (255 - yellowRatio.startRed) * progress;
                                newGreen = yellowRatio.startGreen + (255 - yellowRatio.startGreen) * progress;
                            } else {
                                // Below starting point - continue proportionally toward 0
                                const progress = currentY / startY;
                                newRed = yellowRatio.startRed * progress;
                                newGreen = yellowRatio.startGreen * progress;
                            }
                        } else {
                            // No stored ratio, use current proportions
                            const maxChannel = Math.max(red, green);
                            if (maxChannel > 0) {
                                const ratio = (yellow - value) / maxChannel;
                                newRed = Math.max(red - (red * ratio), 0);
                                newGreen = Math.max(green - (green * ratio), 0);
                            }
                        }

                        // Reset ratio when we reach the bottom
                        if (value === 0 || (newRed === 0 && newGreen === 0)) {
                            setYellowRatio(null);
                        }
                    }
                    break;
                case 'Cyan':
                    // Cyan affects Green and Blue proportionally
                    if (value > cyan) {
                        // Tinting - moving towards 255
                        // Capture the starting values when first moving up
                        if (cyanRatio === null) {
                            setCyanRatio({ startGreen: green, startBlue: blue, startCyan: cyan });
                        }

                        const distanceToWhiteGreen = 255 - green;
                        const distanceToWhiteBlue = 255 - blue;
                        const maxDistance = Math.max(distanceToWhiteGreen, distanceToWhiteBlue);

                        if (maxDistance > 0) {
                            const ratio = (value - cyan) / maxDistance;
                            newGreen = Math.min(green + (distanceToWhiteGreen * ratio), 255);
                            newBlue = Math.min(blue + (distanceToWhiteBlue * ratio), 255);
                        }
                    } else {
                        // Shading - moving towards 0
                        if (cyanRatio !== null) {
                            // Interpolate between 255,255 (at top) and starting values (at start position)
                            const startC = cyanRatio.startCyan;
                            const currentC = value;

                            // Map slider position to interpolation between start and 255
                            if (currentC >= startC) {
                                // Between starting point and 255
                                const progress = (currentC - startC) / (255 - startC);
                                newGreen = cyanRatio.startGreen + (255 - cyanRatio.startGreen) * progress;
                                newBlue = cyanRatio.startBlue + (255 - cyanRatio.startBlue) * progress;
                            } else {
                                // Below starting point - continue proportionally toward 0
                                const progress = currentC / startC;
                                newGreen = cyanRatio.startGreen * progress;
                                newBlue = cyanRatio.startBlue * progress;
                            }
                        } else {
                            // No stored ratio, use current proportions
                            const maxChannel = Math.max(green, blue);
                            if (maxChannel > 0) {
                                const ratio = (cyan - value) / maxChannel;
                                newGreen = Math.max(green - (green * ratio), 0);
                                newBlue = Math.max(blue - (blue * ratio), 0);
                            }
                        }

                        // Reset ratio when we reach the bottom
                        if (value === 0 || (newGreen === 0 && newBlue === 0)) {
                            setCyanRatio(null);
                        }
                    }
                    break;
                case 'Magenta':
                    // Magenta affects Red and Blue proportionally
                    if (value > magenta) {
                        // Tinting - moving towards 255
                        // Capture the starting values when first moving up
                        if (magentaRatio === null) {
                            setMagentaRatio({ startRed: red, startBlue: blue, startMagenta: magenta });
                        }

                        const distanceToWhiteRed = 255 - red;
                        const distanceToWhiteBlue = 255 - blue;
                        const maxDistance = Math.max(distanceToWhiteRed, distanceToWhiteBlue);

                        if (maxDistance > 0) {
                            const ratio = (value - magenta) / maxDistance;
                            newRed = Math.min(red + (distanceToWhiteRed * ratio), 255);
                            newBlue = Math.min(blue + (distanceToWhiteBlue * ratio), 255);
                        }
                    } else {
                        // Shading - moving towards 0
                        if (magentaRatio !== null) {
                            // Interpolate between 255,255 (at top) and starting values (at start position)
                            const startM = magentaRatio.startMagenta;
                            const currentM = value;

                            // Map slider position to interpolation between start and 255
                            if (currentM >= startM) {
                                // Between starting point and 255
                                const progress = (currentM - startM) / (255 - startM);
                                newRed = magentaRatio.startRed + (255 - magentaRatio.startRed) * progress;
                                newBlue = magentaRatio.startBlue + (255 - magentaRatio.startBlue) * progress;
                            } else {
                                // Below starting point - continue proportionally toward 0
                                const progress = currentM / startM;
                                newRed = magentaRatio.startRed * progress;
                                newBlue = magentaRatio.startBlue * progress;
                            }
                        } else {
                            // No stored ratio, use current proportions
                            const maxChannel = Math.max(red, blue);
                            if (maxChannel > 0) {
                                const ratio = (magenta - value) / maxChannel;
                                newRed = Math.max(red - (red * ratio), 0);
                                newBlue = Math.max(blue - (blue * ratio), 0);
                            }
                        }

                        // Reset ratio when we reach the bottom
                        if (value === 0 || (newRed === 0 && newBlue === 0)) {
                            setMagentaRatio(null);
                        }
                    }
                    break;
            }
        } else {
            // Normal slider behavior
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
                    newRed = value;
                    newGreen = value;
                    newBlue = value;
                    break;
                case 'Yellow':
                    if (value > yellow) {
                        if (green > red) {
                            newGreen = Math.min(green + (value - yellow), 255);
                            newRed = Math.min(red + (value - yellow), 255);
                        } else {
                            newRed = Math.min(red + (value - yellow), 255);
                            newGreen = Math.min(green + (value - yellow), 255);
                        }
                    } else {
                        if (green < red) {
                            newGreen = Math.max(green - (yellow - value), 0);
                            newRed = Math.max(red - (yellow - value), 0);
                        } else {
                            newRed = Math.max(red - (yellow - value), 0);
                            newGreen = Math.max(green - (yellow - value), 0);
                        }
                    }
                    break;
                case 'Cyan':
                    if (value > cyan) {
                        if (green > blue) {
                            newGreen = Math.min(green + (value - cyan), 255);
                            newBlue = Math.min(blue + (value - cyan), 255);
                        } else {
                            newBlue = Math.min(blue + (value - cyan), 255);
                            newGreen = Math.min(green + (value - cyan), 255);
                        }
                    } else {
                        if (green < blue) {
                            newGreen = Math.max(green - (cyan - value), 0);
                            newBlue = Math.max(blue - (cyan - value), 0);
                        } else {
                            newBlue = Math.max(blue - (cyan - value), 0);
                            newGreen = Math.max(green - (cyan - value), 0);
                        }
                    }
                    break;
                case 'Magenta':
                    if (value > magenta) {
                        if (red > blue) {
                            newRed = Math.min(red + (value - magenta), 255);
                            newBlue = Math.min(blue + (value - magenta), 255);
                        } else {
                            newBlue = Math.min(blue + (value - magenta), 255);
                            newRed = Math.min(red + (value - magenta), 255);
                        }
                    } else {
                        if (red < blue) {
                            newRed = Math.max(red - (magenta - value), 0);
                            newBlue = Math.max(blue - (magenta - value), 0);
                        } else {
                            newBlue = Math.max(blue - (magenta - value), 0);
                            newRed = Math.max(red - (magenta - value), 0);
                        }
                    }
                    break;
            }
        }

        if (newRed !== red) setRed(Math.round(newRed));
        if (newGreen !== green) setGreen(Math.round(newGreen));
        if (newBlue !== blue) setBlue(Math.round(newBlue));
    };

    // ===== COLOR UPDATE UTILITIES =====
    const updateSlidersFromColor = (colorString) => {
        console.log('🎚️ updateSlidersFromColor called with:', colorString);
        if (!colorString) return;

        let r, g, b;

        if (colorString.startsWith('#')) {
            r = parseInt(colorString.slice(1, 3), 16);
            g = parseInt(colorString.slice(3, 5), 16);
            b = parseInt(colorString.slice(5, 7), 16);
        } else if (colorString.startsWith('rgb')) {
            const match = colorString.match(/\d+/g);
            if (match && match.length >= 3) {
                r = parseInt(match[0]);
                g = parseInt(match[1]);
                b = parseInt(match[2]);
            } else {
                return;
            }
        } else {
            return;
        }

        setRed(r);
        setGreen(g);
        setBlue(b);
    };

    const areSelectionsEqual = (selection1, selection2) => {
        if (typeof selection1 !== typeof selection2) return false;
        if (selection1 === selection2) return true;

        if (Array.isArray(selection1) && Array.isArray(selection2)) {
            if (selection1.length !== selection2.length) return false;
            const sorted1 = [...selection1].sort();
            const sorted2 = [...selection2].sort();
            return sorted1.every((val, i) => val === sorted2[i]);
        }

        return false;
    };

    // ===== COLOR CHANGE HANDLER =====
    const handleColorChange = (color) => {
        if (selectedShape !== null && selectedShape !== 'background') {
            const newShapeColors = [...shapeColors];

            if (Array.isArray(selectedShape)) {
                selectedShape.forEach((index) => {
                    newShapeColors[index] = color;
                });

                if (lastShiftClickedBackground && lastShiftClickedShape) {
                    if (Array.isArray(lastShiftClickedShape)) {
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

                Object.entries(paletteLinkedShapes).forEach(([paletteIndex, linkedShape]) => {
                    const palIndex = parseInt(paletteIndex);
                    if (areSelectionsEqual(linkedShape, selectedShape)) {
                        if (color.startsWith('rgb')) {
                            const rgbValues = color.match(/\d+/g);
                            if (rgbValues && rgbValues.length === 3) {
                                const [r, g, b] = rgbValues.map(Number);
                                const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

                                const newPalette = [...colorPalette];
                                newPalette[palIndex] = hexColor;
                                setColorPalette(newPalette);

                                if (activePaletteIndex === palIndex) {
                                    setCurrentPaletteColor(color);
                                }
                            }
                        }
                    }
                });
            } else {
                newShapeColors[selectedShape] = color;

                if (lastShiftClickedBackground && lastShiftClickedShape === selectedShape) {
                    setBackgroundColor(color);
                }

                Object.entries(paletteLinkedShapes).forEach(([paletteIndex, linkedShape]) => {
                    const palIndex = parseInt(paletteIndex);
                    if (linkedShape === selectedShape) {
                        if (color.startsWith('rgb')) {
                            const rgbValues = color.match(/\d+/g);
                            if (rgbValues && rgbValues.length === 3) {
                                const [r, g, b] = rgbValues.map(Number);
                                const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

                                const newPalette = [...colorPalette];
                                newPalette[palIndex] = hexColor;
                                setColorPalette(newPalette);

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

        if (selectedShape === 'background') {
            setBackgroundColor(color);

            if (lastShiftClickedBackground && lastShiftClickedShape !== null) {
                const newShapeColors = [...shapeColors];

                if (Array.isArray(lastShiftClickedShape)) {
                    lastShiftClickedShape.forEach(index => {
                        newShapeColors[index] = color;
                    });
                } else {
                    newShapeColors[lastShiftClickedShape] = color;
                }

                setShapeColors(newShapeColors);
            }

            Object.entries(paletteLinkedShapes).forEach(([paletteIndex, linkedShape]) => {
                const palIndex = parseInt(paletteIndex);
                if (linkedShape === 'background') {
                    if (color.startsWith('rgb')) {
                        const rgbValues = color.match(/\d+/g);
                        if (rgbValues && rgbValues.length === 3) {
                            const [r, g, b] = rgbValues.map(Number);
                            const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;

                            const newPalette = [...colorPalette];
                            newPalette[palIndex] = hexColor;
                            setColorPalette(newPalette);

                            if (activePaletteIndex === palIndex) {
                                setCurrentPaletteColor(color);
                            }
                        }
                    }
                }
            });
        }
    };

    useEffect(() => {
        if (selectedShape !== null) {
            console.log('⚙️ useEffect triggered - outputColorCode:', outputColorCode, 'selectedShape:', selectedShape);
            console.log('⚙️ About to call handleColorChange with:', outputColorCode);
            handleColorChange(outputColorCode);
        }
    }, [outputColorCode, selectedShape]);

    // ===== SHAPE INTERACTION HANDLERS =====
    const handleShapeMouseDown = (index) => {
        if (isShiftPressed && selectedShape !== null && selectedShape !== 'background') {
            // When shift is pressed with an existing selection, determine what shapes will be active
            if (Array.isArray(selectedShape)) {
                // Check if clicking to deselect or add to selection
                if (selectedShape.includes(index)) {
                    // Clicking on a shape in the selection - will deselect it
                    const remainingShapes = selectedShape.filter(i => i !== index);
                    if (remainingShapes.length > 0) {
                        setActiveShape(remainingShapes);
                    } else {
                        setActiveShape(null);
                    }
                } else {
                    // Adding a new shape to the selection - clone color immediately
                    const newShapeColors = [...shapeColors];
                    newShapeColors[index] = outputColorCode;
                    setShapeColors(newShapeColors);
                    setActiveShape([...selectedShape, index]);
                }
            } else if (selectedShape === index) {
                // Clicking on the only selected shape - will deselect it
                setActiveShape(null);
            } else {
                // Have a single shape selected, adding another - clone color and both will be active
                const newShapeColors = [...shapeColors];
                newShapeColors[index] = outputColorCode;
                setShapeColors(newShapeColors);
                setActiveShape([selectedShape, index]);
            }
        } else {
            // For normal click or first shift-click, just activate the single shape
            setActiveShape(index);
        }
    };

    const handleShapeMouseUp = () => {
        setActiveShape(null);
    };

    const handleShapeClick = (index) => {
        console.log('🖱️ Shape clicked:', index, 'isShiftPressed:', isShiftPressed, 'selectedShape:', selectedShape);

        if (isShiftPressed) {
            console.log('⚡ Shift is pressed - color clone mode');
            if (selectedShape === 'background') {
                const newShapeColors = [...shapeColors];
                newShapeColors[index] = backgroundColor;
                setShapeColors(newShapeColors);

                setSelectedShape([index]);
                setLastShiftClickedShape(index);
                setLastShiftClickedBackground(true);
            } else if (selectedShape !== null && selectedShape !== 'background') {
                const newSelectedShapes = Array.isArray(selectedShape)
                    ? [...selectedShape]
                    : [selectedShape];

                const shapeIndex = newSelectedShapes.indexOf(index);
                if (shapeIndex !== -1) {
                    newSelectedShapes.splice(shapeIndex, 1);

                    let newSelection;
                    if (newSelectedShapes.length === 1) {
                        newSelection = newSelectedShapes[0];
                    } else if (newSelectedShapes.length === 0) {
                        newSelection = null;
                    } else {
                        newSelection = newSelectedShapes;
                    }
                    setSelectedShape(newSelection);

                    const newPaletteLinkedShapes = { ...paletteLinkedShapes };
                    Object.entries(paletteLinkedShapes).forEach(([palIndex, linkedSelection]) => {
                        if (Array.isArray(linkedSelection) && areSelectionsEqual(linkedSelection, selectedShape)) {
                            newPaletteLinkedShapes[palIndex] = Array.isArray(newSelection)
                                ? [...newSelection]
                                : newSelection;
                        }
                    });
                    setPaletteLinkedShapes(newPaletteLinkedShapes);
                } else {
                    newSelectedShapes.push(index);
                    setSelectedShape(newSelectedShapes);

                    const newShapeColors = [...shapeColors];
                    newShapeColors[index] = outputColorCode;
                    setShapeColors(newShapeColors);

                    const newPaletteLinkedShapes = { ...paletteLinkedShapes };
                    Object.entries(paletteLinkedShapes).forEach(([palIndex, linkedSelection]) => {
                        if (Array.isArray(linkedSelection) && areSelectionsEqual(linkedSelection, selectedShape)) {
                            newPaletteLinkedShapes[palIndex] = [...newSelectedShapes];
                        }
                    });
                    setPaletteLinkedShapes(newPaletteLinkedShapes);
                }
            } else if (currentPaletteColor) {
                const newShapeColors = [...shapeColors];
                newShapeColors[index] = currentPaletteColor;
                setShapeColors(newShapeColors);

                setSelectedShape(index);
                updateSlidersFromColor(currentPaletteColor);
            } else {
                setSelectedShape(index);
                updateSlidersFromColor(shapeColors[index]);
            }

            return;
        }

        setSelectedShape(index);
        updateSlidersFromColor(shapeColors[index]);
        setLastShiftClickedShape(null);
        setLastShiftClickedBackground(false);
        setCurrentPaletteColor(null);
    };

    // ===== BACKGROUND INTERACTION HANDLERS =====
    const handleBackgroundClick = () => {
        if (isShiftPressed) {
            if (selectedShape !== null && selectedShape !== 'background') {
                if (Array.isArray(selectedShape)) {
                    setBackgroundColor(outputColorCode);
                } else {
                    setBackgroundColor(shapeColors[selectedShape]);
                }

                if (Array.isArray(selectedShape)) {
                    setLastShiftClickedShape([...selectedShape]);
                } else {
                    setLastShiftClickedShape(selectedShape);
                }
                setLastShiftClickedBackground(true);
                setSelectedShape('background');

                if (onInstructionClose && typeof onInstructionClose === 'function') {
                    onInstructionClose();
                }
            } else if (currentPaletteColor) {
                setBackgroundColor(currentPaletteColor);
                setSelectedShape('background');
                updateSlidersFromColor(currentPaletteColor);

                if (onInstructionClose && typeof onInstructionClose === 'function') {
                    onInstructionClose();
                }
            }

            return;
        }

        setSelectedShape('background');
        updateSlidersFromColor(backgroundColor);
        setLastShiftClickedShape(null);
        setLastShiftClickedBackground(false);
        setCurrentPaletteColor(null);

        if (onInstructionClose && typeof onInstructionClose === 'function') {
            onInstructionClose();
        } else if (typeof window !== 'undefined' && window.closeInstructionModal) {
            window.closeInstructionModal();
        }
    };

    const handleBackgroundMouseDown = () => {
        if (backgroundShape.current) {
            backgroundShape.current.style.opacity = '0.7';

            if (lastShiftClickedBackground && lastShiftClickedShape) {
                if (Array.isArray(lastShiftClickedShape)) {
                    setActiveShape(lastShiftClickedShape);
                } else {
                    setActiveShape(lastShiftClickedShape);
                }
            }
        }
    };

    const handleBackgroundMouseUp = () => {
        if (backgroundShape.current) {
            backgroundShape.current.style.opacity = '1';
        }
        setActiveShape(null);
    };

    // ===== PALETTE INTERACTION HANDLERS =====
    const handlePaletteClick = (index) => {
        console.log('Palette click on', index, 'current selection:', selectedShape);

        if (isShiftPressed && selectedShape !== null) {
            console.log('Shift-clicked palette', index, 'with selection', selectedShape);

            let colorToStore;

            if (selectedShape === 'background') {
                colorToStore = backgroundColor;
            } else if (Array.isArray(selectedShape)) {
                colorToStore = outputColorCode;
            } else {
                colorToStore = shapeColors[selectedShape];
            }

            if (colorToStore?.startsWith('rgb')) {
                const rgbValues = colorToStore.match(/\d+/g);
                if (rgbValues && rgbValues.length === 3) {
                    const [r, g, b] = rgbValues.map(Number);
                    colorToStore = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                }
            }

            const newPalette = [...colorPalette];
            newPalette[index] = colorToStore || '#D9D9D9';
            setColorPalette(newPalette);

            const newPaletteLinkedShapes = { ...paletteLinkedShapes };
            if (Array.isArray(selectedShape)) {
                newPaletteLinkedShapes[index] = [...selectedShape];
            } else {
                newPaletteLinkedShapes[index] = selectedShape;
            }
            setPaletteLinkedShapes(newPaletteLinkedShapes);
            console.log('Linking palette', index, 'to shape', newPaletteLinkedShapes[index]);

            setActivePaletteIndex(index);
            setCurrentPaletteColor(colorToStore);

            return;
        }

        const hexColor = colorPalette[index];

        try {
            const r = parseInt(hexColor.slice(1, 3), 16);
            const g = parseInt(hexColor.slice(3, 5), 16);
            const b = parseInt(hexColor.slice(5, 7), 16);

            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                const rgbColor = `rgb(${r},${g},${b})`;
                setCurrentPaletteColor(rgbColor);
                setActivePaletteIndex(index);

                // Single-click on palette: only update sliders, don't change shape selection
                updateSlidersFromColor(rgbColor);
            }
        } catch (err) {
            console.error('Error parsing palette color:', hexColor, err);
        }
    };

    // ===== LAYOUT SELECTION =====
    const renderLayout = () => {
        const layoutProps = {
            row,
            col,
            width,
            height,
            hSpace,
            vSpace,
            fillArea,
            shapeColors,
            selectedShape,
            activeShape,
            backgroundColor,
            handleShapeClick,
            handleShapeMouseDown,
            handleShapeMouseUp
        };

        switch (layoutMode) {
            case 'cosmic':
                return <CosmicLayout {...layoutProps} />;

            case 'radiant':
                return <RadiantLayout {...layoutProps} />;

            case 'svg':
                return (
                    <SVGLayout
                        svgPath={svgPath}
                        svgContent={svgContent}
                        shapeColors={shapeColors}
                        selectedShape={selectedShape}
                        activeShape={activeShape}
                        backgroundColor={backgroundColor}
                        handleShapeClick={handleShapeClick}
                        handleShapeMouseDown={handleShapeMouseDown}
                        handleShapeMouseUp={handleShapeMouseUp}
                        handleBackgroundClick={handleBackgroundClick}
                    />
                );

            case 'grid':
            default:
                return <GridLayout {...layoutProps} />;
        }
    };

    // ===== RENDER =====
    return (
        <>
            <style>
                {`
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                `}
            </style>
            <div
                id='main-div'
                className={`w-full relative flex justify-center items-center ${layoutMode === 'svg' ? 'h-full' : 'min-h-[100vh] pb-10'}`}
                style={{ position: 'relative' }}
            >
                {/* Background SVG */}
                <svg
                    ref={backgroundShape}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none'
                    }}
                >
                    <rect
                        width="100%"
                        height="100%"
                        fill={backgroundColor}
                        className="cursor-pointer"
                        style={{ pointerEvents: 'auto' }}
                        onClick={() => handleBackgroundClick()}
                        onMouseDown={() => handleBackgroundMouseDown()}
                        onMouseUp={() => handleBackgroundMouseUp()}
                        onTouchStart={() => handleBackgroundMouseDown()}
                        onTouchEnd={() => {
                            handleBackgroundMouseUp();
                            handleBackgroundClick();
                        }}
                    />
                </svg>

                {/* Vertical Color Palette */}
                <div
                    className="fixed left-2 top-1/2 transform -translate-y-1/2 z-10"
                    style={{
                        background: backgroundColor,
                        padding: "10px 10px",
                        borderRadius: "0 4px 4px 0",
                        boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
                        border: "1px solid transparent",
                        borderImage: "linear-gradient(to bottom, #C8C8C8, #626262) 1",
                        minWidth: "50px",
                        display: (shouldHidePalette || !showPanels) ? 'none' : 'block'
                    }}
                >
                    <div className="flex flex-col gap-2">
                        {colorPalette.map((color, index) => (
                            <div
                                key={index}
                                className="palette-square shadow-sm hover:shadow-md transition-shadow"
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    backgroundColor: color,
                                    cursor: "pointer",
                                    position: "relative",
                                    border: (() => {
                                        const normalizeColor = (col) => {
                                            if (!col) return '#ffffff';
                                            if (col.startsWith('#')) return col.toLowerCase();
                                            if (col.startsWith('rgb')) {
                                                const rgbValues = col.match(/\d+/g);
                                                if (rgbValues && rgbValues.length === 3) {
                                                    const [r, g, b] = rgbValues.map(Number);
                                                    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase()}`;
                                                }
                                            }
                                            return col.toLowerCase();
                                        };

                                        const normalizedPaletteColor = normalizeColor(color);
                                        const normalizedBgColor = normalizeColor(backgroundColor);

                                        return normalizedPaletteColor === normalizedBgColor
                                            ? '1px solid #666666'
                                            : 'none';
                                    })()
                                }}
                                onClick={() => handlePaletteClick(index)}
                                onMouseDown={(e) => { e.target.style.opacity = 0.8; }}
                                onMouseUp={(e) => {
                                    e.target.style.opacity = 1;
                                    setActiveShape(null);
                                }}
                                onTouchStart={(e) => { e.target.style.opacity = 0.8; }}
                                onTouchEnd={(e) => {
                                    e.target.style.opacity = 1;
                                    setActiveShape(null);
                                    handlePaletteClick(index);
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Layout Container */}
                <div
                    className={`flex items-center justify-center gap-10 scale-90 lg:scale-100 ${layoutMode === 'svg' ? '' : 'relative top-5'}`}
                    style={layoutMode === 'svg' ? {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        paddingTop: '45px',
                        paddingBottom: '120px'
                    } : {}}
                >
                    {renderLayout()}
                </div>

                {/* Slider Panel */}
                {showPanels && (
                <div
                    className="flex flex-col bg-background rounded-2xl absolute scale-75 right-0 lg:right-0 lg:scale-90"
                    style={{
                        boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                        position: 'fixed',
                        overflow: 'hidden',
                        margin: '0 0px 0px 0',
                        bottom: layoutMode === 'svg' ? '30px' : '30px',
                        right: '10px',
                        paddingTop: '15px',
                        minHeight: 'fit-content'
                    }}
                >
                    {/* Hover area for color picker */}
                    <div
                        onMouseEnter={() => setIsPickerHovered(true)}
                        onMouseLeave={() => setIsPickerHovered(false)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '50px',
                            backgroundColor: 'transparent',
                            borderRadius: '1rem 1rem 0 0',
                            zIndex: 2,
                            cursor: 'pointer'
                        }}
                    />

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

                    {/* Color Picker - 8 colored squares */}
                    {isPickerHovered && (
                        <div
                            onMouseEnter={() => setIsPickerHovered(true)}
                            onMouseLeave={() => setIsPickerHovered(false)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: '4px',
                                zIndex: 5,
                                opacity: 1,
                                transition: 'opacity 0.2s ease-in-out',
                                animation: 'fadeIn 0.2s ease-in-out'
                            }}
                        >
                            {[
                                ['rgb(255, 0, 0)', '0.5rem 0 0 0'],
                                ['rgb(255, 128, 0)', '0'],
                                ['rgb(255, 255, 0)', '0'],
                                ['rgb(0, 255, 0)', '0'],
                                ['rgb(0, 255, 255)', '0'],
                                ['rgb(0, 0, 255)', '0'],
                                ['rgb(128, 0, 255)', '0'],
                                ['rgb(255, 0, 255)', '0 0.5rem 0 0']
                            ].map(([color, radius], idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        width: '32px',
                                        height: '30px',
                                        backgroundColor: color,
                                        cursor: 'pointer',
                                        borderRadius: radius
                                    }}
                                    onClick={() => {
                                        handleColorChange(color);
                                        const match = color.match(/\d+/g);
                                        if (match) {
                                            setRed(parseInt(match[0]));
                                            setGreen(parseInt(match[1]));
                                            setBlue(parseInt(match[2]));
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Picker icon */}
                    {!isPickerHovered && (
                        <div
                            style={{
                                position: 'absolute',
                                top: '20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 3,
                                pointerEvents: 'none'
                            }}
                        >
                            <img src="/picker_icon.svg" alt="Color Picker" style={{ width: '24px', height: '24px' }} />
                        </div>
                    )}

                    {/* Spacer */}
                    <div style={{ height: '60px', width: '100%' }}></div>

                    {/* Sliders */}
                    <div className="flex items-center pl-3 pr-3" style={{ flexWrap: 'nowrap' }}>
                        <ColorSlider svg="/GS_handle.svg" color="white" value={black} onChange={(value) => handleSliderChange('Black', value)} />
                        <ColorSlider svg="/R_handle.svg" color="Red" value={red} onChange={(value) => handleSliderChange('Red', value)} />
                        <ColorSlider svg="/Y_handle.svg" color="Yellow" value={yellow} onChange={(value) => handleSliderChange('Yellow', value)} />
                        <ColorSlider svg="/G_handle.svg" color="Green" value={green} onChange={(value) => handleSliderChange('Green', value)} />
                        <ColorSlider svg="/C_handle.svg" color="Cyan" value={cyan} onChange={(value) => handleSliderChange('Cyan', value)} />
                        <ColorSlider svg="/B_handle.svg" color="Blue" value={blue} onChange={(value) => handleSliderChange('Blue', value)} />
                        <ColorSlider svg="/M_handle.svg" color="Magenta" value={magenta} onChange={(value) => handleSliderChange('Magenta', value)} />
                    </div>

                    {/* Color value display */}
                    <div className="flex justify-center items-center gap-1 pt-7">
                        <div className='bg-[#A9A9A9] dark:bg-zinc-600 text-white text-center w-1/2 p-3 rounded-bl-2xl'>
                            <h2>{`${red}.${green}.${blue}`}</h2>
                        </div>
                        <div className='bg-[#565656] text-white text-center w-1/2 p-3 rounded-br-2xl'>
                            <h2>{`#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1).toUpperCase()}`}</h2>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </>
    );
};

export default ColorControllerUI;
