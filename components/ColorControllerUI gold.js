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
const ColorControllerUI = ({ row, col, width, height, hSpace, vSpace, bgColor = 'rgb(255,255,255)' , initShapeColors }) => {

    const [red, setRed] = useState(0);
    const [green, setGreen] = useState(0);
    const [blue, setBlue] = useState(0);
    const [black, setBlack] = useState(0);
    const [yellow, setYellow] = useState(0); // Corrected state variable
    const [cyan, setCyan] = useState(0); // Corrected state variable
    const [magenta, setMagenta] = useState(0); // Corrected state variable

   //const backgroundColor = 'rgb(255,255,255)'; // Initial background color

    //set up refs and vars for init background color
    const backgroundShape = useRef(null);  //DW: reference to the background SVG shape
    const [backgroundColor, setBackgroundColor] = useState(bgColor || 'rgb(255,255,255)'); 


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

    useEffect(() => {

        // Update Black slider position
        const newBlack = Math.round((red + green + blue) / 3);
        setBlack(newBlack);

        // Update Yellow slider position when Red slider or Green slider position is changed and also update Yellow SLider when Magenta slider is changed
        // setYellow(Math.round((red + green) / 2));
        setYellow(Math.round(red + (green - red) / 2)); // Corrected formula

        // Update Cyan slider position when Green slider or Blue slider position is changed and also update Cyan SLider when Yellow slider is changed
        // setCyan(Math.round((green + blue) / 2)); 
        setCyan(Math.round(green + (blue - green) / 2)); // Corrected formula

        // Update Magenta slider position when Red slider or Blue slider position is changed and also update Magenta SLider when Yellow slider is changed
        // setMagenta(Math.round((red + blue) / 2));
        setMagenta(Math.round(red + (blue - red) / 2)); // Corrected formula

    }, [red, green, blue]);




    // ------------------- GRID Color Controller UI ------------------- //

   



    const [outputColor, setOutputColor] = useState(outputColorCode); // Initial output color
    //const [shapeColors, setShapeColors] = useState(Array(shapeNum).fill(initColor)); // Array to store colors of each shape
const [shapeColors, setShapeColors] = useState(
  Array.from({ length: shapeNum }, (_, i) => initShapeColors ? initShapeColors[i % initShapeColors.length] : initColor)
);
    let [selectedShape, setSelectedShape] = useState(null); // State to keep track of the selected shape

    console.log('Selected Shape:', selectedShape)


    // Function to handle changing the output color for a specific shape

    const handleColorChange = (newColor) => {
        setOutputColor(
            newColor
        );
        // If a shape is selected update its color, if multiple shape selected updated multiple shape color (selextedShape is an array)
        if (selectedShape !== null && selectedShape !== 'background') {
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
    useEffect(() => {
        handleColorChange(outputColorCode);
    }, [outputColorCode]);


    // ------------------------------------ CLONE COLOR ------------------------------------ //


    const [clonedOutputColor, setClonedOutputColor] = useState(null);


    console.log('Background Color:', backgroundColor)


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.shiftKey && selectedShape !== null && selectedShape !== 'background') {

                // setClonedOutputColor(shapeColors[selectedShape]);
                //    selected shape either can be a single value or can be an array of values


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


    console.log('clonedOutputColor', clonedOutputColor);



    // ------------------------------------ SELECT SHAPE ------------------------------------ //
    // Function to handle selecting a shape

    const handleShapeClick = (index) => {
        // if any cloned color is present, set the cloned color to the selected shape for background and shapes

        if (clonedOutputColor !== null && selectedShape !== 'background') {


            const newShapeColors = [...shapeColors]; // Create a copy of shapeColors
            newShapeColors[index] = clonedOutputColor; // Update the color of the selected shape
            setShapeColors(newShapeColors); // Update shapeColors state



            // COMBINED LOGIC FOR SELECTING MULTIPLE SHAPES

            let selectedShapes = [];
            // if the selected shape is not an array, then push the selected shape to the selectedShapes array
            if (!Array.isArray(selectedShape)) {
                selectedShapes.push(selectedShape);
            }

            // if the selected shape is an array, then push all the selected shapees to the selectedShapes array
            if (Array.isArray(selectedShape)) {
                selectedShapes = selectedShape;
            }

            // push the clicked shape to the selectedShapes array
            selectedShapes.push(index);

            setSelectedShape(selectedShapes); // Update the selected shape state

            //update the sliders values according to the cloned color values

            if (clonedOutputColor === 'rgb(0,0,0)') {
                setRed(0);
                setGreen(0);
                setBlue(0);
                setCyan(0);
                setMagenta(0);
                setYellow(0);
                setBlack(0);
            } else if (clonedOutputColor === 'rgb(255,255,255)') {
                setRed(255);
                setGreen(255);
                setBlue(255);
                setCyan(255);
                setMagenta(255);
                setYellow(255);
                setBlack(255);
            } else {
                //extract the RGB values from the color string and update the sliders
                const [r, g, b] = clonedOutputColor.match(/\d+/g);
                setRed(parseInt(r));
                setGreen(parseInt(g));
                setBlue(parseInt(b));
            }

        } else if (clonedOutputColor !== null && selectedShape === 'background') {

            // use background color for the selected shape not the cloned color
            const newShapeColors = [...shapeColors]; // Create a copy of shapeColors
            newShapeColors[index] = clonedOutputColor; // Update the color of the selected shape
            setShapeColors(newShapeColors); // Update shapeColors state

            setSelectedShape(index); // Update the selected shape state

            // set the sliders values to the cloned color values

            if (clonedOutputColor === 'rgb(0,0,0)') {
                setRed(0);
                setGreen(0);
                setBlue(0);
                setCyan(0);
                setMagenta(0);
                setYellow(0);
                setBlack(0);
            } else if (clonedOutputColor === 'rgb(255,255,255)') {
                setRed(255);
                setGreen(255);
                setBlue(255);
                setCyan(255);
                setMagenta(255);
                setYellow(255);
                setBlack(255);
            } else {
                // Extract the RGB values from the color string and update the sliders
                const [r, g, b] = clonedOutputColor.match(/\d+/g);
                setRed(parseInt(r));
                setGreen(parseInt(g));
                setBlue(parseInt(b));
            }


        }

        else {
            setSelectedShape(index); // Update the selected shape state

            // set the slider values to the selected shape color values
            if (shapeColors[index] === 'rgb(0,0,0)') {
                setRed(0);
                setGreen(0);
                setBlue(0);
                setCyan(0);
                setMagenta(0);
                setYellow(0);
                setBlack(0);
            } else if (shapeColors[index] === 'rgb(255,255,255)') {
                setRed(255);
                setGreen(255);
                setBlue(255);
                setCyan(255);
                setMagenta(255);
                setYellow(255);
                setBlack(255);
            } else if (shapeColors[index]) {
                // Extract the RGB values from the color string and update the sliders
                const rgbValues = shapeColors[index].match(/\d+/g);
                const [r, g, b] = rgbValues;
                setRed(parseInt(r));
                setGreen(parseInt(g));
                setBlue(parseInt(b));
            }
        }
    };


    // -------------------------SELECT BACKGROUND SHAPE-------------------------//

    // Function to select the background shape and change the background color
    const handleBackgroundClick = () => {
        setSelectedShape('background');


        // if there is any cloned color, set the cloned color to the background color
        if (clonedOutputColor !== null) {
            setBackgroundColor(clonedOutputColor);
        } else {

            // set the sliders values to the background color values
            if (backgroundColor === 'rgb(0,0,0)') {
                setRed(0);
                setGreen(0);
                setBlue(0);
                setCyan(0);
                setMagenta(0);
                setYellow(0);
                setBlack(0);
            } else if (backgroundColor === 'rgb(255,255,255)') {
                setRed(255);
                setGreen(255);
                setBlue(255);
                setCyan(255);
                setMagenta(255);
                setYellow(255);
                setBlack(255);
            } else {
                // Extract the RGB values from the color string and update the sliders
                const [r, g, b] = backgroundColor?.match(/\d+/g);
                setRed(parseInt(r));
                setGreen(parseInt(g));
                setBlue(parseInt(b));
            }
        }
    };




    //----------SVG shape drawing ORIG -----------------//
    /*   const createGrid = (row, col, width, height, hSpace, vSpace) => {
           let gridArray = [];
           // Loop to create grid shapes
           for (let i = 0; i < row; i++) {
               for (let j = 0; j < col; j++) {
                   gridArray.push(
                       <svg key={`${i}-${j}`} width={width} height={height} style={{ margin: `${vSpace / 2}px ${hSpace / 2}px` }}>
                           <rect
                               width='100%'
                               height='100%'
                               fill={shapeColors[i * col + j]}
                               //className="cursor-pointer shadow-none border-none hover:border-none btn rounded-none"
                               //--------------DW: btn in className affects height of the SVG, removed it-----------------//
                               className="cursor-pointer shadow-none border-none hover:border-none "
                               onClick={() => handleShapeClick(i * col + j)}
                           />
                       </svg>
                   );
               }
           }
           return gridArray;
       } */


    //----------SVG shape drawing with shape select alpha change  -----------------//
    const createGrid = (row, col, width, height, hSpace, vSpace) => {
        let gridArray = [];
        // Loop to create grid shapes
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

 

    // ------------------------------- Background color functionality ------------------------------- //


    // When selected shape is 'background' update the background color

    useEffect(() => {
        if (selectedShape === 'background') {
            setBackgroundColor(outputColor);
        }

    }
        , [selectedShape, outputColorCode, backgroundColor, clonedOutputColor]);




    // Determine appropriate grid structure based on grid number

    //------------------------DW: deprecated, please remove ------------------------//
    const gridClass =
        shapeNum === 1
            ? ""
            : shapeNum === 2
                ? "grid-cols-2"
                : shapeNum > 2 && shapeNum <= 3
                    ? "grid-cols-3"
                    : shapeNum === 4
                        ? "grid-cols-2"
                        : shapeNum >= 5 && shapeNum <= 9
                            ? "grid-cols-3"
                            : shapeNum >= 10 && shapeNum <= 12
                                ? "grid-cols-4"
                                : "grid-cols-5";



    /*-------------------DW: added SVG background shape -------------------*/

    return (
        <div
            id='main-div'
            className=" min-h-[100vh] w-full relative pb-10 flex justify-center items-center"
            style={{ position: 'relative' }} >
            
            <svg ref={backgroundShape}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                onClick={() => handleBackgroundClick()}
            >
                <rect
                    width="100%"
                    height="100%"
                    //--------------------DW: showing SVG is working -------------------//
                    //fill={"#ab78ab"}
                    fill={backgroundColor} //default bg color

                    className="cursor-pointer"
                //----------------------------DW: trying to add click hander here, doesn't work --------------------------//

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
                        className={` ${gridClass}`}
                    >
                        {createGrid(row, col, width, height, hSpace, vSpace)}
                    </div>
                }
            </div>




            {/* --------------- SLIDER PANEL ---------------- */}


            <div className="flex flex-col justify-center bg-background pt-10 rounded-2xl absolute scale-75 bottom-5 right-0 lg:scale-90 lg:bottom-9" > 

                
                <div className="flex items-center flex-wrap pl-3">
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


};

export default ColorControllerUI;






