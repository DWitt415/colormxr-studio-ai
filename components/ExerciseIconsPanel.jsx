'use client'
import React, { useState, useEffect } from 'react'
import { useModal } from '@/contexts/ModalContext'
import { useReference } from '@/contexts/ReferenceContext'

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
  onReferenceToggle, // Legacy - will be overridden by context
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
  // Get modal context functions
  const { openPaletteModal, openCompositionModal } = useModal()

  // Get reference context
  const { toggleReference } = useReference()

  // Extract config values with defaults for backward compatibility
  const features = config?.features || {
    importSVG: true,
    exportPalette: true,
    exportComposition: true,
    showReference: true // Now enabled by default globally
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
      // Get current colors from the ColorControllerUI via the getCurrentColorsForExport function
      const currentColors = getCurrentColorsForExport();
      
      // Use global palette modal with current colors via ModalContext
      openPaletteModal({
        colors: [],
        backgroundColor: currentColors.backgroundColor || 'rgb(255,255,255)',
        colorPalette: currentColors.colorPalette || paletteColors
      })
    }
  }
  
  const handleCompositionOpen = () => {
    // Get current colors from the ColorControllerUI via the getCurrentColorsForExport function
    const currentColors = getCurrentColorsForExport();

    const modalData = {
      shapeColors: currentColors.shapeColors || [],
      backgroundColor: currentColors.backgroundColor || 'rgb(255,255,255)',
      row: currentColors.row || currentRow || 5,
      col: currentColors.col || currentCol || 5,
      // Pass layout information for export
      layoutMode: currentColors.layoutMode || 'grid',
      width: currentColors.width,
      height: currentColors.height,
      hSpace: currentColors.hSpace,
      vSpace: currentColors.vSpace,
      // Pass SVG-specific data for export
      svgPath: currentColors.svgPath,
      svgContent: currentColors.svgContent
    };

    console.log('📤 Passing to openCompositionModal:', {
      layoutMode: modalData.layoutMode,
      svgPath: modalData.svgPath,
      svgContent: modalData.svgContent ? `${modalData.svgContent.length} chars` : 'null'
    });

    // Use global composition modal with current data via ModalContext
    openCompositionModal(modalData);
  }
  
  // This function has been removed as it was unused.
  // handlePaletteOpen is the function that's actually connected to the onClick event
  
  // This function has been removed as it was unused.
  // handleCompositionOpen is the function that's actually connected to the onClick event

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
    console.log('Getting current colors for export...');

    if (typeof window !== 'undefined' && window.getCurrentColors) {
      try {
        const currentColors = window.getCurrentColors();
        console.log('Retrieved colors from ColorControllerUI:', currentColors);
        console.log('🔍 svgPath from getCurrentColors:', currentColors.svgPath);
        console.log('🔍 svgContent from getCurrentColors:', currentColors.svgContent ? `${currentColors.svgContent.length} chars` : 'null');

        return {
          shapeColors: currentColors.shapeColors || currentShapeColors,
          backgroundColor: currentColors.backgroundColor || currentBgColor,
          colorPalette: currentColors.colorPalette || paletteColors,
          // Include layout parameters for export
          layoutMode: currentColors.layoutMode,
          row: currentColors.row || currentRow,
          col: currentColors.col || currentCol,
          width: currentColors.width,
          height: currentColors.height,
          hSpace: currentColors.hSpace,
          vSpace: currentColors.vSpace,
          // Include SVG-specific data
          svgPath: currentColors.svgPath,
          svgContent: currentColors.svgContent
        };
      } catch (error) {
        console.error('Error getting current colors from ColorControllerUI:', error);
      }
    } else {
      console.log('window.getCurrentColors is not available, using fallback values');
    }

    // Fallback to config values if window function is not available
    const fallbackColors = {
      shapeColors: currentShapeColors,
      backgroundColor: currentBgColor,
      colorPalette: paletteColors,
      row: currentRow,
      col: currentCol
    };

    console.log('Using fallback colors:', fallbackColors);
    return fallbackColors;
  };

  return (
    <>
      <div className='fixed bottom-12 left-5 flex flex-col gap-3'>
        {/* Conditionally render reference toggle based on feature flag */}
        {features.showReference && (
          <div
            className='cursor-pointer'
            onClick={onReferenceToggle || toggleReference}
            title="Toggle Reference Image"
          >
            <img src="/icon-reference.svg" alt="Reference" />
          </div>
        )}

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
