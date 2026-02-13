import { Button, Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import Link from 'next/link'
import { useState } from 'react'

function InstructionModal({ isOpen, closeModal, children }) {
    return (
        <>
            <Transition appear show={isOpen}>
                <Dialog as="div" className="relative z-[999] focus:outline-none" onClose={closeModal}>
                    <div className="fixed inset-0 z-[999] w-screen bg-black/80 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 transform-[scale(95%)]"
                                enterTo="opacity-100 transform-[scale(100%)]"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 transform-[scale(100%)]"
                                leaveTo="opacity-0 transform-[scale(95%)]"
                            >

                                <DialogPanel className="w-full max-w-3xl rounded-xl bg-background px-14 py-20 backdrop-blur-2xl text-bodytext modal-dialog">
                                    {/* Instruction Modal Content */}
                                    <div className="">
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
export default InstructionModal