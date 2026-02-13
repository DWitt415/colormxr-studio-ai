'use client'

import React, { createContext, useContext, useState } from 'react'
import PaletteModal from '@/components/Modals/PaletteModal'
import CompositionModal from '@/components/Modals/CompositionModal'

const ModalContext = createContext()

export const useModal = () => {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

export const ModalProvider = ({ children }) => {
  // Palette Modal State
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false)
  const [paletteModalData, setPaletteModalData] = useState({
    colors: [],
    backgroundColor: 'rgb(255,255,255)',
    colorPalette: []
  })

  // Composition/Shapeset Modal State
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false)
  const [compositionModalData, setCompositionModalData] = useState({
    shapeColors: [],
    backgroundColor: 'rgb(255,255,255)',
    row: 5,
    col: 5,
    layoutMode: 'grid',
    width: 150,
    height: 150,
    hSpace: 0,
    vSpace: 0,
    svgPath: null,
    svgContent: null
  })

  // Palette Modal Functions
  const openPaletteModal = (data = {}) => {
    setPaletteModalData(prev => ({ ...prev, ...data }))
    setIsPaletteModalOpen(true)
  }

  const closePaletteModal = () => {
    setIsPaletteModalOpen(false)
  }

  // Composition Modal Functions
  const openCompositionModal = (data = {}) => {
    setCompositionModalData(prev => ({ ...prev, ...data }))
    setIsCompositionModalOpen(true)
  }

  const closeCompositionModal = () => {
    setIsCompositionModalOpen(false)
  }

  const value = {
    // Palette Modal
    isPaletteModalOpen,
    openPaletteModal,
    closePaletteModal,
    paletteModalData,
    
    // Composition Modal
    isCompositionModalOpen,
    openCompositionModal,
    closeCompositionModal,
    compositionModalData
  }

  return (
    <ModalContext.Provider value={value}>
      {children}
      
      {/* Global Modals */}
      <PaletteModal
        isOpen={isPaletteModalOpen}
        closeModal={closePaletteModal}
        colors={paletteModalData.colors}
        backgroundColor={paletteModalData.backgroundColor}
        colorPalette={paletteModalData.colorPalette}
      />
      
      <CompositionModal
        isOpen={isCompositionModalOpen}
        closeModal={closeCompositionModal}
        shapeColors={compositionModalData.shapeColors}
        backgroundColor={compositionModalData.backgroundColor}
        row={compositionModalData.row}
        col={compositionModalData.col}
        layoutMode={compositionModalData.layoutMode}
        width={compositionModalData.width}
        height={compositionModalData.height}
        hSpace={compositionModalData.hSpace}
        vSpace={compositionModalData.vSpace}
        svgPath={compositionModalData.svgPath}
        svgContent={compositionModalData.svgContent}
      />
    </ModalContext.Provider>
  )
}