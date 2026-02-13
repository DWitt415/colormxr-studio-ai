'use client'
import React, { useState } from 'react'
import Header from '@/components/Header'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'


const row = 1;
const col = 1;
const width = 200;
const height = 200;
const hSpace = 0;
const vSpace = 0;


function page() {

    let lesson = 'Colormixing 101'
    let title ="Mixing a single primary color"

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
                    <ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} onInstructionClose={instructionModalClose}  />
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
                            Select the center shape, then use the colormixer interface to change its color:
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            One at a time, mix the Primary colors - <BoldText>Red</BoldText>, <BoldText>Green</BoldText>, <BoldText>Blue</BoldText> using the Red slider, Green slider, and Blue slider.
                        </ExText>
                
                        <ExText TopMargin>
                            Use the <BoldText>Grayscale</BoldText> slider to return to <BoldText>Black</BoldText> between each color mix.
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            <BoldText>Background color interaction:</BoldText> With each primary color, select the background and use the Grayscale slider to change the background color to Black, White or Gray. 
                        </ExText>
                        <ExText TopMargin>
                            Notice how your perception of the primary color changes, depending on the background color.
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    )
}

export default page