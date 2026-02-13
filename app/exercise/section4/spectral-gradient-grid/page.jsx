'use client'

import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

const row = 16;
const col = 8;
const width = 140;
const height = 55;
const hSpace = 0;
const vSpace = 0;
const backgroundColor = 'rgb(235,235,235)';
const initShapeColors = [
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(255,255,255)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(180, 180, 180)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(210,210,210)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(180, 180, 180)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(210,210,210)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(180, 180, 180)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(210,210,210)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
    'rgb(255,0,0)',
    'rgb(255,127,0)',
    'rgb(255,255,0)',
    'rgb(0,255,0)',
    'rgb(0,255,255)',
    'rgb(0,0,255)',
    'rgb(127,0,255)',
    'rgb(255,0,255)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(180, 180, 180)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(210,210,210)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(180, 180, 180)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(210,210,210)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(195, 195, 195)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(190, 190, 190)',
    'rgb(210, 210, 210)',
    'rgb(220, 220, 220)',
    'rgb(210, 210, 210)',
    'rgb(180, 180, 180)',
    'rgb(175, 175, 175)',  
    'rgb(180, 180, 180)', 
    'rgb(185, 185, 185)', 
    'rgb(210,210,210)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
    'rgb(0,0,0)',
];

function page() {
    let lesson = 'Color composition'
    let title = "Spectral gradient grid"

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
            <div className='h-[70vh] lg:h-[91vh] relative'>
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
                closeModal={instructionModalClose}
                style={{zIndex: 999, color: "#ABABAB"}}>
                <Slide key="slide-0">
                    <ExText TopMargin>
                        <BoldText>{title}</BoldText>
                    </ExText>
                </Slide>
                <Slide key="slide-1">
                    <ExText TopMargin>
                        This exercise leads you through creating a spectral tint and shade composition.
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Using the colormixer interface and shapeset, starting with <BoldText>Red</BoldText>, tint upwards towards <BoldText>White</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        Next, shade downwards to <BoldText>Black</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        Repeat for <BoldText>Orange</BoldText>, and then for each color in turn:
                    </ExText>
                    <ExText TopMargin>
                        <BoldText>Red</BoldText>, <BoldText>Orange</BoldText>, <BoldText>Yellow</BoldText>, <BoldText>Green</BoldText>, <BoldText>Cyan</BoldText>, <BoldText>Blue</BoldText>, <BoldText>Violet</BoldText>, <BoldText>Magenta</BoldText>
                    </ExText>
                </Slide>
                <Slide key="slide-5">
                    <ExText TopMargin>
                        This is a long but satisfying process, enjoy the simple pleasure of gradient building.
                    </ExText>
                    <ExText TopMargin>
                        After your first pass, review your work and fine-tune any colors that are slightly off.
                    </ExText>
                </Slide>
                <Slide key="slide-6">
                    <ExText TopMargin>
                        As always, try changing the background color and notice how it changes your perception of the color composition.
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page