'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

const row = 6;
const col = 10;
const width = 100;
const height = 100;
const hSpace = 0;
const vSpace = 20;
const backgroundColor = 'rgb(230,230,230)';
const initHexShapeColors = [
    0xAFAFAF,
    0xB4B4B4,
    0xB9B9B9,
    0xC3C3C3,
    0xD2D2D2,
    0xDCDCDC,
    0xD2D2D2,
    0xBEBEBE,
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
    let title = "Basic gradient building"

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
    <ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} initShapeColors={initShapeColors} onInstructionClose={instructionModalClose}  />
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
                        This is the basic gradient-building method; using the colormixer interface and shapeset:
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        1. Starting on the left, color the first shape <BoldText>Black</BoldText>.
                    </ExText>
                    <ExText TopMargin>
                        2. Shift-select the next shape to clone the color on to it, then click it again to deselect the first shape.
                    </ExText>
                    <ExText TopMargin>
                        3. Drag the Black slider up to lighten the color, until you see contrast between the first two shapes.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        4. Clone this color onto the next shape, select it, and adjust the grayscale slider upwards, creating contrast between the two shapes.
                    </ExText>
                    <ExText TopMargin>
                        Less contrast = more steps in the gradient.
                    </ExText>
                    <ExText TopMargin>
                        5. Repeat, moving right, until you reach the end at or near pure <BoldText>White</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        <div className="text-sm">
                            <BoldText>Tip:</BoldText> To clear the shape colors and start another gradient, hit the 'refresh' button in your browser.
                        </div>
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page