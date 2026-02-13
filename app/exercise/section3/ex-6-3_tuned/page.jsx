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
const col =6;
const width = 150;
const height = 150;
const hSpace = 20;
const vSpace = 20;
const backgroundColor = 'rgb(255,255,255)';
const initShapeColors =["rgb(231,91,85)",  "rgb(250,224,105)", "rgb(140,247,116)","rgb(117,246,248)", "rgb(128,128,247)", "rgb(237,119,248)"]

function page() {

    let lesson = 'Color factors'
    let exerciseNumber = 'exercise 6.3'
    let title ='Brightness - tuned'
    // Flag to indicate this exercise uses slideshow instructions
    const useSlideshow = true;

    // Instruction Modal Control

    const shouldShowModal = useInstructionModalControl();
    let [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
	    
    // Update modal state when shouldShowModal changes
    useEffect(() => {
        setIsInstructionModalOpen(shouldShowModal);
    }, [shouldShowModal])

    function instructionModalOpen() {
        setIsInstructionModalOpen(true)
    }

    function instructionModalClose() {
        setIsInstructionModalOpen(false)
    }
    return (
        <div className="h-full overflow-y-hidden">
        <Header />

        <div className=' h-[calc(100vh - 36px)] lg:h-[calc(100vh - 36px)] relative' style={{ margin: 0, padding: 0 }}>
                <div className='flex justify-center items-center w-full '>
                <ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} bgColor={backgroundColor} initShapeColors = {initShapeColors} />
                    <ExerciseIconsPanel
                        onInstructionOpen={instructionModalOpen}
                        shapeColors={initShapeColors}
                        backgroundColor={backgroundColor}
                        row={row}
                        col={col}
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
                exerciseNumber={exerciseNumber}
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
                        This is a 'tuned' color composition for exercise 6.3, where the color values are qualitatively adjusted for balance and impact.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page
