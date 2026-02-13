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
const col = 30;
const width = 50;
const height = 150;
const hSpace = 1;
const vSpace = 0;
const backgroundColor = 'rgb(230,230,230)';
const initShapeColors = [
    "rgb(175,175,175)",
    "rgb(180,180,180)",
    "rgb(185,185,185)",
    "rgb(195,195,195)",
    "rgb(210,210,210)",
    "rgb(215,215,215)",
    "rgb(210,210,210)",
    "rgb(215,215,215)",
    "rgb(195,195,195)",
    "rgb(180,180,180)",
    "rgb(185,185,185)",
    "rgb(195,195,195)",
    "rgb(210,210,210)",
    "rgb(205,205,205)",
    "rgb(195,195,195)"
];

function page() {
    let lesson = 'Building color transitions'
    let title = "Creating spectral gradients"

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
                        Using the colormixer interface and pre-defined <BoldText>Red Orange Yellow</BoldText> shapeset, use the spectral gradient technique from Lesson 4:
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        1. Starting with the Red shape, create gradient steps between Red and Orange.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        2. Repeat the same process, creating gradient steps between Orange and Yellow.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        This technique works for any sequential spectral colors:
                    </ExText>
                    <ExText TopMargin>
                        <BoldText>Red</BoldText>, <BoldText>Orange</BoldText>, <BoldText>Yellow</BoldText>, <BoldText>Green</BoldText>, <BoldText>Cyan</BoldText>, <BoldText>Blue</BoldText>, <BoldText>Violet</BoldText>, <BoldText>Magenta</BoldText>
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page