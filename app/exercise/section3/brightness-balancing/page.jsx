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
const col = 1;
const width = 250;
const height = 250;
const hSpace = 20;
const vSpace = 20;
const backgroundColor = 'rgb(65,65,65)';
const initHexShapeColors = [0x8A89F7];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);

function page() {

    let lesson = 'Color harmony and contrast'
    let title = 'Brightness balancing'

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
                        Find the brightness level of the <BoldText>Blue</BoldText> shape by selecting the background and scrubbing the grayscale slider to find the flashpoint (the point where the lightness of the foreground and background colors is equal).
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Scrub rapidly at first, then move slower and try to hone in to the balance point.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        Try to match the brightness as closely as possible (at that point, there is only contrast of hue to differentiate the shapes).
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        Repeat with other primary / secondary / complex colors of your choosing and notice how the brightness point changes, and where it occurs on the scale.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page