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
const initShapeColors =["rgb(242,185,184)", "rgb(208,208,174)", "rgb(180,216,175)", "rgb(187,213,213)", "rgb(201,201,251)", "rgb(241,181,248)"]

function page() {

    let lesson = 'Color harmony and contrast'
    let title ='Brightness - balanced'
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
                        This is a balanced color composition for exercise 6.3 - notice how light the colors are. Scrub the background from White to Black to see where the brightness point is.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page
