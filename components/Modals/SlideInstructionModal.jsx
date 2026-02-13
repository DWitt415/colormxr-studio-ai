import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useState, useEffect, Children, useRef, Fragment } from 'react'
import Image from 'next/image'
import React from 'react'
import styles from './SlideInstructionModal.module.css'

// Create a Slide component to use as a wrapper
// Using a "proper" component definition to ensure React recognizes it correctly
const Slide = React.memo(React.forwardRef(function SlideComponent({ children }, ref) {
    return <div ref={ref} className="slide-content">{children}</div>;
}));

// Add display name to help with component identification
Slide.displayName = 'Slide';

function SlideInstructionModal({ isOpen, closeModal, children, forceAllChildrenAsSlides = false }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slideDirection, setSlideDirection] = useState('left'); // 'left' for initial modal entry, 'right' for forward navigation
    const [isAnimating, setIsAnimating] = useState(false);
    const lastSlideIndex = useRef(0);
    
    // Add debug mode for animation troubleshooting - enable for debugging
    const [debugAnimation, setDebugAnimation] = useState(true);
    
    // Process and normalize children into slides
    const processChildren = () => {
        // Convert children to array
        const childArray = Children.toArray(children);
        // Debug info about received children
        console.log('Raw children:', childArray.length);
        
        // Check for empty children case
        if (childArray.length === 0) {
            console.warn('No children provided to SlideInstructionModal');
            return [];
        }
        
        // Force all children as slides if specified
        if (forceAllChildrenAsSlides) {
            console.log('Forcing all children as slides');
            // Wrap each child in a Slide if not already a slide
            return childArray.map((child, index) => 
                React.isValidElement(child) && 
                    (child.type === Slide || 
                    (typeof child.type === 'function' && 
                        (child.type.displayName === 'Slide' || child.type.name === 'Slide'))) 
                ? child 
                : <Slide key={`forced-slide-${index}`}>{child}</Slide>
            );
        }
        
        // A more direct approach to identify Slides by checking for a special property rather than component type
        // First, let's ensure each Slide component has a special property
        const markedChildArray = childArray.map(child => {
            if (!React.isValidElement(child)) return child;
            
            // If it looks like our Slide component, mark it as such
            const type = child.type;
            const props = child.props || {};
            
            const isSlideComponent = type === Slide || 
                (typeof type === 'function' && 
                (type.displayName === 'Slide' || type.name === 'SlideComponent' || type.name === 'Slide')) ||
                props.className === 'slide-content' ||
                (typeof props.className === 'string' && props.className.includes('slide-content'));
            
            if (isSlideComponent) {
                console.log('Identified a slide component!');
                // Clone the element and add a special marker prop
                return React.cloneElement(child, { 
                    ...props, 
                    'data-is-slide': true,
                    key: props.key || `slide-key-${Math.random()}`
                });
            }
            
            return child;
        });
        
        // Now filter based on the marker property
        const filteredSlides = markedChildArray.filter(child => 
            React.isValidElement(child) && 
            child.props && 
            child.props['data-is-slide'] === true
        );
        
        console.log('Filtered slides:', filteredSlides.length);
        
        // If no slides were detected but we have children, warn and try an alternative approach
        if (filteredSlides.length === 0 && childArray.length > 0) {
            console.warn('No Slide components detected but children exist - falling back to manual wrapping');
            
            // Try to detect if we have multiple text sections that should be separate slides
            // We'll look for ExText components with TopMargin prop as potential slide delimiters
            const manualSlides = [];
            let currentSlideContent = [];
            
            childArray.forEach((child, index) => {
                // Start a new slide if this is an ExText with TopMargin or we haven't started any slides yet
                const isExTextWithTopMargin = React.isValidElement(child) && 
                    child.type && 
                    (child.type.name === 'ExText' || child.type.displayName === 'ExText') && 
                    child.props && 
                    child.props.TopMargin;
                
                if (isExTextWithTopMargin && currentSlideContent.length > 0) {
                    // We have content and found a new section, so create a slide with existing content
                    manualSlides.push(
                        <Slide key={`manual-slide-${manualSlides.length}`}>
                            {currentSlideContent}
                        </Slide>
                    );
                    currentSlideContent = [child]; // Start new slide with this ExText
                } else {
                    // Add to current slide content
                    currentSlideContent.push(child);
                }
            });
            
            // Add any remaining content as the final slide
            if (currentSlideContent.length > 0) {
                manualSlides.push(
                    <Slide key={`manual-slide-${manualSlides.length}`}>
                        {currentSlideContent}
                    </Slide>
                );
            }
            
            // If we managed to create multiple slides, use them
            if (manualSlides.length > 1) {
                console.log('Created manual slides:', manualSlides.length);
                return manualSlides;
            }
            
            // Otherwise, just wrap everything in a single slide
            return [
                <Slide key="single-slide">
                    {childArray}
                </Slide>
            ];
        }
        
        return filteredSlides;
    };
    
    const slides = processChildren();
    const totalSlides = slides.length;
    
    // Reset to first slide when modal opens or when slides change
    useEffect(() => {
        if (isOpen) {
            setCurrentSlide(0);
            setSlideDirection('left'); // Always enter from left
            console.log('Modal opened with', totalSlides, 'slides');
        }
    }, [isOpen, totalSlides]);
    
    const goToNextSlide = () => {
        if (currentSlide < totalSlides - 1 && !isAnimating) {
            // Start animation sequence
            setIsAnimating(true);
            lastSlideIndex.current = currentSlide;
            setSlideDirection('right'); // Moving forward - current slides out left, new slides in from right
            
            // Allow animation to start before changing slides
            requestAnimationFrame(() => {
                setTimeout(() => {
                    setCurrentSlide(currentSlide + 1);
                    
                    // Complete the animation, then allow more interactions
                    setTimeout(() => {
                        setIsAnimating(false);
                    }, 500); // Match with CSS animation duration
                }, 50); // Short delay for animation registration
            });
        }
    };

    const goToPrevSlide = () => {
        if (currentSlide > 0 && !isAnimating) {
            // Start animation sequence
            setIsAnimating(true);
            lastSlideIndex.current = currentSlide;
            setSlideDirection('left'); // Moving backward - current slides out right, new slides in from left
            
            // Allow animation to start before changing slides
            requestAnimationFrame(() => {
                setTimeout(() => {
                    setCurrentSlide(currentSlide - 1);
                    
                    // Complete the animation, then allow more interactions
                    setTimeout(() => {
                        setIsAnimating(false);
                    }, 500); // Match with CSS animation duration
                }, 50); // Short delay for animation registration
            });
        }
    };
    
    // Add keyboard navigation - now defined after the navigation functions
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpen) return;
            
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                goToNextSlide();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                goToPrevSlide();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, currentSlide, isAnimating]);

    return (
        <>
            <Transition appear show={isOpen} as={React.Fragment}>
                <Dialog as="div" className="relative z-[999] focus:outline-none" onClose={closeModal}>
                    {/* Position exactly at header bottom and footer top */}
                    <div className="fixed inset-0 z-[999] overflow-hidden">
                        <div className="absolute left-0 top-[50px] bottom-[50px] flex">
                            <TransitionChild
                                enter="transition ease-out duration-500"
                                enterFrom="transform translate-x-[-100%] opacity-0"
                                enterTo="transform translate-x-0 opacity-100"
                                leave="transition ease-in duration-300"
                                leaveFrom="transform translate-x-0 opacity-100"
                                leaveTo="transform translate-x-[-100%] opacity-0"
                            >
                                <DialogPanel className={`w-[420px] h-[360px] rounded-r-xl bg-background px-8 py-6 backdrop-blur-2xl text-bodytext flex flex-col modal-dialog ${styles.modalSlideIn}`}>
                                    {/* Content fills entire height with items centered vertically */}
                                    <div className={`flex-grow flex items-center overflow-y-auto ${styles.scrollbarHide}`}>
                                        <div className={`flex flex-col gap-[10px] relative w-full ${styles.slideContainer}`}>
                                            {/* Current slide with animation */}
                                            <div 
                                                className={`${styles.slideContent} ${
                                                    isOpen && currentSlide === 0 && !isAnimating
                                                        ? styles.slideInLeft
                                                        : slideDirection === 'right'
                                                        ? styles.slideInRight
                                                        : styles.slideInLeft
                                                }`}
                                                key={`slide-${currentSlide}`} // Force remounting to trigger animation
                                                style={debugAnimation ? {
                                                    border: '2px solid green',
                                                    position: 'relative'
                                                } : {}}
                                            >
                                                {debugAnimation && (
                                                    <div style={{position: 'absolute', top: 0, right: 0, background: 'green', color: 'white', padding: '2px 5px', fontSize: '10px'}}>
                                                        Current: {currentSlide} ({slideDirection})
                                                    </div>
                                                )}
                                                {/* Show content with fallback */}
                                                {totalSlides > 0 && currentSlide < totalSlides ? (
                                                    slides[currentSlide]
                                                ) : (
                                                    <div className="p-4">
                                                        {totalSlides === 0 ? (
                                                            // Fallback for when slide detection failed but we have children
                                                            Children.count(children) > 0 ? (
                                                                <>
                                                                    <div className="text-amber-500 mb-4">Slide detection issue - showing all content</div>
                                                                    {children}
                                                                </>
                                                            ) : (
                                                                <div>No slide content available</div>
                                                            )
                                                        ) : (
                                                            <div>Invalid slide index</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Previous slide with animation - shown during transitions */}
                                            {isAnimating && (
                                                <div 
                                                    className={`${styles.slideContent} ${styles.slideAbsolute} ${
                                                        slideDirection === 'right'
                                                            ? styles.slideOutLeft
                                                            : styles.slideOutRight
                                                    }`}
                                                    style={ debugAnimation ? 
                                                        { pointerEvents: 'none', border: '2px solid red', position: 'absolute' } : 
                                                        { pointerEvents: 'none' }
                                                    }
                                                    key={`prev-slide-${lastSlideIndex.current}`}
                                                >
                                                    {debugAnimation && (
                                                        <div style={{position: 'absolute', top: 0, right: 0, background: 'red', color: 'white', padding: '2px 5px', fontSize: '10px'}}>
                                                            Prev: {lastSlideIndex.current} ({slideDirection})
                                                        </div>
                                                    )}
                                                    {totalSlides > 0 && lastSlideIndex.current < totalSlides ? slides[lastSlideIndex.current] : <div>No previous slide content</div>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Slide navigation */}
                                    <div className="flex justify-end items-center mt-4 gap-3 pb-2">
                                        {/* Previous arrow */}
                                        <button 
                                            onClick={goToPrevSlide}
                                            disabled={currentSlide === 0 || isAnimating}
                                            className={`p-1 ${currentSlide === 0 || isAnimating ? 'opacity-30' : 'opacity-100 hover:opacity-70'}`}
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
                                            {totalSlides > 0 ? `${currentSlide + 1} / ${totalSlides}` : 'No slides'}
                                        </div>
                                        
                                        {/* Next arrow */}
                                        <button 
                                            onClick={goToNextSlide}
                                            disabled={currentSlide === totalSlides - 1 || isAnimating}
                                            className={`p-1 ${currentSlide === totalSlides - 1 || isAnimating ? 'opacity-30' : 'opacity-100 hover:opacity-70'}`}
                                        >
                                            <Image 
                                                src="/slide-arrow.svg" 
                                                alt="Next" 
                                                width={20} 
                                                height={20} 
                                            />
                                        </button>
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

// Export both the modal and the Slide component
// Make sure we're explicitly exporting the Slide component first
export { Slide };
export default SlideInstructionModal;
