'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InstructionModalV from '@/components/Modals/InstructionModalV'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'
import { useInstructionModalControl } from '@/utils/modalControl'

const row = 1;
const col = 5;
const width = 150;
const height = 350;
const hSpace = 20;
const vSpace = 0;
const backgroundColor = 'rgb(255,255,255)';
const initShapeColors =  [
    'rgb(210, 210, 210)',
    'rgb(210, 210, 210)',
    'rgb(210, 210, 210)',
    'rgb(210, 210, 210)',
    'rgb(210, 210, 210)'
];




function page() {

    let lesson = 'Color composition'
    let exerciseNumber = 'exercise 1.1'
    let title = "Color palette creation"
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
                            1. Mix a color palette using one of these methods:
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            <BoldText>Color sampling</BoldText> - Find an existing color palette on the web and enter its color values manually into the colormixer interface, using the supplied or measured color values.
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            <BoldText>Direct observation</BoldText> - Find an object or an image and try reproducing the colors 'by eye' using the colormixer interface.
                        </ExText>
                    </Slide>
                    <Slide key="slide-4">
                        <ExText TopMargin>
                            2. Make an initial 'factual' or baseline composition, and screenshot it.
                        </ExText>
                    </Slide>
                    <Slide key="slide-5">
                        <ExText TopMargin>
                            3. Work impressionistically with the colors as they are on the screen, using your judgement to edit the colors into more harmonious or striking relationships. Make one or more screenshots during this process.
                        </ExText>
                    </Slide>
                    <Slide key="slide-6">
                        <ExText TopMargin>
                            4. When you are satisfied, open up the saved screenshot images and look at them sequentially. Which do you like best, and why?
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    )
}

export default page