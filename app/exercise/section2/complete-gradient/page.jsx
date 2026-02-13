'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

const row = 18;
const col = 1;
const width = 1800;
const height = 45;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(230,230,230)';
const initHexShapeColors = [
    0xAFAFAF,
    0xB4B4B4,
    0xB9B9B9,
    0xC3C3C3,
    0xD2D2D2,
    0xDCDCDC,
    0xD2D2D2,
    0xC8C8C8,
    0xD2D2D2,
    0xAFAFAF,
    0xB4B4B4,
    0xB9B9B9,
    0xC3C3C3,
    0xD2D2D2,
    0xDCDCDC,
    0xD2D2D2,
    0xC8C8C8
];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);

function page() {
    let lesson = 'Building color transitions'
    let title = "Building complete color gradients"

    // Instruction Modal Control
    useInstructionModalControl();
    let [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
    function instructionModalOpen() {
        setIsInstructionModalOpen(true)
    }

    function instructionModalClose() {
        setIsInstructionModalOpen(false)
    }

    // Info button toggle logic
    function handleInfoButtonClick() {
        setIsInstructionModalOpen((prev) => !prev);
    }

    return (
        <div>
            <Header />
            <div className='h-[70vh] lg:h-[91vh] relative'>
                <div className='flex justify-center items-center w-full '>
                    <ColorControllerUI 
                        row={row} 
                        col={col} 
                        width={width} 
                        height={height} 
                        hSpace={hSpace} 
                        vSpace={vSpace} 
                        bgColor={backgroundColor} 
                        initShapeColors={initShapeColors} 
						onInstructionClose={instructionModalClose}
                    />
				    <ExerciseIconsPanel 
				        config={{
				            features: {
				                importSVG: false,
				                exportPalette: true,
				                exportComposition: true
				            }
				        }}
				        row={row}
				        col={col}
				    />
                    <div
                        onClick={handleInfoButtonClick}
                        className='cursor-pointer fixed bottom-12 left-5'
                    >
                        <img src="/info.svg" alt="" className='' />
                    </div>
                </div>
            </div>
            <Footer
                lesson={lesson}
                title={title}
            />
            <SlideInstructionModal
                isOpen={isInstructionModalOpen}
                closeModal={instructionModalClose}
                style={{zIndex: 999, color: "#ABABAB"}}>
                <Slide key="slide-0">
                    <ExText TopMargin>
                        <BoldText>{title}</BoldText>
                    </ExText>
                </Slide>
                <Slide key="slide-1">
                    <ExText TopMargin>
                        Create a complete vertical gradient, tinting and shading, in a single layout:
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Starting at the central <BoldText>Magenta</BoldText> shape, clone the color on the shape below, select it and shade ittowards <BoldText>Black</BoldText> by removing Magenta.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        Next, starting at the center, clone upwards and tint towards <BoldText>White</BoldText> by adding the complementary color, <BoldText>Green</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
						Now, you have a complete one color gradient that goes from Black to pure Magenta to White, showing all of the tints and shades of Magenta, with a pure hue at the center. This shows you the available range of color appearances of Magenta. 
                    </ExText>
                </Slide>
                <Slide key="slide-5">
                    <ExText TopMargin>
                        Try this exercise with other primary and secondary colors, to get a feel for the color variations of each as they are tinted and shaded.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page