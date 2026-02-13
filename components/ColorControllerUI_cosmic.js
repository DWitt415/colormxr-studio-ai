import { useEffect, useRef, useState, useCallback } from 'react';
import { useLongPress } from 'react-use';
import ColorSlider from './ColorSlider';

/* ------------------- Color Controller UI ------------------- */
/* ----exercise page may or may not define background color and shape colors---- */
/* ----if not defined, default values are used: black shapes, white background---- */

    let backgroundColor =  'rgb(255,255,255)'; // default background color
    //var to set initial shape color to single var
    let initColor = 'rgb(0,0,0)'; // Initial color for the shapes 

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
   

//input props to set the grid size and spacing
const ColorControllerUI_cosmic = ({ row, col, width, height, hSpace, vSpace, bgColor, initShapeColors }) => {

const [red, setRed] = useState(0);
const [green, setGreen] = useState(0);
const [blue, setBlue] = useState(0);
const [black, setBlack] = useState(0);
const [yellow, setYellow] = useState(0);
const [cyan, setCyan] = useState(0);
const [magenta, setMagenta] = useState(0);

const shapeNum = row * col;
const outputColorCode = `rgb(${red},${green},${blue})`;

const backgroundShape = useRef(null);
if (bgColor != null) {
    backgroundColor = bgColor;
}

let [shapeColors, setShapeColors] = useState(
    Array.from({ length: Math.max(shapeNum+1, 1) }, (_, i) => 
        i === 0 ? 
        (backgroundColor || '#FFFFFF') : 
        initShapeColors ? 
        initShapeColors[i % initShapeColors.length] : 
        initColor
    )
);

const createCosmicGrid = (col, width, height, vSpace, hSpace) => {
    let gridArray = [];
    console.log('shapeColors:', shapeColors);
    for (let i = 0; i < col; i++) {
        const currentWidth = width + i * hSpace;
        const currentHeight = height + i * vSpace;
        const shapeNum = i + 1; // Assuming shapeNum is just the index + 1
       /* const colorValue = Math.floor((i / col) * 255); // Grayscale color value increasing with each iteration
        const color = `rgb(${colorValue}, ${colorValue}, ${colorValue})`; // Grayscale color
        shapeColors.push(color); */

        //
        gridArray.push(
            <svg key={i} width={currentWidth} height={currentHeight} style={{ position: 'absolute', top: `calc(50% - ${currentHeight / 2}px)`, left: `calc(50% - ${currentWidth / 2}px)`, zIndex: col - i }}>
                <rect
                    shapenum={shapeNum} 
                    //color={shapeColors[shapeNum]}
                    handleShapeClick={handleShapeClick} 
                    handlePressColorClone={handlePressColorClone}
                />
            </svg>
        );
    }
    
    return gridArray;
};


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
            // Moving black slider should update all other sliders to same value as black slider
            newRed = value;
            newGreen = value;
            newBlue = value;
            setRed(value); // Update the state variable for Red
            setGreen(value); // Update the state variable for Green
            setBlue(value); // Update the state variable for Blue

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
            setYellow(value); // Update the state variable for Yellow
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

            setCyan(value); // Update the state variable for Cyan
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

            setMagenta(value); // Update the state variable for Magenta
            break;
        default:
            break;
    }

    // Update Black slider position
    const newBlack = Math.round((newRed + newGreen + newBlue) / 3);
    setBlack(newBlack);
    setRed(newRed);
    setGreen(newGreen);
    setBlue(newBlue);


    // Update Yellow slider position when Red slider or Green slider position is changed and also update Yellow SLider when Magenta slider is changed
    if (color === 'Red' || color === 'Green' || color === 'Magenta' || color === 'Cyan') {
        // setYellow(Math.round((newRed + newGreen) / 2)); 
        setYellow(Math.round(newRed + (newGreen - newRed) / 2)); // Corrected formula
    }


    // Update Cyan slider position when Green slider or Blue slider position is changed and also update Cyan SLider when Yellow slider is changed
    if (color === 'Green' || color === 'Blue' || color === 'Yellow' || color === 'Magenta') {
        // setCyan(Math.round((newGreen + newBlue) / 2));
        setCyan(Math.round(newGreen + (newBlue - newGreen) / 2)); // Corrected formula
    }


    // Update Magenta slider position when Red slider or Blue slider position is changed and also update Magenta SLider when Yellow slider is changed
    if (color === 'Red' || color === 'Blue' || color === 'Yellow' || color === 'Cyan') {
        // setMagenta(Math.round((newRed + newBlue) / 2));
        setMagenta(Math.round(newRed + (newBlue - newRed) / 2)); // Corrected formula
    }
};

    // disable right-click context menu
    useEffect(() => {
        const disableContextMenu = (event) => {
            event.preventDefault();
        };

        document.addEventListener('contextmenu', disableContextMenu);

        return () => {
            document.removeEventListener('contextmenu', disableContextMenu);
        };
    }, []);

    // update slider positions when color values change
    useEffect(() => {
        const calculateAverage = (color1, color2) => Math.round(color1 + (color2 - color1) / 2);

        setBlack(Math.round((red + green + blue) / 3));
        setYellow(calculateAverage(red, green));
        setCyan(calculateAverage(green, blue));
        setMagenta(calculateAverage(red, blue));
    }, [red, green, blue]);

    // ------------------- shapeset Color Controller UI ------------------- //

    const [outputColor, setOutputColor] = useState(outputColorCode); // Initial output color



    let [selectedShape, setSelectedShape] = useState(null); // State to keep track of the selected shape
    //console.log('Selected Shape:', selectedShape)

    // Color change Function to handle changing the output color for a specific shape
    const handleColorChange = (newColor) => {
        setOutputColor(
            newColor
        );
        // If a shape is selected update its color, if multiple shape selected updated multiple shape color (selextedShape is an array)
        if (selectedShape !== null ) {
            const newShapeColors = [...shapeColors]; // Create a copy of shapeColors
            if (Array.isArray(selectedShape)) {
                selectedShape.forEach((index) => {
                    newShapeColors[index] = newColor; // Update the color of the selected shape
                });
            } else {
                newShapeColors[selectedShape] = newColor; // Update the color of the selected shape
            }
            setShapeColors(newShapeColors); // Update shapeColors state
        }
    };

    // call handleColorChange when any of the color sliders are changed
    useEffect(() => { handleColorChange(outputColorCode); }, [outputColorCode]);


    // ------------------------------------ CLONE COLOR ------------------------------------ //

    const [clonedOutputColor, setClonedOutputColor] = useState(null);

    //console.log('Background Color:', backgroundColor)

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.shiftKey && selectedShape !== null ) {
               if (Array.isArray(selectedShape)) {
                    setClonedOutputColor(shapeColors[selectedShape[0]]);
               } else {
                    setClonedOutputColor(shapeColors[selectedShape]);
                }
            } 
        };

        const handleKeyUp = (event) => {
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
    //}, [selectedShape, shapeColors, backgroundColor]);
    }, [selectedShape, shapeColors]); 

    //console.log('clonedOutputColor', clonedOutputColor);

    //-------------------------------- long press event handler ---------------------//

    const handlePressColorClone = () => {
        if (selectedShape !== null ) {
            if (Array.isArray(selectedShape)) {
                setClonedOutputColor(shapeColors[selectedShape[0]]);
            } else {
                setClonedOutputColor(shapeColors[selectedShape]);
            }
        } 
    };
    
    const handlePressColorReset = () => {
        if (selectedShape !== null) {
            setClonedOutputColor(null);
        }
    };

    // ------------------------------------ SELECT SHAPE ------------------------------------ //
    // Function to handle selecting a shape

   const handleShapeClick = (index) => {
    let newShapeColors = [...shapeColors];
    let selectedShapes = Array.isArray(selectedShape) ? [...selectedShape] : [selectedShape];

    const updateSliders = (color) => {
        if (color === 'rgb(0,0,0)' || color === 'rgb(255,255,255)') {
            const value = color === 'rgb(0,0,0)' ? 0 : 255;
            setRed(value);
            setGreen(value);
            setBlue(value);
            setCyan(value);
            setMagenta(value);
            setYellow(value);
            setBlack(value);
        } else if (color) {
            const [r, g, b] = color.match(/\d+/g).map(Number);
            setRed(r);
            setGreen(g);
            setBlue(b);
        }
    };

    if (clonedOutputColor !== null) {
        newShapeColors[index] = clonedOutputColor;
        setShapeColors(newShapeColors);
        selectedShapes.push(index);
        setSelectedShape(selectedShapes);
        updateSliders(clonedOutputColor);
    } else {
        setSelectedShape(index);
        updateSliders(shapeColors[index]);
    }
};

/*----------------------- LONG PRESS EVENT HANDLER -----------------------*/


    //----------SVG shape drawing with shape select alpha change  -----------------//

    const Shape = ({ shapeNum, color, handleShapeClick, handlePressColorClone }) => {
        const handleLongPress = useLongPress(() => handleShapeClick(shapeNum), {isPreventDefault: true, delay: 500});
        return (
            <rect
                width='100%'
                height='100%'
                fill= {color} 
                className="cursor-pointer shadow-none border-none hover:border-none "
                onMouseDown={(e) => { 
                    e.target.style.opacity = 0.5; 
                }}
                onMouseUp={(e) => { e.target.style.opacity = 1; }}
                onClick={() => handleShapeClick(shapeNum)}
                onTouchStart={(e) => { 
                    e.preventDefault(); 
                    e.target.style.opacity = 0.5; 
                    e.target.style.WebkitTouchCallout = 'none'; 
                    e.target.style.WebkitUserSelect = 'none'; 
                    e.target.style.KhtmlUserSelect = 'none'; 
                    e.target.style.MozUserSelect = 'none'; 
                    e.target.style.msUserSelect = 'none';        
                }}
                onTouchEnd={(e) => {
                    e.preventDefault();
                    e.target.style.opacity = 1;
                    handleShapeClick(shapeNum);
                }}
                onContextMenu={(e) => {
                    e.preventDefault();
                }}
            />
        );
    };

/*const createGrid = (row, col, width, height, hSpace, vSpace) => {
    let gridArray = [];
    // Loop to create grid shapes
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const shapeNum = (i * col + j)+1;
            gridArray.push(
                <svg key={`${i}-${j}`} width={width} height={height} style={{ margin: `${vSpace / 2}px ${hSpace / 2}px` }} >
                    <Shape 
                        shapeNum={shapeNum} 
                        color={shapeColors[shapeNum]}
                        handleShapeClick={handleShapeClick} 
                        handlePressColorClone={handlePressColorClone}
                    />
                </svg>
            );
        }
    }
    return gridArray;
}*/




useEffect(() => {

    const { gridArray, shapeColors } = createCosmicGrid(col, width, height, vSpace, hSpace);
    setShapeColors(shapeColors);
}, [row, width, height, vSpace, hSpace]);




/*------------------------------------------LAYOUT------------------------------------------*/
/*---------------------------------SVG background shape -----------------------------------*/

    return (
        <div
            id='main-div'
            className=" min-h-[100vh] w-full relative pb-10 flex justify-center items-center"
            style={{ position: 'relative', userSelect: 'none', touchAction: 'manipulation' }} >
            
            <svg ref={backgroundShape}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',userSelect: 'none', touchAction: 'manipulation', WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
        onContextMenu={(e) => { e.preventDefault();  }}
        onMouseDown={(e) => { e.preventDefault();  }}
        onMouseUp={(e) => { e.preventDefault();  }}
        onTouchStart={(e) => { e.preventDefault();}}
        onTouchEnd={(e) => { e.preventDefault();  }}
    >
        <Shape 
            shapeNum={0} 
            color={backgroundColor} 
            handleShapeClick={handleShapeClick} 
            handlePressColorClone={handlePressColorClone}
            
        />
    </svg>

            <div className="flex items-center justify-center gap-10 scale-90 lg:scale-100 relative top-5">
                {
                    <div
                        style={
                            {
                                display: 'grid',
                                gridTemplateColumns: `repeat(${col}, 1fr)`,
                            }
                        }
                        //className={` ${gridClass}`}'
                        //{createGrid(row, col, width, height, hSpace, vSpace)}  //working example
                       //   {createGrid(row, col, width, height, hSpace, vSpace)} 
                       
                       
                      
                    >
                       
                       {createCosmicGrid(row, height, width, hSpace, vSpace)}

                    </div>
                }
            </div>

            {/* --------------- SLIDER PANEL ---------------- */}

            <div className="flex flex-col justify-center bg-background pt-10 rounded-2xl absolute scale-90 bottom-8 right-0 lg:scale-90 lg:bottom-9"  data-slider-panel >
    
               <div className="flex items-center flex-wrap pl-3" style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>
                    <ColorSlider svg="/GS_handle.svg" color="white" value={black} onChange={(value) => handleSliderChange('Black', value)} />
                    <ColorSlider svg="/R_handle.svg" color="Red" value={red} onChange={(value) => handleSliderChange('Red', value)} />
                    <ColorSlider svg="/Y_handle.svg" color="Yellow" value={yellow} onChange={(value) => handleSliderChange('Yellow', value)} />
                    <ColorSlider svg="/G_handle.svg" color="Green" value={green} onChange={(value) => handleSliderChange('Green', value)} />
                    <ColorSlider svg="/C_handle.svg" color="Cyan" value={cyan} onChange={(value) => handleSliderChange('Cyan', value)} />
                    <ColorSlider svg="/B_handle.svg" color="Blue" value={blue} onChange={(value) => handleSliderChange('Blue', value)} />
                    <ColorSlider svg="/M_handle.svg" color="Magenta" value={magenta} onChange={(value) => handleSliderChange('Magenta', value)} />  
                    </div>
                <div className="flex justify-center items-center gap-1 pt-7">
                    <div className='bg-[#A9A9A9] dark:bg-zinc-600 text-white text-center w-1/2 p-3 rounded-bl-2xl select-none'>
                        <h2>
                            {
                                `${red}.${green}.${blue}`
                            }
                        </h2>
                    </div>
                    <div className='bg-[#565656]  text-white text-center w-1/2 p-3 rounded-br-2xl select-none'>
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
};

export default ColorControllerUI_cosmic;