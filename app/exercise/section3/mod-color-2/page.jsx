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
const col =2;
const width = 100;
const height = 1200;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(255,255,255)';
const initHexShapeColors =[0xFFFF00, 0x0000FF];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);



function page() {

    let lesson = 'Color harmony and contrast'
    let title ='Modulating color contrast - 2 colors'

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
                closeModal={instructionModalClose}>
                <Slide key="slide-0">
                    <ExText TopMargin>
                        <BoldText>{title}</BoldText>
                    </ExText>
                </Slide>
                <Slide key="slide-1">
                    <ExText TopMargin>
                        Using the colormixer interface and the <BoldText>Yellow</BoldText> - <BoldText>Blue</BoldText> shape layout:
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Starting with <BoldText>Blue</BoldText>, add its complementary <BoldText>Yellow</BoldText> to tint the color value, paying attention to how the appearance shifts as you move along. Then, subtract it to saturate the Blue. Play with this a while, until you find a balance that you like.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        Next, select the <BoldText>Yellow</BoldText> shape and tint it by adding its complementary <BoldText>Blue</BoldText>, and then shade it, by subtracting <BoldText>Yellow</BoldText>. Notice how this changes both its appearance and its relationship to <BoldText>Blue</BoldText>. This is interaction of color in action!
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        Try both high and low contrast, all the while paying attention the effect these changes have on the appearance of both colors, and their relationship.
                    </ExText>
                    <ExText TopMargin>
                        Additionally, try changing the background color and see how that changes the overall visual effect.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    );
}

export default page;