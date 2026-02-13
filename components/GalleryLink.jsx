'use client'

import React from 'react';
import { storePreviousExercisePath, debugSessionStorage } from '@/utils/navigation';

const GalleryLink = () => {
    const handleClick = () => {
        try {
            // Debug current session storage state before navigation
            debugSessionStorage();
            
            // Only store the path if we're on an exercise page
            if (window.location.pathname.includes('/exercise/')) {
                // Store the current path before navigating to the gallery
                storePreviousExercisePath();
                
                // Store extra info about the navigation that just happened
                sessionStorage.setItem('galleryEnteredFrom', window.location.pathname);
                sessionStorage.setItem('galleryEnteredAt', new Date().toISOString());
                
                console.log('🔄 Stored current path before going to gallery:', window.location.pathname);
            } else {
                console.log('⚠️ Not storing path - not on an exercise page');
            }
            
            // Debug again after storing
            debugSessionStorage();
            
            // Navigate to the gallery entry page which will redirect to the last viewed gallery
            window.location.href = '/gallery-entry';
        } catch (error) {
            console.error('Error navigating to gallery:', error);
            // Even if there's an error, try to navigate to the gallery entry page
            window.location.href = '/gallery-entry';
        }
    };
    
    return (
        <div 
            className='cursor-pointer'
            onClick={handleClick}
            title="View Gallery"
        >
            <img src="/gallery-icon.svg" alt="View Gallery" />
        </div>
    );
};

export default GalleryLink;
