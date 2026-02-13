'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link';
import InstructionModalV from '@/components/Modals/InstructionModalV'
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
const initHexShapeColors =[0xFF0000, 0xFFFF00, 0x00FF00, 0x00FFFF, 0x0000FF, 0xFF00FF];

function hexToRgb(hex) {
    let r = (hex >> 16) & 255;
    let g = (hex >> 8) & 255;
    let b = hex & 255;
    return `rgb(${r},${g},${b})`;
}

const initShapeColors = initHexShapeColors.map(hexToRgb);

function page() {

    let lesson = 'Color factors'
    let title ='Brightness balancing - primary and secondary'


    // Instruction Modal Control

    useInstructionModalControl();
    let [isInstructionModalOpen, setIsInstructionModalOpen] = useState(false);
		
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
                        Try to balance all of the Primary / secondary colors in a single layout:
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        This is difficult due to the inherently different brightness levels between the primary and secondary colors. You will need to use tinting and shading to achieve this balance.
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        <BoldText>Step 1</BoldText> Scrub the background to find the lightest color.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        <BoldText>Step 2</BoldText> Shade that color a little, then scrub the background to check again.
                    </ExText>
                </Slide>
                <Slide key="slide-5">
                    <ExText TopMargin>
                        Experiment with making a color change and then scrubbing the background to check the brightness levels. Repeat with all colors.
                    </ExText>
                </Slide>
                <Slide key="slide-6">
                    <ExText TopMargin>
                        This one takes some time to get right, so be patient!
                    </ExText>
                </Slide>
                <Slide key="slide-7">
                    <ExText TopMargin>
                        Click here to see balanced and tuned examples:
                    </ExText>
                    <ExText TopMargin>
                        <Link legacyBehavior href='/exercise/section2/ex-6-3_balanced' passHref>
                            <a target="_blank" rel="noopener noreferrer" className="text-[#5771FF] cursor-pointer hover:underline">
                                <BoldText>Brightness balanced example</BoldText>
                            </a>
                        </Link>
                    </ExText>
                    <ExText TopMargin>
                        <Link legacyBehavior href='/exercise/section2/ex-6-3_tuned' passHref>
                            <a target="_blank" rel="noopener noreferrer" className="text-[#5771FF] cursor-pointer hover:underline">
                                <BoldText>Brightness tuned example</BoldText>
                            </a>
                        </Link>
                    </ExText>
                </Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page
