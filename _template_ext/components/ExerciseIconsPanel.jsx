'use client'
import React, { useState } from 'react'

/**
 * A reusable component that renders the exercise control icons
 * Now supports config-based feature flags to conditionally show icons
 * 
 * Config format:
 * {
 *   features: { importSVG: true, exportPalette: true, exportComposition: true },
 *   showColorPalette: true
 * }
 */
const ExerciseIconsPanel = ({ 
  config,
  shapesetConfig,
  onInstructionOpen,
  // Legacy props for backward compatibility
  onPaletteOpen, 
  onShapesetOpen, 
  onImportSVGOpen,
  shapeColors, 
  backgroundColor, 
  row, 
  col,
  onSVGImport
}) => {
  // Extract config values with defaults for backward compatibility
  const features = config?.features || {
    importSVG: true,
    exportPalette: true,
    exportComposition: true
  };
  
  // Use shapesetConfig if provided, otherwise fall back to legacy props
  const currentShapeColors = shapesetConfig?.initShapeColors || shapeColors;
  const currentBgColor = shapesetConfig?.backgroundColor || backgroundColor;
  const currentRow = shapesetConfig?.row || row;
  const currentCol = shapesetConfig?.col || col;
  
  // Default palette colors (grayscale)
  const [paletteColors, setPaletteColors] = useState([
    "#D9D9D9",
    "#A7A7A7",
    "#949494",
    "#5B5B5B",
    "#3B3B3B"
  ])
  
  // Handler functions that use either provided handlers or global modals
  const handlePaletteOpen = () => {
    if (onPaletteOpen) {
      onPaletteOpen()
    } else {
      // Use global palette modal with current colors
      openPaletteModal({
        colors: [],
        backgroundColor: backgroundColor || 'rgb(255,255,255)',
        colorPalette: paletteColors
      })
    }
  }
  
  const handleCompositionOpen = () => {
    // Use global composition modal with current data
    openCompositionModal({
      shapeColors: shapeColors || [],
      backgroundColor: backgroundColor || 'rgb(255,255,255)',
      row: row || 5,
      col: col || 5
    })
  }
  
    const handlePaletteClick = () => {
    const colors = getCurrentColorsForExport()
    // Dispatch event for GalleryFooter to handle
    window.dispatchEvent(new CustomEvent('openPaletteModal', {
      detail: {
        colors: colors,
        backgroundColor: currentBgColor,
        row: currentRow,
        col: currentCol
      }
    }))
  }
  
  const handleCompositionClick = () => {
    const colors = getCurrentColorsForExport()
    // Dispatch event for GalleryFooter to handle
    window.dispatchEvent(new CustomEvent('openCompositionModal', {
      detail: {
        colors: colors,
        backgroundColor: currentBgColor,
        row: currentRow,
        col: currentCol
      }
    }))
  }

  const handleImportSVGClick = () => {
    // Dispatch event for GalleryFooter to handle
    window.dispatchEvent(new CustomEvent('openImportSVGModal', {
      detail: {
        onSVGImport: onSVGImport
      }
    }))
  }
  

  
  // Function to get current colors, preferring live colors from ColorControllerUI over static props
  const getCurrentColorsForExport = () => {
    if (typeof window !== 'undefined' && window.getCurrentColors) {
      try {
        const currentColors = window.getCurrentColors();
        return {
          shapeColors: currentColors.shapeColors || currentShapeColors,
          backgroundColor: currentColors.backgroundColor || currentBgColor,
          colorPalette: currentColors.colorPalette || paletteColors
        };
      } catch (error) {
        console.error('Error getting current colors from ColorControllerUI:', error);
      }
    }
    
    // Fallback to config values if window function is not available
    return {
      shapeColors: currentShapeColors,
      backgroundColor: currentBgColor,
      colorPalette: paletteColors
    };
  };

  return (
    <>
      <div className='fixed bottom-12 left-5 flex flex-col gap-3'>
        {/* Conditionally render palette export based on feature flag */}
        {features.exportPalette && (
          <div 
            className='cursor-pointer'
            onClick={handlePaletteOpen}
            title="Export Color Palette"
          >
            <img src="/palette-icon.svg" alt="Palette" />
          </div>
        )}
        
        {/* Conditionally render composition export based on feature flag */}
        {features.exportComposition && (
          <div 
            className='cursor-pointer'
            onClick={handleCompositionOpen}
            title="Export Shapeset"
          >
            <img src="/gallery-add-icon.svg" alt="Export Shapeset" />
          </div>
        )}
        
        {/* Conditionally render SVG import based on feature flag */}
        {features.importSVG && (
          <div 
            className='cursor-pointer'
            onClick={handleImportSVGClick}
            title="Import SVG"
          >
            <img src="/open-icon.svg" alt="Import" />
          </div>
        )}
        
        {/* Info icon is always shown */}
        <div
          onClick={onInstructionOpen}
          className='cursor-pointer'
          title="Exercise Information"
        >
          <img src="/info.svg" alt="Info" />
        </div>
      </div>
    </>
  )
}

export default ExerciseIconsPanel