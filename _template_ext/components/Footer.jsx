'use client'

import React, { useState, useEffect } from 'react'
import ExerciseModalV from './Modals/ExerciseModalV'
import { storePreviousExercisePath, debugSessionStorage } from '../utils/navigation'

function Footer({ lesson, exerciseNumber, title, customText, shapeColors, backgroundColor, row, col }) {
    // exercise Modal Control
    let [isexerciseModalOpen, setIsexerciseModalOpen] = useState(false)
    // Track whether we're on SVG viewer page
    const [isOnSvgViewer, setIsOnSvgViewer] = useState(false)

    function exerciseModalOpen() {
        setIsexerciseModalOpen(true)
    }

    function exerciseModalClose() {
        setIsexerciseModalOpen(false)
    }
    
    // Check if we're on SVG viewer page
    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsOnSvgViewer(window.location.pathname.includes('/svg-viewer'));
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
            <div onClick={exerciseModalOpen}>
              <img src='/humburger.svg' alt='logo' className='h-[20px] cursor-pointer' />
            </div>
            <h3>
              {/* Show file name for SVG viewer page - fixed to avoid window not defined error */}
              {isOnSvgViewer && title ? (
                <span className='text-[#aeaeae] text-sm+ font-medium'>{title}</span>
              ) : (
                /* Default exercise page content */
                (exerciseNumber === '' ? (
                  <span className='text-[#aeaeae] text-sm+ font-medium'>{lesson}</span>
                ) : (
                  <>
                    <span className='text-[#aeaeae] text-sm+ font-medium'>{lesson}</span>
                    <span className='text-[#aeaeae] text-sm+ font-light'> - </span>
                    <span className='text-[#aeaeae] text-sm+ font-light'>{exerciseNumber}</span>
                    <span className='text-[#aeaeae] text-sm+ font-light'> - </span>
                    <span className='text-[#aeaeae] text-sm+ font-light'>{title}</span>
                  </>
                ))
              )}
            </h3>
            <ExerciseModalV
              isOpen={isexerciseModalOpen}
              closeModal={exerciseModalClose}
            />
          </div>
          
          {/* Center gallery icon */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <div onClick={() => {
              // Store the current path before navigating
              storePreviousExercisePath();
              // Navigate to gallery entry page, which will redirect to the last viewed gallery
              window.location.href = '/gallery-entry';
            }} 
            title="Gallery"
            className="cursor-pointer">
              <img 
                src='/gallery-icon.svg' 
                alt='Gallery' 
                className="h-[22px] hover:opacity-80 transition-opacity"
              />
            </div>
          </div>
          
          <div className="w-[20px]"></div> {/* Empty div for balanced spacing */}
        </div>
      </>
    );
}

export default Footer