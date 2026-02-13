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
const col =1;
const width = 250;
const height = 250;
const hSpace = 20;
const vSpace = 20;


function page() {

    let lesson = 'Color harmony and contrast'
    let title ='Experimenting with hue, saturation and lightness'
    // Flag to indicate this exercise uses slideshow instructions

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
                <div className='flex justify-center items-center w-full'>
                    <ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} 
                    onInstructionClose={instructionModalClose}/>
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
                        onClick={instructionModalOpen}
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
                style={{zIndex: 999, color: "#ABABAB"}}
            >
                <Slide key="slide-0">
                    <ExText TopMargin>
                        <BoldText>{title}</BoldText>
                    </ExText>
                </Slide>
                <Slide key="slide-1">
                    <ExText TopMargin>
                        Using the colormixer interface, change the shape color to any <BoldText>primary</BoldText> or <BoldText>secondary</BoldText> color: 
                        <BoldText> Red</BoldText>, <BoldText>Green</BoldText>, <BoldText>Blue</BoldText>, <BoldText>Cyan</BoldText>, <BoldText>Magenta</BoldText>, <BoldText>Yellow</BoldText>
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Then experiment with desaturation and lightness by tinting and shading, taking time to notice the effects of the changes as you go along.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        <BoldText>Tinting</BoldText>: moving towards <BoldText>White</BoldText> by adding the <BoldText>complementary</BoldText>
                    </ExText>
                    <ExText TopMargin>
                        <BoldText>Shading</BoldText>: moving towards <BoldText>Black</BoldText> by removing the <BoldText>primary</BoldText>
                    </ExText>
                    <ExText TopMargin>
                        <BoldText>Desaturation</BoldText>: removing Hue by removing the primary or adding the secondary
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        Next, experiment with changing the background color to <BoldText>Black</BoldText> or Gray while you make the same color adjustments.
                    </ExText>
                    <ExText TopMargin>
                        Repeat the exercise with different colors of your choosing*
                    </ExText>
                </Slide>
                <Slide key="slide-5">
                    <ExText TopMargin>
                        <div className="text-sm">
                            Note: If you do complex 3 color channels, you will need to manually tinting and shade using the individual <BoldText>Red</BoldText> <BoldText>Green</BoldText> or <BoldText>Blue</BoldText> sliders to adjust the color up or down. 
                        </div>
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page
