"use client"
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import { useReference } from '@/contexts/ReferenceContext'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

// 1x5 grid with 100x100 shapes and 10px spacing
const row = 1;
const col = 5;
const width = 100;
const height = 100;
const hSpace = 10;
const vSpace = 10;
const backgroundColor = 'rgb(255,255,255)';
const initShapeColors = [
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)',
    'rgb(180, 180, 180)'
];

function page() {
    let lesson = 'Color palette studies'
    let exerciseNumber = 'exercise 5.7'
    let title = "Fauve Palette Study"

    // Instruction Modal Control
    useInstructionModalControl();
    let [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);

    // Reference context
    const { openReference } = useReference();

    // Open reference by default on mount
    useEffect(() => {
        openReference();
    }, []);

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
                <div className='flex justify-center items-center w-full'>

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
                                exportComposition: true,
                                showReference: true
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
                exerciseNumber={exerciseNumber}
                title={title}
            />

            {/* Instruction Modal */}
            <SlideInstructionModal
                isOpen={isInstructionModalOpen}
                closeModal={instructionModalClose}
                style={{ zIndex: 999, color: "#ABABAB" }}>
                <Slide key="slide-0">
                    <ExText TopMargin>
                        <BoldText>{title}</BoldText>
                    </ExText>
                </Slide>
                <Slide key="slide-1">
                    <ExText TopMargin>
                        Study the Fauve painting and create a 5-color palette that captures its essence.
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        1. Observe the reference image in the upper left corner.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        2. Use the color mixer to recreate the key colors from the painting.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        3. Click "Show/Hide Reference" to toggle the reference image visibility.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page
