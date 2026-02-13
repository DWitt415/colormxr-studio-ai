import { Button, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import Link from 'next/link'
import { useState } from 'react'
import NewShapesetModal from './NewShapesetModal'
import LoadCompositionModal from './LoadCompositionModal'

function ExerciseModalV({ isOpen, closeModal }) {
    // State for toggling sections
    const [isNewShapesetOpen, setIsNewShapesetOpen] = useState(true)
    const [isInteractiveOpen, setIsInteractiveOpen] = useState(false)
    const [isColormixing101Open, setIsColormixing101Open] = useState(false)
    const [isColorTransitionsOpen, setIsColorTransitionsOpen] = useState(false)
    const [isContrastHarmonyOpen, setIsContrastHarmonyOpen] = useState(false)
    const [isCompositionsOpen, setIsCompositionsOpen] = useState(false)

    // State for new shapeset modal
    const [isShapesetModalOpen, setIsShapesetModalOpen] = useState(false)
    const [shapesetLayoutType, setShapesetLayoutType] = useState('grid')

    // State for load composition modal
    const [isLoadCompositionOpen, setIsLoadCompositionOpen] = useState(false)

    const handleNewShapeset = (layoutType) => {
        setShapesetLayoutType(layoutType)
        setIsShapesetModalOpen(true)
        closeModal() // Close the instruction modal when opening new shapeset modal
    }

    return (
        <>
            <Transition appear show={isOpen}>
                <Dialog as="div" className="relative z-[1000] focus:outline-none" onClose={closeModal}>
                    {/* Position exactly at header bottom and footer top */}
                    <div className="fixed inset-0 z-[1000] overflow-hidden bg-black/20">
                        <div className="absolute left-0 top-[50px] bottom-[50px] flex">
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-x-[-50px]"
                                enterTo="opacity-100 translate-x-0"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-x-0"
                                leaveTo="opacity-0 translate-x-[-50px]"
                            >
                                <DialogPanel className="w-[500px] h-full rounded-r-xl bg-background px-8 py-10 backdrop-blur-2xl text-bodytext flex flex-col shadow-lg modal-dialog">

                                    {/* Content with hidden scrollbar */}
                                    <div className="flex-grow overflow-y-auto scrollbar-hide">
                                        <style jsx global>{`
                                            .scrollbar-hide {
                                                -ms-overflow-style: none;
                                                scrollbar-width: none;
                                            }
                                            .scrollbar-hide::-webkit-scrollbar {
                                                display: none;
                                            }
                                            .section-toggle {
                                                cursor: pointer;
                                                user-select: none;
                                                display: flex;
                                                align-items: center;
                                                gap: 8px;
                                            }
                                            .section-toggle:hover {
                                                opacity: 0.8;
                                            }
                                            .chevron {
                                                display: inline-block;
                                                width: 0;
                                                height: 0;
                                                border-left: 5px solid transparent;
                                                border-right: 5px solid transparent;
                                                border-top: 6px solid #D2D2D2;
                                                transition: transform 0.2s;
                                            }
                                            .chevron.closed {
                                                transform: rotate(-90deg);
                                            }
                                        `}</style>

                                        {/* Single column layout */}
                                        <div className="flex flex-col gap-6">

                                            {/* SHAPESET CREATOR SECTION */}
                                            <div className="flex flex-col gap-[10px]">
                                                <div
                                                    className="section-toggle"
                                                    onClick={() => setIsNewShapesetOpen(!isNewShapesetOpen)}
                                                >
                                                    <span className={`chevron ${!isNewShapesetOpen ? 'closed' : ''}`}></span>
                                                    <h3 className="font-semibold text-[#D2D2D2]">Shapeset creator</h3>
                                                </div>
                                                {isNewShapesetOpen && (
                                                    <div className="flex flex-col gap-[10px] pl-4">
                                                        <div
                                                            className="text-[#5771FF] cursor-pointer hover:text-[#4560E6]"
                                                            onClick={() => handleNewShapeset('grid')}
                                                        >
                                                            New Grid
                                                        </div>
                                                        <div
                                                            className="text-[#5771FF] cursor-pointer hover:text-[#4560E6]"
                                                            onClick={() => handleNewShapeset('cosmic')}
                                                        >
                                                            New Cosmic
                                                        </div>
                                                        <div
                                                            className="text-[#5771FF] cursor-pointer hover:text-[#4560E6]"
                                                            onClick={() => handleNewShapeset('radiant')}
                                                        >
                                                            New Radiant
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* COLORMIXING 101 SECTION */}
                                            <div className="flex flex-col gap-[10px]">
                                                <div
                                                    className="section-toggle"
                                                    onClick={() => setIsColormixing101Open(!isColormixing101Open)}
                                                >
                                                    <span className={`chevron ${!isColormixing101Open ? 'closed' : ''}`}></span>
                                                    <h3 className="font-semibold text-[#D2D2D2]">Colormixing 101</h3>
                                                </div>
                                                {isColormixing101Open && (
                                                    <div className="flex flex-col gap-[10px] pl-4">
                                                        <Link href='/exercise/section1/single-mix' className="text-[#5771FF] cursor-pointer">Mixing a single primary color</Link>
                                                        <Link href='/exercise/section1/primary-secondary' className="text-[#5771FF] cursor-pointer">Mixing primary and secondary colors</Link>
                                                        <Link href='/exercise/section1/subtraction' className="text-[#5771FF] cursor-pointer">Color by subtraction</Link>
                                                        <Link href='/exercise/section1/relationships' className="text-[#5771FF] cursor-pointer">Primary and secondary relationships</Link>
                                                        <Link href='/exercise/section1/phantom-colors' className="text-[#5771FF] cursor-pointer">'Phantom' complementary colors</Link>
                                                        <Link href='/exercise/section1/complex-complement' className="text-[#5771FF] cursor-pointer">Complex complementary colors</Link>
                                                        <Link href='/exercise/section1/color-wheel' className="text-[#5771FF] cursor-pointer">Building the color wheel</Link>
                                                    </div>
                                                )}
                                            </div>

                                            {/* BUILDING COLOR TRANSITIONS SECTION */}
                                            <div className="flex flex-col gap-[10px]">
                                                <div
                                                    className="section-toggle"
                                                    onClick={() => setIsColorTransitionsOpen(!isColorTransitionsOpen)}
                                                >
                                                    <span className={`chevron ${!isColorTransitionsOpen ? 'closed' : ''}`}></span>
                                                    <h3 className="font-semibold text-[#D2D2D2]">Building color transitions</h3>
                                                </div>
                                                {isColorTransitionsOpen && (
                                                    <div className="flex flex-col gap-[10px] pl-4">
                                                        <Link href='/exercise/section2/basic-gradient' className="text-[#5771FF] cursor-pointer">Basic gradient building</Link>
                                                        <Link href='/exercise/section2/tinting' className="text-[#5771FF] cursor-pointer">Tinting primary and secondary gradients</Link>
                                                        <Link href='/exercise/section2/shading' className="text-[#5771FF] cursor-pointer">Shading primary and secondary gradients</Link>
                                                        <Link href='/exercise/section2/complete-gradient' className="text-[#5771FF] cursor-pointer">Building complete color gradients</Link>
                                                        <Link href='/exercise/section2/rainbow' className="text-[#5771FF] cursor-pointer">Rainbow gradient construction</Link>
                                                        <Link href='/exercise/section2/spectral' className="text-[#5771FF] cursor-pointer">Creating spectral gradients</Link>
                                                        <Link href='/exercise/section2/full-gradient' className="text-[#5771FF] cursor-pointer">Horizontal full gradient</Link>
                                                        <Link href='/exercise/section2/complex-gradients' className="text-[#5771FF] cursor-pointer">Creating complex gradients</Link>
                                                    </div>
                                                )}
                                            </div>

                                            {/* COLOR CONTRAST AND HARMONY SECTION */}
                                            <div className="flex flex-col gap-[10px]">
                                                <div
                                                    className="section-toggle"
                                                    onClick={() => setIsContrastHarmonyOpen(!isContrastHarmonyOpen)}
                                                >
                                                    <span className={`chevron ${!isContrastHarmonyOpen ? 'closed' : ''}`}></span>
                                                    <h3 className="font-semibold text-[#D2D2D2]">Color contrast and harmony</h3>
                                                </div>
                                                {isContrastHarmonyOpen && (
                                                    <div className="flex flex-col gap-[10px] pl-4">
                                                        <Link href='/exercise/section3/hsl-experiment' className="text-[#5771FF] cursor-pointer">Experimenting with hue, saturation and lightness</Link>
                                                        <Link href='/exercise/section3/illusion-transp' className="text-[#5771FF] cursor-pointer">Illusion of transparency</Link>
                                                        <Link href='/exercise/section3/mod-color-2' className="text-[#5771FF] cursor-pointer">Modulating color contrast - 2 colors</Link>
                                                        <Link href='/exercise/section3/mod-color-3' className="text-[#5771FF] cursor-pointer">Modulating color contrast - 3 colors</Link>
                                                        <Link href='/exercise/section3/hue-balancing' className="text-[#5771FF] cursor-pointer">Hue balancing simultaneous contrast</Link>
                                                        <Link href='/exercise/section3/brightness-balancing' className="text-[#5771FF] cursor-pointer">Brightness balancing</Link>
                                                        <Link href='/exercise/section3/balancing-pairs' className="text-[#5771FF] cursor-pointer">Brightness balancing color pairs</Link>
                                                        <Link href='/exercise/section3/balancing-rgbcmy' className="text-[#5771FF] cursor-pointer">Brightness balancing - primary and secondary</Link>
                                                    </div>
                                                )}
                                            </div>

                                            {/* CREATING COLOR COMPOSITIONS SECTION */}
                                            <div className="flex flex-col gap-[10px]">
                                                <div
                                                    className="section-toggle"
                                                    onClick={() => setIsCompositionsOpen(!isCompositionsOpen)}
                                                >
                                                    <span className={`chevron ${!isCompositionsOpen ? 'closed' : ''}`}></span>
                                                    <h3 className="font-semibold text-[#D2D2D2]">Creating color compositions</h3>
                                                </div>
                                                {isCompositionsOpen && (
                                                    <div className="flex flex-col gap-[10px] pl-4">
                                                        <Link href='/exercise/section4/spectral-gradient-grid' className="text-[#5771FF] cursor-pointer">Creating a spectral gradient grid</Link>
                                                        <Link href='/exercise/section4/complex-gradient-grid' className="text-[#5771FF] cursor-pointer">Creating a complex gradient grid</Link>
                                                        <Link href='/exercise/section4/color-palette-studies' className="text-[#5771FF] cursor-pointer">Color palette studies</Link>
                                                        <Link href='/exercise/section4/free-play-3x3' className="text-[#5771FF] cursor-pointer">Free play - 3x3 grid</Link>
                                                        <Link href='/exercise/section4/free-play-5x5' className="text-[#5771FF] cursor-pointer">Free play - 5x5 grid</Link>
                                                        <Link href='/exercise/section4/6x6-palette' className="text-[#5771FF] cursor-pointer">6x6 palette grid</Link>
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* New Shapeset Modal */}
            <NewShapesetModal
                isOpen={isShapesetModalOpen}
                closeModal={() => setIsShapesetModalOpen(false)}
                layoutType={shapesetLayoutType}
            />

            {/* Load Composition Modal */}
            <LoadCompositionModal
                isOpen={isLoadCompositionOpen}
                closeModal={() => setIsLoadCompositionOpen(false)}
            />
        </>
    )
}

export default ExerciseModalV
