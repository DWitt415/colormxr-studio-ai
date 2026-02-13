'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'
import { useInstructionModalControl } from '@/utils/modalControl'

const row = 1;
const col = 40;
const width = 50;
const height = 800;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(230,230,230)';
const initHexShapeColors = [
    '0xAFAFAF',
    '0xB4B4B4',
    '0xB9B9B9',
    '0xC3C3C3',
    '0xD2D2D2',
    '0xDCDCDC',
    '0xD2D2D2',
    '0xBEBEBE',
];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);


function page() {

    let lesson = 'Color creation / meditation'
    let title = "Horizontal full gradient"


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

            <div className=' h-[70vh] lg:h-[91vh] relative'>
                <div className='flex justify-center items-center w-full '>
                    <ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} bgColor={backgroundColor} initShapeColors={initShapeColors} onInstructionClose={instructionModalClose} />
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
                closeModal={instructionModalClose}>
                    <Slide key="slide-0">
                        <ExText TopMargin>
                            <BoldText>{title}</BoldText>
                        </ExText>
                    </Slide>
                    <Slide key="slide-1">
                        <ExText TopMargin>
                            Create a full horizontal gradient using the 40 shape grid.
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            <BoldText>Colors to use:</BoldText> Violet, Blue, Gray, Yellow, White
                        </ExText>
                        <ExText TopMargin>
                            Work with tints and shades to create smooth transitions.
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            <BoldText>Gradient sequence:</BoldText>
                        </ExText>
                        <ExText TopMargin>
                            Start with <BoldText>Violet</BoldText> → transition to <BoldText>Gray</BoldText> → transition to <BoldText>Yellow</BoldText> → transition to <BoldText>White</BoldText> → end with <BoldText>Blue</BoldText>
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    )
}

export default page
