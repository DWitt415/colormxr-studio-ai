'use client'

import React, { useState, useEffect } from 'react'
import ExerciseModalV from '@/components/Modals/ExerciseModalV'
import { storePreviousExercisePath, debugSessionStorage } from '@/utils/navigation'

function Footer({ lesson, title, customText = undefined, shapeColors = undefined, backgroundColor = undefined, row = undefined, col = undefined, showGallery = true, onMenuClick = null }) {
    // exercise Modal Control
    let [isexerciseModalOpen, setIsexerciseModalOpen] = useState(false)
    // Track whether we're on SVG viewer page
    const [isOnSvgViewer, setIsOnSvgViewer] = useState(false)
    // Track gallery context for compositions opened from gallery
    const [galleryContext, setGalleryContext] = useState(null)

    function exerciseModalOpen() {
        setIsexerciseModalOpen(true)
    }

    function exerciseModalClose() {
        setIsexerciseModalOpen(false)
    }

    // Check if we're on SVG viewer page and load gallery context
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOnSvgViewer(window.location.pathname.includes('/svg-viewer'));

            // Only load gallery context if we're on the shapeset-creator page
            // Clear it if we're on an exercise page
            if (window.location.pathname.includes('/shapeset-creator')) {
                // Check if we're editing a composition from the gallery
                try {
                    const galleryContextData = localStorage.getItem('galleryContext');
                    if (galleryContextData) {
                        const parsedData = JSON.parse(galleryContextData);
                        console.log('📍 Footer loaded gallery context:', parsedData);
                        setGalleryContext({
                            galleryName: parsedData.galleryName,
                            compositionTitle: parsedData.compositionTitle
                        });
                    }
                } catch (error) {
                    console.error('Error loading gallery context:', error);
                }
            } else if (window.location.pathname.includes('/exercise/')) {
                // Clear gallery context when on an exercise page
                console.log('🧹 Clearing gallery context - on exercise page');
                localStorage.removeItem('galleryContext');
                setGalleryContext(null);
            }
        }
    }, []);
    
    // Store exercise path on component mount
    useEffect(() => {
        // Only store the path if we're on an exercise page
        if (typeof window !== 'undefined' && window.location.pathname.includes('/exercise/')) {
            // Store the current path
            storePreviousExercisePath();
            console.log('🔄 Path stored on component mount:', window.location.pathname);
            debugSessionStorage();
            
            // Create a persistent record of visited exercise pages
            try {
                // Get existing history or initialize empty array
                const history = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
                
                // Add current path if not already the most recent entry
                if (history.length === 0 || history[history.length - 1] !== window.location.pathname) {
                    // Limit history to last 5 entries
                    if (history.length >= 5) {
                        history.shift(); // Remove oldest entry
                    }
                    history.push(window.location.pathname);
                    localStorage.setItem('exerciseHistory', JSON.stringify(history));
                    console.log('📚 Updated exercise history:', history);
                }
            } catch (err) {
                console.error('Error updating exercise history:', err);
            }
        }
    }, []);

    return (
      <>
        <div className='bg-[#3d3d3d] h-[40px] w-full px-4 flex items-center justify-between border-t-2 border-[#606060] fixed bottom-0'>
          <div className="flex items-center gap-4">
            <div onClick={onMenuClick ?? exerciseModalOpen}>
              <img src='/menu.svg' alt='menu' className='h-[20px] cursor-pointer' />
            </div>
            <h3>
              {/* Show gallery context if available, otherwise show lesson and title */}
              {galleryContext ? (
                <>
                  <span className='text-[#aeaeae] text-sm+ font-medium'>{galleryContext.galleryName}</span>
                  <span className='text-[#aeaeae] text-sm+ font-light'> - </span>
                  <span className='text-[#aeaeae] text-sm+ font-light'>{galleryContext.compositionTitle}</span>
                </>
              ) : (
                <>
                  <span className='text-[#aeaeae] text-sm+ font-medium'>{lesson}</span>
                  {title && (
                    <>
                      <span className='text-[#aeaeae] text-sm+ font-light'> - </span>
                      <span className='text-[#aeaeae] text-sm+ font-light'>{title}</span>
                    </>
                  )}
                </>
              )}
            </h3>
            <ExerciseModalV
              isOpen={isexerciseModalOpen}
              closeModal={exerciseModalClose}
            />
          </div>
          
          {/* Center gallery icon */}
          {showGallery && (
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <div onClick={() => {
                // Store the current path before navigating
                storePreviousExercisePath();
                // Clear gallery context when returning to gallery
                localStorage.removeItem('galleryContext');
                // Navigate to gallery entry page, which will redirect to the last viewed gallery
                window.location.href = '/gallery-entry';
              }}
              title="Enter Gallery"
              className="cursor-pointer">
                <img
                  src='/gallery-icon.svg'
                  alt='Gallery'
                  className="h-[22px] hover:opacity-80 transition-opacity"
                />
              </div>
            </div>
          )}
          
          <div className="w-[20px]"></div> {/* Empty div for balanced spacing */}
        </div>
      </>
    );
}

export default Footer