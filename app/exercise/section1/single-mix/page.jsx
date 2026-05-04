'use client'
import React, { useState } from 'react'
import Header from '@/components/Header'
import ColorControllerUI from '@/components/ColorControllerUI'
import Footer from '@/components/Footer'
import TutorSidebarWithLesson from '@/components/Modals/TutorSidebarWithLesson'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'


const row = 1;
const col = 1;
const width = 200;
const height = 200;
const hSpace = 0;
const vSpace = 0;


function page() {

    let lesson = 'Colormixing 101'
    let title ="Mixing a single primary color"

    // Instruction Modal Control
    useInstructionModalControl();
    let [isInstructionModalOpen, setIsInstructionModalOpen] = useState(true);
    
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
                    <ColorControllerUI row={row} col={col} width={width} height={height} hSpace={hSpace} vSpace={vSpace} onInstructionClose={instructionModalClose}  />
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
            
            <TutorSidebarWithLesson
                isOpen={isInstructionModalOpen}
                closeModal={instructionModalClose}
                lessonFilename="1-colormixing-101-ai.md"
                lessonId="1-colormixing-101-ai"
                exerciseId="single_mix"
                lessonTitle={lesson}
            />
        </div>
    )
}

export default page