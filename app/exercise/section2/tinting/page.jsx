'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

const row = 1;
const col = 10;
const width = 100;
const height = 100;
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
    let title = "Tinting primary and secondary gradients"

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
                        Use the basic gradient-building process to make gradient strips for each of the primary colors:
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        <BoldText>Red</BoldText>, <BoldText>Green</BoldText>, <BoldText>Blue</BoldText>
                    </ExText>
                    <ExText TopMargin>
                        Then repeat for each of the secondary colors:
                    </ExText>
                    <ExText TopMargin>
                        <BoldText>Cyan</BoldText>, <BoldText>Magenta</BoldText>, <BoldText>Yellow</BoldText>
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        Tint each color as you move left to right, from the solid color to <BoldText>White</BoldText>.
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