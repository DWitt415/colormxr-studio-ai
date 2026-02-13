import { useEffect, useRef, useState } from 'react';
import ColorSlider from './ColorSlider';

/* ------------------- Color Controller UI ------------------- */
/* ----exercise page may or may not define background color and shape colors---- */
/* ----if not defined, default values are used: black shapes, white background---- */

const initColorArray = [
    'rgb(175, 175, 175)',
    'rgb(180, 180, 180)',
    'rgb(185, 185, 185)',
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
];

const cmyToRgb = (c, m, y) => {
    // Convert CMY values (0-100) to RGB values (0-240)
    const r = Math.round(240 * (1 - c / 100));
    const g = Math.round(240 * (1 - m / 100));
    const b = Math.round(240 * (1 - y / 100));
    return { r, g, b };
};

const rgbToCmy = (r, g, b) => {
    // Convert RGB values (0-240) to CMY values (0-100)
    const c = (1 - r / 240) * 100;
    const m = (1 - g / 240) * 100;
    const y = (1 - b / 240) * 100;
    return { c, m, y };
};

const ColorControllerUI = ({ row, col, width, height, hSpace, vSpace, bgColor = 'rgb(213, 213, 213)' , initShapeColors }) => {
    const [red, setRed] = useState(0);
    const [green, setGreen] = useState(0);
    const [blue, setBlue] = useState(0);
    const [yellow, setYellow] = useState(0);
    const [cyan, setCyan] = useState(0);
    const [magenta, setMagenta] = useState(0);
    const [isZPressed, setIsZPressed] = useState(false);
    const [selectedShape, setSelectedShape] = useState(null);
    const [clonedOutputColor, setClonedOutputColor] = useState(null);
    const [outputColor, setOutputColor] = useState(`rgb(${red},${green},${blue})`);
    const [shapeColors, setShapeColors] = useState(
        Array.from({ length: row * col }, (_, i) => initShapeColors ? initShapeColors[i % initShapeColors.length] : initColor)
    );
    const [backgroundColor, setBackgroundColor] = useState(bgColor || 'rgb(240,240,240)');
    
    const backgroundShape = useRef(null);
    const initColor = 'rgb(240,240,240)';
    const shapeNum = row * col;
    const outputColorCode = `rgb(${red},${green},${blue})`;

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'z') {
                setIsZPressed(true);
            }
            if (event.shiftKey && selectedShape !== null && selectedShape !== 'background') {
                if (Array.isArray(selectedShape)) {
                    setClonedOutputColor(shapeColors[selectedShape[0]]);
                } else {
                    setClonedOutputColor(shapeColors[selectedShape]);
                }
            } else if (event.shiftKey && selectedShape === 'background') {
                setClonedOutputColor(backgroundColor);
            }
        };

        const handleKeyUp = (event) => {
            if (event.key === 'z') {
                setIsZPressed(false);
            }
            if (event.key === 'Shift' && selectedShape !== null) {
                setClonedOutputColor(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [selectedShape, shapeColors, backgroundColor]);

    const handleSliderChange = (color, value) => {
        // Convert the slider value from 0-240 to 0-100
        const scaledValue = (value / 240) * 100;

        let newCyan = cyan;
        let newMagenta = magenta;
        let newYellow = yellow;

        if (isZPressed) {
            // When Z is pressed, adjust all channels proportionally
            switch (color) {
                case 'Cyan':
                    const deltaCyan = scaledValue - cyan;
                    newCyan = scaledValue;
                    newMagenta = Math.min(Math.max(magenta + deltaCyan, 0), 100);
                    newYellow = Math.min(Math.max(yellow + deltaCyan, 0), 100);
                    break;
                case 'Magenta':
                    const deltaMagenta = scaledValue - magenta;
                    newCyan = Math.min(Math.max(cyan + deltaMagenta, 0), 100);
                    newMagenta = scaledValue;
                    newYellow = Math.min(Math.max(yellow + deltaMagenta, 0), 100);
                    break;
                case 'Yellow':
                    const deltaYellow = scaledValue - yellow;
                    newCyan = Math.min(Math.max(cyan + deltaYellow, 0), 100);
                    newMagenta = Math.min(Math.max(magenta + deltaYellow, 0), 100);
                    newYellow = scaledValue;
                    break;
            }
            setCyan(newCyan);
            setMagenta(newMagenta);
            setYellow(newYellow);
        } else {
            // Original slider behavior
            switch (color) {
                case 'Cyan':
                    newCyan = scaledValue;
                    setCyan(scaledValue);
                    break;
                case 'Magenta':
                    newMagenta = scaledValue;
                    setMagenta(scaledValue);
                    break;
                case 'Yellow':
                    newYellow = scaledValue;
                    setYellow(scaledValue);
                    break;
                case 'Blue':
                    const deltaBlue = scaledValue - ((cyan + magenta) / 2);
                    newCyan = Math.min(Math.max(cyan + deltaBlue, 0), 100);
                    newMagenta = Math.min(Math.max(magenta + deltaBlue, 0), 100);
                    setCyan(newCyan);
                    setMagenta(newMagenta);
                    break;
                case 'Red':
                    const deltaRed = scaledValue - ((magenta + yellow) / 2);
                    newMagenta = Math.min(Math.max(magenta + deltaRed, 0), 100);
                    newYellow = Math.min(Math.max(yellow + deltaRed, 0), 100);
                    setMagenta(newMagenta);
                    setYellow(newYellow);
                    break;
                case 'Green':
                    const deltaGreen = scaledValue - ((cyan + yellow) / 2);
                    newCyan = Math.min(Math.max(cyan + deltaGreen, 0), 100);
                    newYellow = Math.min(Math.max(yellow + deltaGreen, 0), 100);
                    setCyan(newCyan);
                    setYellow(newYellow);
                    break;
            }
        }

        // Set blue to the average of cyan and magenta
        const newBlue = (newCyan + newMagenta) / 2;
        setBlue(newBlue * 2.55);

        // Set red to the average of magenta and yellow
        const newRed = (newMagenta + newYellow) / 2;
        setRed(newRed * 2.55);

        // Set green to the average of cyan and yellow
        const newGreen = (newCyan + newYellow) / 2;
        setGreen(newGreen * 2.55);

        const { r, g, b } = cmyToRgb(newCyan, newMagenta, newYellow);
        setRed(240 - r);
        setGreen(240 - g);
        setBlue(240 - b);

        const outputColorCode = `rgb(${240 - r},${240 - g},${240 - b})`;

        if (selectedShape === 'background') {
            setBackgroundColor(outputColorCode);
        } else if (selectedShape !== null) {
            const newShapeColors = [...shapeColors];
            if (Array.isArray(selectedShape)) {
                selectedShape.forEach((index) => {
                    newShapeColors[index] = outputColorCode;
                });
            } else {
                newShapeColors[selectedShape] = outputColorCode;
            }
            setShapeColors(newShapeColors);
        }
    };

    const handleGrayscaleChange = (value) => {
        const scaledValue = (value / 240) * 100;
        setCyan(scaledValue);
        setMagenta(scaledValue);
        setYellow(scaledValue);

        const { r, g, b } = cmyToRgb(scaledValue, scaledValue, scaledValue);
        setRed(240 - r);
        setGreen(240 - g);
        setBlue(240 - b);

        const outputColorCode = `rgb(${240 - r},${240 - g},${240 - b})`;

        if (selectedShape === 'background') {
            setBackgroundColor(outputColorCode);
        } else if (selectedShape !== null) {
            const newShapeColors = [...shapeColors];
            if (Array.isArray(selectedShape)) {
                selectedShape.forEach((index) => {
                    newShapeColors[index] = outputColorCode;
                });
            } else {
                newShapeColors[selectedShape] = outputColorCode;
            }
            setShapeColors(newShapeColors);
        }
    };

    useEffect(() => {
        const disableContextMenu = (event) => {
            event.preventDefault();
        };

        document.addEventListener('contextmenu', disableContextMenu);

        return () => {
            document.removeEventListener('contextmenu', disableContextMenu);
        };
    }, []);

    const handleColorChange = (newColor) => {
        setOutputColor(newColor);
        if (selectedShape !== null && selectedShape !== 'background') {
            const newShapeColors = [...shapeColors];
            if (Array.isArray(selectedShape)) {
                selectedShape.forEach((index) => {
                    newShapeColors[index] = newColor;
                });
            } else {
                newShapeColors[selectedShape] = newColor;
            }
            setShapeColors(newShapeColors);
        }
    };

    useEffect(() => {
        handleColorChange(outputColorCode);
    }, [outputColorCode]);

    const handleShapeClick = (index) => {
        if (clonedOutputColor !== null && selectedShape !== 'background') {
            const newShapeColors = [...shapeColors];
            newShapeColors[index] = clonedOutputColor;
            setShapeColors(newShapeColors);

            let selectedShapes = [];
            if (!Array.isArray(selectedShape)) {
                selectedShapes.push(selectedShape);
            }
            if (Array.isArray(selectedShape)) {
                selectedShapes = selectedShape;
            }
            selectedShapes.push(index);
            setSelectedShape(selectedShapes);

            const [r, g, b] = clonedOutputColor.match(/\d+/g).map(Number);
            const { c, m, y } = rgbToCmy(r, g, b);
            setCyan(100 - c);
            setMagenta(100 - m);
            setYellow(100 - y);
            setRed(r);
            setGreen(g);
            setBlue(b);
        } else if (clonedOutputColor !== null && selectedShape === 'background') {
            const newShapeColors = [...shapeColors];
            newShapeColors[index] = clonedOutputColor;
            setShapeColors(newShapeColors);
            setSelectedShape(index);

            const [r, g, b] = clonedOutputColor.match(/\d+/g).map(Number);
            const { c, m, y } = rgbToCmy(r, g, b);
            setCyan(100 - c);
            setMagenta(100 - m);
            setYellow(100 - y);
            setRed(r);
            setGreen(g);
            setBlue(b);
        } else {
            setSelectedShape(index);
            if (shapeColors[index]) {
                const [r, g, b] = shapeColors[index].match(/\d+/g).map(Number);
                const { c, m, y } = rgbToCmy(r, g, b);
                setCyan(100 - c);
                setMagenta(100 - m);
                setYellow(100 - y);
                setRed(r);
                setGreen(g);
                setBlue(b);
            }
        }
    };

    const handleBackgroundClick = () => {
        setSelectedShape('background');
        const [r, g, b] = backgroundColor.match(/\d+/g).map(Number);
        const { c, m, y } = rgbToCmy(r, g, b);
        setCyan(100 - c);
        setMagenta(100 - m);
        setYellow(100 - y);
        setRed(r);
        setGreen(g);
        setBlue(b);
    };
    

    const createGrid = (row, col, width, height, hSpace, vSpace) => {
        let gridArray = [];
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                const shapeNum = i * col + j;
                gridArray.push(
                    <svg key={`${i}-${j}`} width={width} height={height} style={{ margin: `${vSpace / 2}px ${hSpace / 2}px` }} >
                        <rect
                            width='100%'
                            height='100%'
                            fill={shapeColors[shapeNum]}
                            className="cursor-pointer shadow-none border-none hover:border-none "
                            onMouseDown={(e) => { e.target.style.opacity = 0.5; }}
                            onMouseUp={(e) => { e.target.style.opacity = 1; }}
                            onClick={() => handleShapeClick(shapeNum)}
                            onTouchStart={(e) => { e.target.style.opacity = 0.5; }}
                            onTouchEnd={(e) => { 
                                e.target.style.opacity = 1; 
                                handleShapeClick(shapeNum);
                            }}
                        />
                    </svg>
                );
            }
        }
        return gridArray;
    }

    useEffect(() => {
        if (selectedShape === 'background') {
            setBackgroundColor(outputColor);
        }
    }, [selectedShape, outputColorCode, backgroundColor, clonedOutputColor]);

    return (
        <div
            id='main-div'
            className="min-h-[100vh] w-full relative pb-10 flex justify-center items-center"
            style={{ position: 'relative' }} >
            
            <svg ref={backgroundShape}
                style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }} // Ensure fullscreen size from top left of the browser window
                onClick={() => handleBackgroundClick()}
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={backgroundColor}
                    className="cursor-pointer"
                />
            </svg>

            <div className="flex items-center justify-center gap-10 scale-90 lg:scale-100 relative top-5">
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${col}, 1fr)`,
                    }}
                >
                    {createGrid(row, col, width, height, hSpace, vSpace)}
                </div>
            </div>
            <div className="flex flex-col justify-center bg-[#898989] pt-10 rounded-2xl absolute scale-75 bottom-5 right-0 lg:scale-90 lg:bottom-9 lg:right-9" > 
                <div className="flex items-center flex-wrap pl-3">
                    <ColorSlider svg="/C_handle.svg" color="Cyan" value={cyan * 2.55} onChange={(value) => handleSliderChange('Cyan', value)} min={0} max={240} />
                    <ColorSlider svg="/CM_handle.svg" color="Blue" value={(cyan + magenta) * 1.275} onChange={(value) => handleSliderChange('Blue', value)} min={0} max={240} />
                    <ColorSlider svg="/M_handle.svg" color="Magenta" value={magenta * 2.55} onChange={(value) => handleSliderChange('Magenta', value)} min={0} max={240} />
                    <ColorSlider svg="/MY_handle.svg" color="Red" value={(magenta + yellow) * 1.275} onChange={(value) => handleSliderChange('Red', value)} min={0} max={240} />
                    <ColorSlider svg="/Y_handle.svg" color="Yellow" value={yellow * 2.55} onChange={(value) => handleSliderChange('Yellow', value)} min={0} max={240} />
                    <ColorSlider svg="/YC_handle.svg" color="Green" value={(cyan + yellow) * 1.275} onChange={(value) => handleSliderChange('Green', value)} min={0} max={240} />
                    <ColorSlider svg="/GS_handle.svg" color="Grayscale" value={(cyan + magenta + yellow) / 3 * 2.55} onChange={(value) => handleGrayscaleChange(value)} min={0} max={240} />
                </div>
                <div className="flex justify-center items-center gap-1 pt-7">
                    <div className='bg-[#A9A9A9] dark:bg-zinc-600 text-[#ffffff] text-center w-full px-0 mx-0 p-3 rounded-b-2xl'>
                        <h2>C:{100-Math.round(cyan)}  M:{100-Math.round(magenta)}  Y:{100-Math.round(yellow)}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorControllerUI;