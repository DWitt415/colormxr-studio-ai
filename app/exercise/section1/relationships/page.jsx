'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'


const row = 2;
const col =6;
const width = 150;
const height = 150;
const hSpace = 20;
const vSpace = 20;
const backgroundColor = 'rgb(169,169,169)';
const initHexShapeColors =[0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0x000000, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);

function page() {

    let lesson = 'Colormixing 101'
    let title ='Primary and secondary relationships'
    

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

        // Info button toggle logic
        function handleInfoButtonClick() {
            setIsInstructionModalOpen((prev) => !prev);
        }
    return (
        <div className="h-full overflow-y-hidden">
        <Header />

        <div className=' h-[calc(100vh - 36px)] lg:h-[calc(100vh - 36px)] relative' style={{ margin: 0, padding: 0 }}>
                <div className='flex justify-center items-center w-full '>
                <ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} bgColor={backgroundColor} initShapeColors={initShapeColors} onInstructionClose={instructionModalClose} />
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
                            Using the colormixer interface and a 2 row shape layout:
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            1. From <BoldText>Black</BoldText>, color the top row shapes in this order by adding color:
                        </ExText>
                        <ExText TopMargin>
                            <BoldText>Red</BoldText>, <BoldText>Yellow</BoldText>, <BoldText>Green</BoldText>, <BoldText>Cyan</BoldText>, <BoldText>Blue</BoldText>, <BoldText>Magenta</BoldText>
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            2. Color the bottom row shapes by subtracting these colors, in order:
                        </ExText>
                        <ExText TopMargin>
                            <BoldText>Red</BoldText>, <BoldText>Yellow</BoldText>, <BoldText>Green</BoldText>, <BoldText>Cyan</BoldText>, <BoldText>Blue</BoldText>, <BoldText>Magenta</BoldText>
                        </ExText>
                    </Slide>
                    <Slide key="slide-4">
                        <ExText TopMargin>
                            When you are done, you will have a layout of complementary color pairs. Click on the top and bottom shape while watching the colormixer interface to see the complementary relationship, and how all channels add up to 100%, equalling White.
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    )
}

export default page