'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ColorControllerUI from '@/components/ColorControllerUI'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'
import InstructionModalV from '@/components/Modals/InstructionModalV'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import { useInstructionModalControl } from '@/utils/modalControl'

/**
 * Base Exercise Template Component
 * 
 * This is a reusable component that contains only essential exercise code 
 * with no modal management redundancy.
 * 
 * Usage:
 * import BaseExercise from '@/components/templates/BaseExercise'
 * 
 * <BaseExercise 
 *   shapesetConfig={SHAPESET_CONFIG}
 *   exerciseConfig={EXERCISE_CONFIG} 
 *   instructionContent={instructionContent}
 *   exerciseInfo={EXERCISE_INFO}
 * />
 */
const BaseExercise = ({ 
  shapesetConfig,   // Grid config: { row, col, width, height, colors, etc }
  exerciseConfig,   // Feature flags: { useSlideshow, features: { importSVG, exportPalette, etc } }
  instructionContent, // { slideContent, regularContent } from InstructionContent component
  exerciseInfo      // Metadata: { lesson, exerciseNumber, title }
}) => {
  // Instruction Modal Control - only modal state needed in exercises
  const shouldShowModal = useInstructionModalControl();
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(true);
  
  // Update modal state when shouldShowModal changes
  useEffect(() => {
    setIsInstructionModalOpen(shouldShowModal);
  }, [shouldShowModal]);

  const instructionModalOpen = () => setIsInstructionModalOpen(true);
  const instructionModalClose = () => setIsInstructionModalOpen(false);

  return (
    <div>
      <Header />

      <div className='h-[70vh] lg:h-[91vh] relative'>
        <div className='flex justify-center items-center w-full'>
          <ColorControllerUI {...shapesetConfig} />
          <ExerciseIconsPanel
            config={exerciseConfig}
            shapesetConfig={shapesetConfig}
            onInstructionOpen={instructionModalOpen}
          />
        </div>
      </div>

      {/* Exercise-specific instruction content */}
      {exerciseConfig.useSlideshow ? (
        <SlideInstructionModal
          isOpen={isInstructionModalOpen}
          closeModal={instructionModalClose}
          style={{ zIndex: 999, color: "#ABABAB" }}
        >
          {instructionContent.slideContent}
        </SlideInstructionModal>
      ) : (
        <InstructionModalV
          isOpen={isInstructionModalOpen}
          closeModal={instructionModalClose}
          style={{ zIndex: 999, color: "#ABABAB" }}
        >
          {instructionContent.regularContent}
        </InstructionModalV>
      )}

      <Footer
        lesson={exerciseInfo.lesson}
        exerciseNumber={exerciseInfo.exerciseNumber}
        title={exerciseInfo.title}
      />
    </div>
  );
};

export default BaseExercise;