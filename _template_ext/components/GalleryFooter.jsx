'use client'

import React, { useState, useEffect } from 'react'
import { getPreviousExercisePath, debugSessionStorage, getLastViewedGallery, GALLERY_TYPES } from '../utils/navigation'
import PaletteModal from './Modals/PaletteModal'
import CompositionModal from './Modals/CompositionModal'
import ImportSVGModal from './Modals/ImportSVGModal'

function GalleryFooter({ title }) {
  // State to track current page
  const [currentPath, setCurrentPath] = useState('');
  
  // Modal states
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false)
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false)
  const [isImportSVGModalOpen, setIsImportSVGModalOpen] = useState(false)
  
  // Modal data states
  const [paletteModalData, setPaletteModalData] = useState({
    colors: [],
    backgroundColor: 'rgb(255,255,255)',
    colorPalette: ['#D9D9D9', '#A7A7A7', '#949494', '#5B5B5B', '#3B3B3B']
  })
  const [compositionModalData, setCompositionModalData] = useState({
    shapeColors: [],
    backgroundColor: 'rgb(255,255,255)',
    row: 5,
    col: 5
  })
  const [importSVGData, setImportSVGData] = useState({
    onSVGImport: null
  })
  
  // Update path on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);
  
  // Event listeners for modal events
  useEffect(() => {
    const handleOpenPaletteModal = (event) => {
      console.log('Opening palette modal with data:', event.detail)
      setPaletteModalData(prev => ({ ...prev, ...event.detail }))
      setIsPaletteModalOpen(true)
    }
    
    const handleOpenCompositionModal = (event) => {
      console.log('Opening composition modal with data:', event.detail)
      setCompositionModalData(prev => ({ ...prev, ...event.detail }))
      setIsCompositionModalOpen(true)
    }
    
    const handleOpenImportSVGModal = (event) => {
      console.log('Opening import SVG modal with data:', event.detail)
      setImportSVGData(prev => ({ ...prev, ...event.detail }))
      setIsImportSVGModalOpen(true)
    }
    
    // Add event listeners
    window.addEventListener('openPaletteModal', handleOpenPaletteModal)
    window.addEventListener('openCompositionModal', handleOpenCompositionModal)
    window.addEventListener('openImportSVGModal', handleOpenImportSVGModal)
    
    // Cleanup
    return () => {
      window.removeEventListener('openPaletteModal', handleOpenPaletteModal)
      window.removeEventListener('openCompositionModal', handleOpenCompositionModal)
      window.removeEventListener('openImportSVGModal', handleOpenImportSVGModal)
    }
  }, [])
  
  // Get the previous exercise path using the utility function
  const handleBackClick = () => {
    try {
      // Debug the current session storage
      debugSessionStorage();
      
      // Get the stored path or default to a specific exercise
      const prevPath = getPreviousExercisePath();
      console.log('🏠 Returning to exercise:', prevPath);
      
      // Store a flag in sessionStorage to indicate we're returning from gallery
      // This will be used by exercise pages to prevent showing the instruction modal
      sessionStorage.setItem('returningFromGallery', 'true');
      
      // Try using Next.js router first (if available)
      if (typeof window !== 'undefined') {
        try {
          // Navigate to the previous exercise path
          window.location.href = prevPath;
        } catch (routerError) {
          console.error('Router navigation failed:', routerError);
          // Fallback to direct navigation
          window.location.assign(prevPath);
        }
      } else {
        // Direct navigation as fallback
        window.location.href = prevPath;
      }
    } catch (error) {
      console.error('Error in navigation:', error);
      // Fallback to specific exercises if there's an error
      window.location.href = '/exercise/section4/ex-5-4';
    }
  };
  
  // Determine current page to highlight the appropriate link
  const isCompositionsPage = currentPath === '/gallery';
  const isPalettesPage = currentPath === '/palette-gallery';

  return (
    <div className='bg-[#3d3d3d] h-[40px] w-full px-4 flex items-center justify-between border-t-2 border-[#606060] fixed bottom-0'>
      <div className="flex items-center gap-4">
        <a 
          href="/palette-gallery" 
          className={`${isPalettesPage ? 'text-[#5771FF]' : 'text-[#aeaeae]'} hover:text-white text-sm+`}
        >
          Saved Palettes
        </a>
        <span className="text-[#ababab] text-sm">|</span>
        <a 
          href="/gallery" 
          className={`${isCompositionsPage ? 'text-[#5771FF]' : 'text-[#aeaeae]'} hover:text-white text-sm+`}
        >
          Color Compositions
        </a>
      </div>
      
      {/* Center home icon */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <div 
          onClick={handleBackClick}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          aria-label="Return to Previous Exercise"
        >
          <img 
            src="/home-icon.svg" 
            alt="Return to Exercise" 
            className="h-[24px] w-[24px] hover:opacity-80 transition-opacity"
            title="Return to Previous Exercise"
          />
        </div>
      </div>
      
      <div className="w-[20px]"></div> {/* Empty div for balanced spacing */}
      
      {/* Global Modals */}
      <PaletteModal
        isOpen={isPaletteModalOpen}
        closeModal={() => setIsPaletteModalOpen(false)}
        colors={paletteModalData.colors}
        backgroundColor={paletteModalData.backgroundColor}
        colorPalette={paletteModalData.colorPalette}
      />
      
      <CompositionModal
        isOpen={isCompositionModalOpen}
        closeModal={() => setIsCompositionModalOpen(false)}
        shapeColors={compositionModalData.shapeColors}
        backgroundColor={compositionModalData.backgroundColor}
        row={compositionModalData.row}
        col={compositionModalData.col}
      />
      
      <ImportSVGModal
        isOpen={isImportSVGModalOpen}
        closeModal={() => setIsImportSVGModalOpen(false)}
        onSVGImport={importSVGData.onSVGImport || ((data) => {
          console.log("SVG Import data:", data)
          
          // If no handler was provided, handle it by redirecting to the SVG viewer
          try {
            // Store the data for the SVG viewer
            localStorage.setItem('importedSVGData', JSON.stringify(data));
            
            // Navigate to the dedicated SVG viewer page
            window.location.href = `/svg-viewer`;
          } catch (error) {
            console.error("Error handling SVG import:", error);
          }
        })}
      />
    </div>
  );
}

export default GalleryFooter;