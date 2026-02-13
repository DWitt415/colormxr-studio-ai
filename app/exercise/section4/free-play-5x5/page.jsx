'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

const row = 5;
const col = 5;
const width = 100;
const height = 100;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(255,255,255)';
const initShapeColors = [
    'rgb(185,185,185)',
    'rgb(195,195,195)',
    'rgb(210,210,210)',
    'rgb(195,195,195)',
    'rgb(185,185,185)',
    'rgb(195,195,195)',
    'rgb(210,210,210)',
    'rgb(200,200,200)',
    'rgb(210,210,210)',
    'rgb(195,195,195)',
    'rgb(210,210,210)',
    'rgb(220,220,220)',
    'rgb(185,185,185)',
    'rgb(220,220,220)',
    'rgb(210,210,210)',
    'rgb(195,195,195)',
    'rgb(210,210,210)',
    'rgb(195,195,195)',
    'rgb(210,210,210)',
    'rgb(195,195,195)',
    'rgb(185,185,185)',
    'rgb(195,195,195)',
    'rgb(210,210,210)',
    'rgb(195,195,195)',
    'rgb(185,185,185)',
];

function page() {
    let lesson = 'Color composition'
    let title = "Free play - 5x5 grid"

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
                        Using the colormixer interface and cosmic grid layout, experiment with <BoldText>complementary</BoldText> (opposing) or <BoldText>analogous</BoldText> (close) color variations.
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Experiment with high and low contrast, paying attention to how the perception of the middle shape color changes with the surrounding color.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        You can choose to have the center color be the same as the outer color, or set to its complementary, or even a third color.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        The middle band can be complementary, analogous or grayscale.
                    </ExText>
                </Slide>
                <Slide key="slide-5">
                    <ExText TopMargin>
                        How do the surrounding colors affect the center color? Can you make it shine like a jewel? Can you make it vibrate? Can you make it disappear?
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page