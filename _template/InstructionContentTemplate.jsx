import React from 'react'
import { BoldText, ExText } from '@/components/CustomText'
import { Slide } from '@/components/Modals/SlideInstructionModalSimple'

/**
 * TEMPLATE: Instruction content for your exercise
 * 
 * Instructions:
 * 1. Rename the function to match your exercise (e.g., YourExerciseInstructions)
 * 2. Update the export name and title parameter
 * 3. Customize the slide content and regular content
 * 4. Import this in your exercise page as: import { YourExerciseInstructions } from './InstructionContent'
 */
export const YourExerciseInstructions = ({ title = "Your Exercise Title" }) => {
  const slideContent = [
    // Slide 0: Title slide (recommended to keep)
    <Slide key="slide-0">
      <ExText TopMargin>
        <BoldText>{title}</BoldText>
      </ExText>
    </Slide>,
    
    // Slide 1: Main instructions - CUSTOMIZE THIS
    <Slide key="slide-1">
      <ExText TopMargin>
        Your main exercise instructions here. Use <BoldText>BoldText</BoldText> for emphasis.
      </ExText>
      <ExText TopMargin>
        Add multiple paragraphs by using separate ExText components.
      </ExText>
    </Slide>,
    
    // Slide 2: Additional guidance - CUSTOMIZE OR ADD MORE SLIDES
    <Slide key="slide-2">
      <ExText TopMargin>
        Additional guidance or specific steps for the exercise.
      </ExText>
    </Slide>,
    
    // Slide 3: Reflection questions - CUSTOMIZE THIS
    <Slide key="slide-3">
      <ExText TopMargin>
        What should students observe? What questions should they consider?
      </ExText>
    </Slide>
    
    // ADD MORE SLIDES AS NEEDED:
    // <Slide key="slide-4">
    //   <ExText TopMargin>
    //     Another slide of content...
    //   </ExText>
    // </Slide>
  ];

  // Regular content version (for non-slideshow exercises)
  const regularContent = (
    <>
      <ExText TopMargin>
        <BoldText>{title}</BoldText>
      </ExText>
      <ExText TopMargin></ExText>
      <ExText TopMargin> </ExText>
      <ExText TopMargin>
        Your main exercise instructions here. Use <BoldText>BoldText</BoldText> for emphasis.
      </ExText>
      <ExText TopMargin>
        Add multiple paragraphs by using separate ExText components.
      </ExText>
      <ExText TopMargin>
        Additional guidance or specific steps for the exercise.
      </ExText>
      <ExText TopMargin>
        What should students observe? What questions should they consider?
      </ExText>
    </>
  );

  return {
    slideContent,
    regularContent
  };
};