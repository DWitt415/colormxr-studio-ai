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
const col =3;
const width = 100;
const height = 1200;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(255,255,255)';
const initHexShapeColors =[0xFFFF54, 0x909090,0x5A5AF6];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);



function page() {

    let lesson = 'Color harmony and contrast'
    let title ='Modulating color contrast - 3 colors'

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
                        This exercise adds a third color, <BoldText>Gray</BoldText>, in between <BoldText>Yellow</BoldText> and <BoldText>Blue</BoldText>, to explore how the hues interact with different Gray values, and how this effects the overall color appearance.
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Slowly modulate the grayscale value of the middle shape, and observe the effect that it has on its neighboring colors. Notice the different feel you get, from high-impact high contrast, to the subtle and shimmering effects of low contrast.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        This is a great exercise to play with Yellow, with the realization that the mid-Yellow tones can have a stronger 'yellow' effect than pure Yellow.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        Also, notice the simultaneous contrast that is happening, where <BoldText>Yellow</BoldText> and <BoldText>Blue</BoldText> are casting a color shift onto the neutral Gray. Try adding or subtracting Yellow or Blue from the Gray, to either neutralize or enhance the simultaneous contrast effect.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page
