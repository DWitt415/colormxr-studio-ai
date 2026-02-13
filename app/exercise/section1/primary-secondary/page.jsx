'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'


const row = 2;
const col =3;
const width = 150;
const height = 150;
const hSpace = 20;
const vSpace = 20;


function page() {

    let lesson = 'Colormixing 101'
    let title ='Mixing primary and secondary colors'


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
                            Following the lesson, using color cloning, you will create the secondary colors <BoldText>Cyan</BoldText>, <BoldText>Magenta</BoldText>, <BoldText>Yellow</BoldText> from the primary colors.
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            1. Color the top row shapes the primary colors: <BoldText>Red</BoldText>, <BoldText>Green</BoldText>, <BoldText>Blue</BoldText>
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            2. Select the Red shape, hold down the <BoldText>Shift</BoldText> key and click on the shape below it to make it <BoldText>Red</BoldText>.
                        </ExText>
                        <ExText TopMargin>
                            3. Click on the shape again to select just it.
                        </ExText>
                    </Slide>
                    <Slide key="slide-4">
                        <ExText TopMargin>
                            4. Use the colormixer interface to add <BoldText>Green</BoldText> to the <BoldText>Red</BoldText> shape; You now have <BoldText>Yellow</BoldText>, which is a secondary color, being the mix of two primary channel colors, <BoldText>Red</BoldText> and <BoldText>Green</BoldText>.
                        </ExText>
                    </Slide>
                    <Slide key="slide-5">
                        <ExText TopMargin>
                            5. Repeat this process with <BoldText>Green</BoldText>, adding <BoldText>Blue</BoldText> to create <BoldText>Cyan</BoldText>.
                        </ExText>
                    </Slide>
                    <Slide key="slide-6">
                        <ExText TopMargin>
                            6. Finally, clone <BoldText>Blue</BoldText>, adding <BoldText>Red</BoldText> to create <BoldText>Magenta</BoldText>.
                        </ExText>
                    </Slide>
                    <Slide key="slide-7">
                        <ExText TopMargin>  
                            Now, you can see how secondary colors are derived from mixing two primary colors.
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    )
}

export default page
