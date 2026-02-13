import { useState, useEffect } from 'react';

/**
 * Hook to check if the user is returning from the gallery
 * and handle instruction modal visibility accordingly.
 * 
 * @returns {boolean} - Whether the instruction modal should be initially shown
 */
export const useInstructionModalControl = () => {
  // Start with default value during SSR (true = show modal)
  const [shouldShowModal, setShouldShowModal] = useState(true);
  
  // Flag to track if we've already checked sessionStorage
  const [hasChecked, setHasChecked] = useState(false);
  
  useEffect(() => {
    // Skip if we've already checked
    if (hasChecked) return;
    
    // This only runs on the client side after component mount
    if (typeof window !== 'undefined' && !hasChecked) {
      // Mark that we've checked to prevent repeated checks
      setHasChecked(true);
      
      const returningFromGallery = sessionStorage.getItem('returningFromGallery');
      
      if (returningFromGallery === 'true') {
        // Don't show modal when returning from gallery
        setShouldShowModal(false);
        
        // Clear the flag so it doesn't affect future visits to this page
        sessionStorage.removeItem('returningFromGallery');
        
        // Also log for debugging
        console.log('[DEBUG] Returning from gallery - hiding instruction modal');
      }
    }
  }, [hasChecked]);
  
  return shouldShowModal;
};
