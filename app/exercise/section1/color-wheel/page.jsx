'use client'
import React, { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlideInstructionModal, { Slide } from '@/components/Modals/SlideInstructionModalSimple'
import ColorControllerUI from '@/components/ColorControllerUI'
import { BoldText, ExText } from '@/components/CustomText'
import { useInstructionModalControl } from '@/utils/modalControl'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

//This exercise demonstrates loading and manipulating an external SVG file (color-wheel.svg)

const backgroundColor = '#F0F0F0'; // Light gray background

function page() {
    let lesson = 'Colormixing 101'
    let title = "Building the Color Wheel"

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
    function handleInfoButtonClick(e) {
        e.stopPropagation(); // Prevent event bubbling to parent div
        console.log('Info button clicked, current state:', isInstructionModalOpen);
        setIsInstructionModalOpen((prev) => {
            console.log('Setting modal to:', !prev);
            return !prev;
        });
    }

    return (
        <div style={{ backgroundColor: backgroundColor, minHeight: '100vh' }}>
            <Header />

            <div className='h-[91vh] flex items-center justify-center' onClick={instructionModalClose}>
                <div className='flex justify-center items-center w-full'>
                    <ColorControllerUI
                        layoutMode="svg"
                        svgPath="/color-wheel.svg"
                        bgColor={backgroundColor}
                        onInstructionClose={instructionModalClose}
                        showPalette={false}
                    />

                    <ExerciseIconsPanel
                        config={{
                            features: {
                                importSVG: false,
                                exportPalette: true,
                                exportComposition: true
                            }
                        }}
                    />

                    {/* Info icon button - positioned in bottom left */}
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
                        This exercise will demonstrate how to build an RGB+CMY color wheel, showing the relationships between the colors as they cycle around the wheel.
                    </ExText>
                </Slide>
                <Slide key="slide-2">
                    <ExText TopMargin>
                        Start by setting the primary colors:
                    </ExText>
                </Slide>
                <Slide key="slide-3">
                    <ExText TopMargin>
                        Starting with the shape at 12 o'clock, make the shape pure <BoldText>Red</BoldText> by adding Red and removing its complementary, <BoldText>Cyan</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-4">
                    <ExText TopMargin>
                        Moving to the shape at 4 o'clock, make that shape <BoldText>Green</BoldText> by adding Green and removing its complementary, <BoldText>Magenta</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-5">
                    <ExText TopMargin>
                        Moving to the shape at 8 o'clock, color that shape <BoldText>Blue</BoldText> by adding Blue and removing its complementary, <BoldText>Yellow</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-7">
                    <ExText TopMargin>
                       Next, set the secondary colors:
                       </ExText>
                    <ExText TopMargin>
                       Select the shape at 6 o'clock, opposite Red, and make that shape <BoldText>Cyan</BoldText> by adding Cyan and removing its complementary, <BoldText>Red</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-8">
                    <ExText TopMargin>
                        Select the shape opposite Green at 10 o'clock and make that shape <BoldText>Magenta</BoldText> by adding Magenta and removing its complementary, <BoldText>Green</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-9">
                    <ExText TopMargin>
                        Finally, select the shape opposite Blue at 2 o'clock and make that shape <BoldText>Yellow</BoldText> by adding Yellow and removing its complementary, <BoldText>Blue</BoldText>.
                    </ExText>
                </Slide>
                <Slide key="slide-10">
                    <ExText TopMargin>
                        Now you can see how the primary colors
                    </ExText>
                    <ExText TopMargin>
                        <BoldText>Red, Green, Blue</BoldText>
                    </ExText>
                    <ExText TopMargin>
                        and secondary colors
                        </ExText>
                    <ExText TopMargin>
                        <BoldText>Cyan, Magenta, Yellow</BoldText>
                    </ExText>
                    <ExText TopMargin> are arranged around the color wheel, demonstrating their relationships.
                    </ExText>
                </Slide>
                <Slide key="slide-11">
                    <ExText TopMargin>
                    Now, to add the 'in between' colors:
                    </ExText>
                    <ExText TopMargin>
                    Select the shape between Red and Yellow at 1 o'clock, and make that shape <BoldText>Orange</BoldText> by cloning Red onto that shape, then selecting it and moving the Green slider to a middle value.
                    </ExText>
                </Slide>
                <Slide key="slide-12">
                    <ExText TopMargin>
                        Select the shape between Yellow and Green at 3 o'clock and clone Yellow onto that shape; then select it and move the Red slider to a middle value.
                    </ExText>
                </Slide>
                <Slide key="slide-13">
                    <ExText TopMargin>
                        Select the shape between Green and Cyan at 5 o'clock; clone Green onto that shape, then select it and move the Blue slider to a middle value.
                    </ExText>
                </Slide>
                <Slide key="slide-14">
                    <ExText TopMargin>
                        Select the shape between Cyan and Blue at 7 o'clock, and make that shape; clone Cyan onto that shape, then select it and movethe Green slider to a middle value.
                    </ExText>
                </Slide>
                <Slide key="slide-15">
                    <ExText TopMargin>
                        Select the shape between Blue and Magenta at 9 o'clock; clone Blue onto that shape, then select it and move the Red slider to a middle value. We define this color as <BoldText>Violet</BoldText>.
                        </ExText>
                        </Slide>
                <Slide key="slide-16">
                    <ExText TopMargin>
                        Finally, select the shape between Magenta and Red at 11 o'clock; clone Magenta onto that shape, then select it and remove Blue to a middle value.
                    </ExText>
                </Slide>
                <Slide key="slide-17">
                    <ExText TopMargin>
                       Now that we have the full color wheel built, leave Orange and Violet, and remove the other non-primary/secondary colors by turning them White. We do this to avoid confusion, since these colors are hard to definitively name.
                    </ExText>
                </Slide>
                <Slide key="slide-18">
                                        <ExText TopMargin>
                        Now, we've defined the main palette colors for Colormxr; Red, Orange, Yellow, Green, Cyan, Blue, Violet and Magenta; select them in order while looking at the slider interface and you can see the progressive relationship between colors.
                    </ExText>
</Slide>
            </SlideInstructionModal>
        </div>
    )
}

export default page
