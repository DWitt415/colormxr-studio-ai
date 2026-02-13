'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

const row = 7;
const col = 7;
const width = 100;
const height = 100;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(255,255,255)';
const initShapeColors = [
    'rgb(164,164,238)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(79, 79, 79)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(164,164,238)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(240, 240, 240)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(50, 50, 203)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(240, 240, 240)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(164,164,238)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(79, 79, 79)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(164,164,238)'
];

function page() {
    let lesson = 'Color composition'
    let title = "Creating a complex gradient grid"

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
                        This exercise creates a complex grid composition with compressed gradients running in two dimensions.
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        1. Using the colormixer interface and grid layout, start in the center and build a horizontal gradient to the edge shape.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        2. Build a horizontal gradient from top center to the right edge.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        3. From each step in that horizontal gradient, build a vertical gradient between the two horizontal gradients.
                    </ExText>
                </Slide>
                <Slide key="slide-5">
                    <ExText TopMargin>
                        4. Continue this process until you reach the edge of the grid.
                    </ExText>
                </Slide>
                <Slide key="slide-6">
                    <ExText TopMargin>
                        5. Repeat as needed until the grid is colored in.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page