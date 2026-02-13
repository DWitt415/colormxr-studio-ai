'use client'
import { useEffect, useState } from 'react';
import ColorSlider from './ColorSlider';

const SVGColorControllerUI = ({ 
    svgShapes, 
    selectedShapeIndex, 
    onColorChange,
    externalColorUpdates = {},
    bgColor = 'rgb(255,255,255)'
}) => {
    const [red, setRed] = useState(0);
    const [green, setGreen] = useState(0);
    const [blue, setBlue] = useState(0);
    const [black, setBlack] = useState(0);
    const [yellow, setYellow] = useState(0);
    const [cyan, setCyan] = useState(0);
    const [magenta, setMagenta] = useState(0);
    
    // Keep track of our own shape colors
    const [shapeColors, setShapeColors] = useState([]);
    
    // Track shift key state for color cloning
    const [isShiftPressed, setIsShiftPressed] = useState(false);
    
    // Track state for shift-click color relationships
    const [lastShiftClickedShape, setLastShiftClickedShape] = useState(null);

    // Initialize shape colors when svgShapes changes
    useEffect(() => {
        if (svgShapes && svgShapes.length > 0) {
            const initialColors = svgShapes.map(shape => shape.fill);
            setShapeColors(initialColors);
        }
    }, [svgShapes]);

    // Update RGB values when selected shape changes
    useEffect(() => {
        if (selectedShapeIndex !== -1 && shapeColors[selectedShapeIndex]) {
            const selectedColor = shapeColors[selectedShapeIndex];
            console.log("Selected shape color:", selectedColor);
            
            // Parse the color to RGB values
            let r = 0, g = 0, b = 0;
            
            if (selectedColor.startsWith('rgb(')) {
                const rgbMatch = selectedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                if (rgbMatch) {
                    r = parseInt(rgbMatch[1]);
                    g = parseInt(rgbMatch[2]);
                    b = parseInt(rgbMatch[3]);
                }
            } else if (selectedColor.startsWith('#')) {
                const hex = selectedColor.substring(1);
                if (hex.length === 6) {
                    r = parseInt(hex.substring(0, 2), 16);
                    g = parseInt(hex.substring(2, 4), 16);
                    b = parseInt(hex.substring(4, 6), 16);
                } else if (hex.length === 3) {
                    r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
                    g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
                    b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
                }
            }
            
            console.log("Setting RGB values:", r, g, b);
            setRed(r);
            setGreen(g);
            setBlue(b);
        }
    }, [selectedShapeIndex]);
    
    // Handle external color updates (from shift-click cloning)
    useEffect(() => {
        if (externalColorUpdates && Object.keys(externalColorUpdates).length > 0) {
            const newShapeColors = [...shapeColors];
            let hasUpdates = false;
            
            Object.entries(externalColorUpdates).forEach(([index, color]) => {
                const shapeIndex = parseInt(index);
                if (shapeIndex >= 0 && shapeIndex < newShapeColors.length && newShapeColors[shapeIndex] !== color) {
                    newShapeColors[shapeIndex] = color;
                    hasUpdates = true;
                }
            });
            
            if (hasUpdates) {
                setShapeColors(newShapeColors);
                
                // If the currently selected shape was updated, update RGB sliders
                if (selectedShapeIndex !== -1 && externalColorUpdates[selectedShapeIndex]) {
                    const updatedColor = externalColorUpdates[selectedShapeIndex];
                    
                    // Parse the color to RGB values
                    let r = 0, g = 0, b = 0;
                    
                    if (updatedColor.startsWith('rgb(')) {
                        const rgbMatch = updatedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
                        if (rgbMatch) {
                            r = parseInt(rgbMatch[1]);
                            g = parseInt(rgbMatch[2]);
                            b = parseInt(rgbMatch[3]);
                        }
                    } else if (updatedColor.startsWith('#')) {
                        const hex = updatedColor.substring(1);
                        if (hex.length === 6) {
                            r = parseInt(hex.substring(0, 2), 16);
                            g = parseInt(hex.substring(2, 4), 16);
                            b = parseInt(hex.substring(4, 6), 16);
                        } else if (hex.length === 3) {
                            r = parseInt(hex.substring(0, 1) + hex.substring(0, 1), 16);
                            g = parseInt(hex.substring(1, 2) + hex.substring(1, 2), 16);
                            b = parseInt(hex.substring(2, 3) + hex.substring(2, 3), 16);
                        }
                    }
                    
                    setRed(r);
                    setGreen(g);
                    setBlue(b);
                }
            }
        }
    }, [externalColorUpdates, selectedShapeIndex]); // REMOVE shapeColors from dependency array

    // Update derived color values when RGB changes
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

    // Update the selected shape color when RGB changes
    useEffect(() => {
        if (selectedShapeIndex !== -1) {
            const newColor = `rgb(${red}, ${green}, ${blue})`;
            
            // Update internal state
            const newShapeColors = [...shapeColors];
            newShapeColors[selectedShapeIndex] = newColor;
            setShapeColors(newShapeColors);
            
            // Notify parent of color change
            if (onColorChange) {
                onColorChange(selectedShapeIndex, newColor);
            }
        }
    }, [red, green, blue, selectedShapeIndex]);

    const handleSliderChange = (color, value) => {
        let newRed = red;
        let newGreen = green;
        let newBlue = blue;

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
                        newGreen = Math.min(255, green + (value - yellow));
                        newRed = Math.min(255, red + (value - yellow));
                    } else {
                        newRed = Math.min(255, red + (value - yellow));
                        newGreen = Math.min(255, green + (value - yellow));
                    }
                } else {
                    if (green < red) {
                        newGreen = Math.max(0, green - (yellow - value));
                        newRed = Math.max(0, red - (yellow - value));
                    } else {
                        newRed = Math.max(0, red - (yellow - value));
                        newGreen = Math.max(0, green - (yellow - value));
                    }
                }
                break;
            case 'Cyan':
                if (value > cyan) {
                    if (green > blue) {
                        newGreen = Math.min(255, green + (value - cyan));
                        newBlue = Math.min(255, blue + (value - cyan));
                    } else {
                        newBlue = Math.min(255, blue + (value - cyan));
                        newGreen = Math.min(255, green + (value - cyan));
                    }
                } else {
                    if (green < blue) {
                        newGreen = Math.max(0, green - (cyan - value));
                        newBlue = Math.max(0, blue - (cyan - value));
                    } else {
                        newBlue = Math.max(0, blue - (cyan - value));
                        newGreen = Math.max(0, green - (cyan - value));
                    }
                }
                break;
            case 'Magenta':
                if (value > magenta) {
                    if (red > blue) {
                        newRed = Math.min(255, red + (value - magenta));
                        newBlue = Math.min(255, blue + (value - magenta));
                    } else {
                        newBlue = Math.min(255, blue + (value - magenta));
                        newRed = Math.min(255, red + (value - magenta));
                    }
                } else {
                    if (red < blue) {
                        newRed = Math.max(0, red - (magenta - value));
                        newBlue = Math.max(0, blue - (magenta - value));
                    } else {
                        newBlue = Math.max(0, blue - (magenta - value));
                        newRed = Math.max(0, red - (magenta - value));
                    }
                }
                break;
            default:
                break;
        }

        setRed(newRed);
        setGreen(newGreen);
        setBlue(newBlue);
    };

    return (
        <div className="flex flex-col justify-center bg-background pt-10 rounded-2xl scale-75 lg:scale-90" 
            style={{ 
                boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                margin: '0 0px 0px 0',
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
            
            {/* Slider panel */}
            <div className="flex items-center pl-3 pr-3" style={{ flexWrap: 'nowrap' }}>
                <ColorSlider svg="/GS_handle.svg" color="white" value={black} onChange={(value) => handleSliderChange('Black', value)} />
                <ColorSlider svg="/R_handle.svg" color="Red" value={red} onChange={(value) => handleSliderChange('Red', value)} />
                <ColorSlider svg="/Y_handle.svg" color="Yellow" value={yellow} onChange={(value) => handleSliderChange('Yellow', value)} />
                <ColorSlider svg="/G_handle.svg" color="Green" value={green} onChange={(value) => handleSliderChange('Green', value)} />
                <ColorSlider svg="/C_handle.svg" color="Cyan" value={cyan} onChange={(value) => handleSliderChange('Cyan', value)} />
                <ColorSlider svg="/B_handle.svg" color="Blue" value={blue} onChange={(value) => handleSliderChange('Blue', value)} />
                <ColorSlider svg="/M_handle.svg" color="Magenta" value={magenta} onChange={(value) => handleSliderChange('Magenta', value)} />
            </div>
            
            {/* Color display */}
            <div className="flex justify-center items-center gap-1 pt-7">
                <div className='bg-[#A9A9A9] dark:bg-zinc-600 text-white text-center w-1/2 p-3 rounded-bl-2xl'>
                    <h2>
                        {`${red}.${green}.${blue}`}
                    </h2>
                </div>
                <div className='bg-[#565656] text-white text-center w-1/2 p-3 rounded-br-2xl'>
                    <h2>
                        {`#${((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1).toUpperCase()}`}
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default SVGColorControllerUI;
