import { Transition } from '@headlessui/react'
import { Fragment, useEffect } from 'react'

function SaveSuccessModal({ isOpen, closeModal, filename = "shapeset" }) {
    // Auto-dismiss the toast after 4 seconds
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                closeModal();
            }, 4000);
            
            return () => clearTimeout(timer);
        }
    }, [isOpen, closeModal]);
    
    return (
        <Transition
            show={isOpen}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0"
            enterTo="translate-y-0 opacity-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
        >
            <div
                className="pointer-events-auto fixed left-1/2 bottom-16 z-[1000] max-w-sm overflow-hidden rounded-lg shadow-lg group"
                style={{
                    position: 'fixed',
                    bottom: '4rem',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }}
                role="alert"
            >
                <div className="flex items-center gap-3 bg-background p-4">
                    {/* Success Icon */}
                    <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#787878">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Message */}
                    <div className="ml-2">
                        <p className="text-sm font-medium text-highlight">
                            Saved to Gallery
                        </p>
                    </div>

                    {/* Close Button - hidden by default, shown on hover */}
                    <div className="ml-auto pl-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="inline-flex rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                                <span className="sr-only">Close</span>
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    )
}

export default SaveSuccessModal
