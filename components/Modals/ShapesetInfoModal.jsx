import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'

function ShapesetInfoModal({ isOpen, closeModal, layoutMode, row, col, width, height, hSpace, vSpace, fillArea }) {
    // Capitalize first letter of layout mode for display
    const shapesetType = layoutMode.charAt(0).toUpperCase() + layoutMode.slice(1)

    return (
        <>
            <Transition appear show={isOpen}>
                <Dialog as="div" className="relative z-[999] focus:outline-none" onClose={closeModal}>
                    {/* Position with 50px borders above and below */}
                    <div className="fixed inset-0 z-[999] overflow-hidden">
                        <div className="absolute left-0 top-[100px] bottom-[90px] flex">
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="-translate-x-full"
                                enterTo="translate-x-0"
                                leave="ease-in duration-200"
                                leaveFrom="translate-x-0"
                                leaveTo="-translate-x-full"
                            >
                                <DialogPanel className="w-[600px] h-full rounded-r-xl bg-background px-8 py-10 backdrop-blur-2xl text-bodytext flex flex-col modal-dialog">
                                    {/* Content fills entire height with items centered vertically */}
                                    <div className="flex-grow flex items-center overflow-y-auto scrollbar-hide">
                                        <style jsx global>{`
                                            .scrollbar-hide {
                                                -ms-overflow-style: none;
                                                scrollbar-width: none;
                                            }
                                            .scrollbar-hide::-webkit-scrollbar {
                                                display: none;
                                            }
                                        `}</style>
                                        <div className="flex flex-col gap-6 w-full">
                                            {/* Shapeset Type Section */}
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-2">Shapeset Type</h2>
                                                <p className="text-xl text-bodytext">{shapesetType}</p>
                                            </div>

                                            {/* Input Variables Section */}
                                            <div>
                                                <h2 className="text-2xl font-bold text-white mb-4">Input Variables</h2>
                                                <div className="flex flex-col gap-3">
                                                    {/* Grid layout specific variables */}
                                                    {layoutMode === 'grid' && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Rows:</span>
                                                                <span className="text-white font-medium">{row}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Columns:</span>
                                                                <span className="text-white font-medium">{col}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Cell Width:</span>
                                                                <span className="text-white font-medium">{width}px</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Cell Height:</span>
                                                                <span className="text-white font-medium">{height}px</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Horizontal Spacing:</span>
                                                                <span className="text-white font-medium">{hSpace}px</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Vertical Spacing:</span>
                                                                <span className="text-white font-medium">{vSpace}px</span>
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Cosmic layout specific variables */}
                                                    {layoutMode === 'cosmic' && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Rows:</span>
                                                                <span className="text-white font-medium">{row}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Columns:</span>
                                                                <span className="text-white font-medium">{col}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Cell Width:</span>
                                                                <span className="text-white font-medium">{width}px</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Cell Height:</span>
                                                                <span className="text-white font-medium">{height}px</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Fill Area:</span>
                                                                <span className="text-white font-medium">{fillArea}%</span>
                                                            </div>
                                                        </>
                                                    )}

                                                    {/* Radiant layout specific variables */}
                                                    {layoutMode === 'radiant' && (
                                                        <>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Rows:</span>
                                                                <span className="text-white font-medium">{row}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Columns:</span>
                                                                <span className="text-white font-medium">{col}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Cell Width:</span>
                                                                <span className="text-white font-medium">{width}px</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Cell Height:</span>
                                                                <span className="text-white font-medium">{height}px</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-bodytext">Fill Area:</span>
                                                                <span className="text-white font-medium">{fillArea}%</span>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default ShapesetInfoModal
