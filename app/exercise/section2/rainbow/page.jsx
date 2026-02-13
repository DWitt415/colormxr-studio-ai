"use client"
// ...existing code...
// ...existing code...
// ...existing code...
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'


const row = 8;
const col = 1;
const width = 1700;
const height = 50;
const hSpace = 0;
const vSpace = 0;

const backgroundColor = 'rgb(255,255,255)';
const initShapeColors =  [
    'rgb(200, 200, 200)',
    'rgb(155,155,155)',
    'rgb(130, 130, 130)',
    'rgb(100, 100, 100)',
    'rgb(155, 155, 155)',
    'rgb(130, 130, 130)',
    'rgb(100, 100, 100)',
    'rgb(80, 80, 80)',
];


function page() {

    let lesson = 'Building color transitions'
    let title ="Rainbow gradient construction"

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

            <div className=' h-[70vh] lg:h-[91vh] relative'>
                <div className='flex justify-center items-center w-full '>
                <ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} initShapeColors={initShapeColors} onInstructionClose={instructionModalClose} /> 
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
                            Going from top to bottom, set the shape colors in this order: 
                        </ExText>
                        <ExText TopMargin>
                            Red, Orange, Yellow, Green, Cyan, Blue-Green, Blue, Violet
                        </ExText>
                    </Slide>
                    <Slide key="slide-2">
                        <ExText TopMargin>
                            Make the top shape Red by dragging the Red slider to the top, and the complementary color, Cyan, to the bottom
                        </ExText>
                    </Slide>
                    <Slide key="slide-3">
                        <ExText TopMargin>
                            You can use the clone tool to use the current color as the starting point for the next color: Hold down the shift key and click on the next shape down. Release the shift key and click it again to select it.
                        </ExText>
                    </Slide>
                    <Slide key="slide-4">
                        <ExText TopMargin>
                            Now, you can add Green halfway to make Orange.
                        </ExText>
                        <ExText TopMargin>
                            Then, repeat the process, and clone Orange onto the next shape, and then drag Green to the top to make Yellow.
                        </ExText>
                    </Slide>
                    <Slide key="slide-5">
                        <ExText TopMargin>
                            From Yellow, you subtract Red to make Green. Then, clone again and add 100% Blue to make Cyan.
                        </ExText>
                    </Slide>
                    <Slide key="slide-6">
                        <ExText TopMargin>
                            Clone Cyan onto the next shape, and subtract 50% of Green to make Blue-Green. Clone this onto the next shape and then remove Green to make Blue.
                        </ExText>
                    </Slide>
                    <Slide key="slide-7">
                        <ExText TopMargin>
                            Finally, clone Blue onto the next shape and add 50% Red to make Violet.
                        </ExText>
                    </Slide>
                    <Slide key="slide-8">
                        <ExText TopMargin>
                            Voila! You've just created your first color composition, and first spectral rainbow gradient.
                        </ExText>
                    </Slide>
                </SlideInstructionModal>
        </div>
    )
}

export default page
