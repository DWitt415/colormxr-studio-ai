import { Button, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import Link from 'next/link'
import { useState } from 'react'

function InstructionModalV({ isOpen, closeModal, children }) {
    return (
        <>
            <Transition appear show={isOpen}>
                <Dialog as="div" className="relative z-[999] focus:outline-none" onClose={closeModal}>
                    {/* Position exactly at header bottom and footer top */}
                    <div className="fixed inset-0 z-[999] overflow-hidden">
                        <div className="absolute left-0 top-[50px] bottom-[50px] flex">
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 transform-[scale(95%)]"
                                enterTo="opacity-100 transform-[scale(100%)]"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 transform-[scale(100%)]"
                                leaveTo="opacity-0 transform-[scale(95%)]"
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
                                        <div className="flex flex-col gap-[10px]">
                                            {children}
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
export default InstructionModalV