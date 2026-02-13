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
const backgroundColor = 'rgb(200,200,200)';
const initHexShapeColors =[0x00FFFF];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);

function page() {

    let lesson = 'Color contrast and harmony'
    let title ='Balancing simultaneous contrast'

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
        <div className="h-full overflow-y-hidden">
        <Header />

        <div className=' h-[calc(100vh - 36px)] lg:h-[calc(100vh - 36px)] relative' style={{ margin: 0, padding: 0 }}>
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
        onInstructionOpen={handleInfoButtonClick}
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
                        Experiment with the simultaneous contrast effect using colormixer:
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Gaze steadily at the <BoldText>Cyan</BoldText> shape until you notice its color effect on the neutral gray background, where its complementary <BoldText>Red</BoldText> is being spontaneously generated.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        Try neutralizing the effect by:
                    </ExText>
                    <ExText TopMargin>
                        • subtracting <BoldText>Red</BoldText> from the background
                    </ExText>
                    <ExText TopMargin>
                        • adding <BoldText>Cyan</BoldText> to the background.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        Try changing the background to lighter or darker gray and observe what effect that has on your perception.
                    </ExText>
                </Slide>
                <Slide key="slide-5">
                    <ExText TopMargin>
                        <BoldText>Bonus:</BoldText> Try this with different primary and secondary colors.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page