'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ColorControllerUI from '@/components/ColorControllerUI'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'
import InstructionModalV from '@/components/Modals/InstructionModalV'
import SlideInstructionModal from '@/components/Modals/SlideInstructionModalSimple'
import { useInstructionModalControl } from '@/utils/modalControl'
import { YourInstructions } from './InstructionContent' // ← Change this import

// ✅ Shapeset Configuration
const SHAPESET_CONFIG = {
    row: 5,  // ← Customize grid dimensions
    col: 5,
    width: 150,  // ← Customize shape size
    height: 150,
    hSpace: 0,   // ← Customize spacing
    vSpace: 0,
    backgroundColor: 'rgb(255,255,255)', // ← Customize background
    initShapeColors: [  // ← Customize initial colors (must match row × col = 25 colors)
        'rgb(185,185,185)',
        'rgb(195,195,195)',
        'rgb(210,210,210)',
        'rgb(195,195,195)',
        'rgb(185,185,185)',
        'rgb(195,195,195)',
        'rgb(210,210,210)',
        'rgb(200,200,200)',
        'rgb(210,210,210)',
        'rgb(195,195,195)',
        'rgb(210,210,210)',
        'rgb(220,220,220)',
        'rgb(185,185,185)',
        'rgb(220,220,220)',
        'rgb(210,210,210)',
        'rgb(195,195,195)',
        'rgb(210,210,210)',
        'rgb(195,195,195)',
        'rgb(210,210,210)',
        'rgb(195,195,195)',
        'rgb(185,185,185)',
        'rgb(195,195,195)',
        'rgb(210,210,210)',
        'rgb(195,195,195)',
        'rgb(185,185,185)',
    ]
};

// ✅ Exercise Configuration 
const EXERCISE_CONFIG = {
    showColorPalette: true,  // ← Show/hide color palette panel
    useSlideshow: true,      // ← Use slideshow vs regular instruction modal
    features: {              // ← Enable/disable functionality
        importSVG: true,           // Show import SVG icon
        exportPalette: true,       // Show export palette icon  
        exportComposition: true    // Show export shapeset icon
    }
};

// ✅ Exercise Information
const EXERCISE_INFO = {
    lesson: 'Your Lesson Name',    // ← Customize lesson name
    exerciseNumber: '1-1',         // ← Customize exercise number
    title: "Your Exercise Title"   // ← Customize exercise title
};

function page() {
    // Instruction Modal Control - only modal state needed in exercises
    const shouldShowModal = useInstructionModalControl();
    const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(true);
    
    // Update modal state when shouldShowModal changes
    useEffect(() => {
        setIsInstructionModalOpen(shouldShowModal);
    }, [shouldShowModal]);

    const instructionModalOpen = () => setIsInstructionModalOpen(true);
    const instructionModalClose = () => setIsInstructionModalOpen(false);
    
    // Get instruction content
    const { slideContent, regularContent } = YourInstructions({ title: EXERCISE_INFO.title });

    return (
        <div>
            <Header />

            <div className='h-[70vh] lg:h-[91vh] relative'>
                <div className='flex justify-center items-center w-full'>
                    <ColorControllerUI {...SHAPESET_CONFIG} />
                    <ExerciseIconsPanel
                        config={EXERCISE_CONFIG}
                        shapesetConfig={SHAPESET_CONFIG}
                        onInstructionOpen={instructionModalOpen}
                    />
                </div>
            </div>

            {/* Exercise-specific instruction content */}
            {EXERCISE_CONFIG.useSlideshow ? (
                <SlideInstructionModal
                    isOpen={isInstructionModalOpen}
                    closeModal={instructionModalClose}
                    style={{ zIndex: 999, color: "#ABABAB" }}
                >
                    {slideContent}
                </SlideInstructionModal>
            ) : (
                <InstructionModalV
                    isOpen={isInstructionModalOpen}
                    closeModal={instructionModalClose}
                    style={{ zIndex: 999, color: "#ABABAB" }}
                >
                    {regularContent}
                </InstructionModalV>
            )}

            <Footer
                lesson={EXERCISE_INFO.lesson}
                exerciseNumber={EXERCISE_INFO.exerciseNumber}
                title={EXERCISE_INFO.title}
            />
        </div>
    )
}

export default page