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
const col =2;
const width = 150;
const height = 150;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(255,255,255)';
const initHexShapeColors =[0xABABAB, 0xCDCDCD];


function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);

function page() {

    let lesson = 'Colormixing 101'
    let title ='Complex complementary colors'
    

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
    			<ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} initShapeColors={initShapeColors} onInstructionClose={instructionModalClose}  />
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
                            This exercise shows the formula behind deriving complementary colors:
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            1. Select the first shape and use the colormixer to set it to <BoldText>140.55.205</BoldText>
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            2. Select the second shape and set its values so they are complementary</ExText> 
                            <ExText TopMargin>(Both values add up to 255.255.255 = <BoldText>White</BoldText>):</ExText>
                    </Slide>
                    <Slide key="slide-4">
                        <ExText TopMargin>
                            <BoldText>Red</BoldText> = <BoldText>115 </BoldText>      (255 - 140) 
                        </ExText>
                        <ExText TopMargin>
                            <BoldText>Green</BoldText> = <BoldText>178</BoldText> (255 - 55) 
                        </ExText>
                        <ExText TopMargin>
                            <BoldText>Blue</BoldText> = <BoldText>50</BoldText>    (255 - 205) 
                        </ExText>
                    </Slide>
                    <Slide key="slide-5">
                        <ExText TopMargin>
                            <BoldText>Options:</BoldText>
                        </ExText>
                        <ExText TopMargin>
                            You can do this for any color:
                        </ExText>
                    </Slide>
                    <Slide key="slide-6">
                        <ExText TopMargin>
                            Mix the first color on the first shape (S1)
                        </ExText>
                        <ExText TopMargin>
                            Select the second shape (S2), then set the RGB values like this:
                        </ExText>
                    </Slide>
                    <Slide key="slide-7">
                        <ExText TopMargin>
                            S2 <BoldText>Red</BoldText> value = 255 - S1 <BoldText>Red</BoldText> value
                        </ExText>
                        <ExText TopMargin>
                            S2 <BoldText>Green</BoldText> value = 255 - S1 <BoldText>Green</BoldText> value
                        </ExText>
                        <ExText TopMargin>
                            S2 <BoldText>Blue</BoldText> value = 255 - S1 <BoldText>Blue</BoldText> value
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    );
}

export default page;