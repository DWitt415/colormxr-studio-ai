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
const col = 1;
const width = 250;
const height = 250;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(207,207,207)';

function page() {

    let lesson = 'Colormixing 101'
    let title = "'Phantom' complementary colors"
    
    // Instruction Modal Control
    const shouldShowModal = useInstructionModalControl();
    let [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
    
    // Update modal state when shouldShowModal changes
    useEffect(() => {
        setIsInstructionModalOpen(shouldShowModal);
    }, [shouldShowModal]);

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
                            <BoldText>'Phantom' complementary colors</BoldText>
                        </ExText>
                    </Slide>
                    <Slide key="slide-1">
                        <ExText TopMargin>
                            Using the colormixer interface, select the shape and make it <BoldText>Red</BoldText>.
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            Stare at it steadily for 8-10 seconds without looking away.
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            When you're ready, click the background and then shift-select the Red shape to clone the background color.
                        </ExText>
                    </Slide>
                    <Slide key="slide-4">
                        <ExText TopMargin>
                            Still looking at the screen, you should see the phantom complementary color -<BoldText>Cyan</BoldText>- on the <BoldText>Gray</BoldText> background. (This effect works best on White and light Gray backgrounds)
                        </ExText>
                    </Slide>
                    <Slide key="slide-5">
                        <ExText TopMargin>
                            The color is generated subconsciously by your brain!
                        </ExText>
                    </Slide>
                    <Slide key="slide-6">
                        <ExText TopMargin>
                            <BoldText>Options:</BoldText> Try this with any primary or secondary color.
                        </ExText>
                    </Slide>
                    <Slide key="slide-7">
                        <ExText TopMargin> 
                            <BoldText>Bonus:</BoldText> You can also try looking at a blank White wall after staring at the color for a few seconds. Same effect:) 
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    );
}

export default page;