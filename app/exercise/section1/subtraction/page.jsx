'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'

const row = 1;
const col =6;
const width = 150;
const height = 150;
const hSpace = 20;
const vSpace = 20;
const backgroundColor = 'rgb(169,169,169)';
const initHexShapeColors =[0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0xFFFFFF];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);

function page() {

    let lesson = 'Colormixing 101'
    let title ='Color by subtraction'

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
                            Starting on the left, you will color each shape by color subtraction from <BoldText>White</BoldText>:
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            Select the first shape and subtract <BoldText>Red</BoldText>. 
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            Repeat on the next shape and subtract <BoldText>Green</BoldText>.
                        </ExText>
                    </Slide>
                    <Slide key="slide-4">
                        <ExText TopMargin>
                            On the third shape, subtract <BoldText>Blue</BoldText>.
                        </ExText>
                    </Slide>
                    <Slide key="slide-5">
                        <ExText TopMargin>
                            What colors are you left with?
                        </ExText>
                    </Slide>
                    <Slide key="slide-6">
                        <ExText TopMargin>
                            It's the same process for the last 3 <BoldText>White</BoldText> shapes, subtract the secondary color, in order, <BoldText>Yellow</BoldText>, <BoldText>Cyan</BoldText> and <BoldText>Magenta</BoldText>.
                        </ExText>
                    </Slide>
                    <Slide key="slide-7">
                        <ExText TopMargin>
                            Are you seeing a pattern? :)
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    )
}

export default page