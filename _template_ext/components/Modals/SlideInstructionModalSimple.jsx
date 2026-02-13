import { useState, useEffect } from 'react'
import { Transition, TransitionChild } from '@headlessui/react'
import Image from 'next/image'
import styles from '../../styles/SlideInstructionModalSimple.module.css'

function Slide({
    showModal,
    setShowModal,
    slideContent,
    imageVisiblity,
    slideIndex,
    slideDirection = null,
    animationDuration = 300 
}) {
    const [currentSlide, setCurrentSlide] = useState(slideIndex || 0)
    const [isAnimating, setIsAnimating] = useState(false)
    const totalSlides = slideContent.length

    useEffect(() => {
        setCurrentSlide(slideIndex || 0)
    }, [slideIndex])

    // Navigation functions  
    const goToNextSlide = () => {
        if (!isAnimating && currentSlide < totalSlides - 1) {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentSlide(current => current + 1)
                setIsAnimating(false)
            }, animationDuration / 2)
        }
    }

    const goToPrevSlide = () => {
        if (!isAnimating && currentSlide > 0) {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentSlide(current => current - 1)
                setIsAnimating(false)
            }, animationDuration / 2)
        }
    }

    const goToSlide = (index) => {
        if (!isAnimating && index !== currentSlide && index >= 0 && index < totalSlides) {
            setIsAnimating(true)
            setTimeout(() => {
                setCurrentSlide(index)
                setIsAnimating(false)
            }, animationDuration / 2)
        }
    }

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (!showModal) return

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault()
                    goToPrevSlide()
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    goToNextSlide()
                    break
                case 'Escape':
                    e.preventDefault()
                    setShowModal(false)
                    break
            }
        }

        if (showModal) {
            window.addEventListener('keydown', handleKeyPress)
            return () => window.removeEventListener('keydown', handleKeyPress)
        }
    }, [showModal, currentSlide, isAnimating])

    const closeModal = () => {
        if (!isAnimating) {
            setShowModal(false)
        }
    }

    if (!showModal) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background overlay */}
            <Transition
                show={showModal}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                    onClick={closeModal}
                />
            </Transition>

            {/* Modal content */}
            <Transition
                show={showModal}
                enter="transition-all duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition-all duration-300"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
            >
                <TransitionChild>
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] w-full mx-4 relative overflow-hidden">
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            disabled={isAnimating}
                            className={`absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm ${
                                isAnimating ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50'
                            }`}
                        >
                            ×
                        </button>

                        {/* Slide content container */}
                        <div className="relative overflow-hidden h-full">
                            <div 
                                className={`flex transition-transform duration-${animationDuration} ease-in-out h-full`}
                                style={{ 
                                    transform: `translateX(-${currentSlide * 100}%)`,
                                    transitionDuration: `${animationDuration}ms`
                                }}
                            >
                                {slideContent.map((slide, index) => (
                                    <div
                                        key={index}
                                        className="flex-shrink-0 w-full h-full p-8 overflow-y-auto"
                                        style={{ minHeight: '400px' }}
                                    >
                                        <div className="h-full flex flex-col">
                                            {slide.title && (
                                                <h2 className="text-2xl font-bold mb-6 text-gray-800">
                                                    {slide.title}
                                                </h2>
                                            )}
                                            
                                            <div className="flex-1 space-y-4">
                                                {slide.content && (
                                                    <div className="prose prose-lg max-w-none">
                                                        {typeof slide.content === 'string' ? (
                                                            <p className="text-gray-700 leading-relaxed">
                                                                {slide.content}
                                                            </p>
                                                        ) : (
                                                            slide.content
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {slide.image && imageVisiblity && (
                                                    <div className="flex justify-center mt-6">
                                                        <div className="max-w-md">
                                                            {typeof slide.image === 'string' ? (
                                                                <Image
                                                                    src={slide.image}
                                                                    alt={slide.title || `Slide ${index + 1}`}
                                                                    width={400}
                                                                    height={300}
                                                                    className="rounded-lg shadow-md"
                                                                />
                                                            ) : (
                                                                slide.image
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Navigation controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white rounded-full shadow-lg px-4 py-2">
                            {/* Previous arrow */}
                            <button 
                                onClick={goToPrevSlide}
                                disabled={isAnimating}
                                className={`p-1 ${isAnimating ? 'opacity-30' : 'opacity-100 hover:opacity-70'}`}
                            >
                                <Image 
                                    src="/slide-arrow.svg" 
                                    alt="Previous" 
                                    width={20} 
                                    height={20} 
                                    className="transform rotate-180" 
                                />
                            </button>
                            
                            {/* Slide counter */}
                            <div className="text-sm px-2 min-w-[40px] text-center">
                                {currentSlide + 1} / {totalSlides}
                            </div>
                            
                            {/* Next arrow */}
                            <button 
                                onClick={goToNextSlide}
                                disabled={isAnimating}
                                className={`p-1 ${isAnimating ? 'opacity-30' : 'opacity-100 hover:opacity-70'}`}
                            >
                                <Image 
                                    src="/slide-arrow.svg" 
                                    alt="Next" 
                                    width={20} 
                                    height={20} 
                                />
                            </button>
                        </div>
                    </div>
                </TransitionChild>
            </Transition>
        </div>
    );
}

export { Slide }
export default SlideInstructionModal