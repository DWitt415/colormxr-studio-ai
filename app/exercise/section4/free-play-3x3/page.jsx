"use client"
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InstructionModalV from '@/components/Modals/InstructionModalV'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

const row = 3;
const col = 3;
const width = 150;
const height = 150;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(255,255,255)';
const initShapeColors =  [  
    'rgb(180, 180, 180)', 
    'rgb(180, 180, 180)', 
    'rgb(180, 180, 180)', 
    'rgb(180, 180, 180)', 
    'rgb(210, 210, 210)',
    'rgb(180, 180, 180)', 
    'rgb(180, 180, 180)', 
    'rgb(180, 180, 180)', 
    'rgb(180, 180, 180)'
]; 

function page() {
    let lesson = 'Color composition'
    let exerciseNumber = 'exercise 5.3'
    let title = "Free play - 3x3 grid"
	
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
                exerciseNumber={exerciseNumber}
                title={title}
            />
                <SlideInstructionModal
                    isOpen={isInstructionModalOpen}
                    closeModal={instructionModalClose}
                    style={{ zIndex: 999, color: "#ABABAB" }}>
                    <Slide key="slide-0">
                        <ExText TopMargin>
                            <BoldText>{title}</BoldText>
                        </ExText>
                    </Slide>
                    <Slide key="slide-1">
                        <ExText TopMargin>
                            This exercise is free play on a 3x3 grid.
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            1. Use the colormixer interface to experiment with colors and gradients.
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
 
        </div>
    )
}

export default page