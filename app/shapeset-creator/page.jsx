'use client'
import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import ColorControllerUI from '@/components/ColorControllerUI'
import Footer from '@/components/Footer'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'
import ShapesetInfoModal from '@/components/Modals/ShapesetInfoModal'

function ShapesetCreatorContent() {
    console.log('🔄 ===== SHAPESET CREATOR COMPONENT RENDER =====')

    const searchParams = useSearchParams()
    const [loadedColors, setLoadedColors] = useState(null)
    const [loadedBgColor, setLoadedBgColor] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showPanels, setShowPanels] = useState(true)
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

    // Extract parameters from URL
    const layoutMode = searchParams.get('layoutMode') || 'grid'
    const row = parseInt(searchParams.get('row')) || 5
    const col = parseInt(searchParams.get('col')) || 5
    const width = parseInt(searchParams.get('width')) || 150
    const height = parseInt(searchParams.get('height')) || 150
    const hSpace = parseInt(searchParams.get('hSpace')) || 0
    const vSpace = parseInt(searchParams.get('vSpace')) || 0
    const fillArea = searchParams.get('fillArea') === 'true'
    const svgPath = searchParams.get('svgPath') || null

    console.log('📋 ===== URL PARAMETERS EXTRACTED =====')
    console.log('📋 Layout Mode:', layoutMode)
    console.log('📋 Row:', row, 'Col:', col)
    console.log('📋 SVG Path:', svgPath)
    console.log('📋 Full params:', {
        layoutMode,
        row,
        col,
        width,
        height,
        hSpace,
        vSpace,
        fillArea,
        svgPath
    })

    // Track when layout parameters change
    useEffect(() => {
        console.log('⚡ Layout parameters changed:', {
            layoutMode,
            row,
            col,
            svgPath,
            width,
            height
        })
    }, [layoutMode, row, col, svgPath, width, height, hSpace, vSpace])

    // Check localStorage for saved shapeset data on mount
    useEffect(() => {
        console.log('🔍 ShapesetCreator useEffect running...')
        if (typeof window !== 'undefined') {
            try {
                const editingShapeset = localStorage.getItem('editingShapeset')
                console.log('🔍 Raw localStorage data:', editingShapeset)

                if (editingShapeset) {
                    const parsed = JSON.parse(editingShapeset)
                    console.log('📂 Loading saved shapeset:', parsed)
                    console.log('📂 Shape colors from parsed:', parsed.shapeColors)
                    console.log('📂 Background color from parsed:', parsed.backgroundColor)

                    // Set the loaded colors and background
                    if (parsed.shapeColors && Array.isArray(parsed.shapeColors)) {
                        console.log('✅ Setting loaded colors:', parsed.shapeColors)
                        setLoadedColors(parsed.shapeColors)
                    } else {
                        console.warn('⚠️ No valid shape colors found in saved data')
                    }

                    if (parsed.backgroundColor) {
                        console.log('✅ Setting loaded background color:', parsed.backgroundColor)
                        setLoadedBgColor(parsed.backgroundColor)
                    }

                    // If this shapeset has gallery context, preserve it separately for the Footer
                    if (parsed.galleryName && parsed.compositionTitle) {
                        console.log('📍 Preserving gallery context for footer')
                        localStorage.setItem('galleryContext', JSON.stringify({
                            galleryName: parsed.galleryName,
                            compositionTitle: parsed.compositionTitle
                        }))
                    }

                    // Clear the main editingShapeset item after loading
                    localStorage.removeItem('editingShapeset')
                    console.log('🧹 Cleared editingShapeset from localStorage')
                } else {
                    console.log('ℹ️ No saved shapeset found in localStorage')
                }
            } catch (error) {
                console.error('❌ Error loading saved shapeset:', error)
            } finally {
                // Mark as done loading whether we found data or not
                setIsLoading(false)
            }
        } else {
            setIsLoading(false)
        }
    }, [])

    // Keyboard event listener for 'h' key to toggle panels visibility
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Check if the pressed key is 'h' or 'H'
            if (event.key === 'h' || event.key === 'H') {
                // Don't toggle if any modal is open
                // Check for common modal indicators: aria-modal, role="dialog", or .modal-open class
                const hasOpenModal =
                    document.querySelector('[role="dialog"]') !== null ||
                    document.querySelector('[aria-modal="true"]') !== null ||
                    document.body.classList.contains('modal-open') ||
                    isInfoModalOpen;

                if (!hasOpenModal) {
                    setShowPanels(prev => !prev)
                    console.log('🔄 Toggled panels visibility')
                } else {
                    console.log('🚫 Modal is open, ignoring h key')
                }
            }
        }

        window.addEventListener('keydown', handleKeyPress)

        return () => {
            window.removeEventListener('keydown', handleKeyPress)
        }
    }, [isInfoModalOpen])

    // Background color - use loaded color if available, otherwise default to white
    const bgColor = loadedBgColor || 'rgb(255,255,255)'

    // Predefined grayscale colors for shapes
    const initHexShapeColors = [
        0xAFAFAF,
        0xB4B4B4,
        0xB9B9B9,
        0xC3C3C3,
        0xD2D2D2,
        0xDCDCDC,
        0xD2D2D2,
        0xBEBEBE,
    ]

    // Convert hex colors to rgb format for ColorControllerUI
    const hexToRgb = (hex) => {
        const r = (hex >> 16) & 0xFF
        const g = (hex >> 8) & 0xFF
        const b = hex & 0xFF
        return `rgb(${r},${g},${b})`
    }

    // Generate initShapeColors array based on total number of shapes
    let totalShapes;
    if (layoutMode === 'cosmic') {
        totalShapes = col; // Number of concentric layers
    } else if (layoutMode === 'radiant') {
        totalShapes = col; // Number of triangular segments
    } else if (layoutMode === 'svg' && loadedColors) {
        // For SVG mode with loaded colors, use the loaded colors length
        totalShapes = loadedColors.length;
    } else {
        totalShapes = row * col; // Grid cells
    }

    // Use loaded colors if available, otherwise generate default grayscale colors
    const initShapeColors = loadedColors || Array.from({ length: totalShapes }, (_, i) =>
        hexToRgb(initHexShapeColors[i % initHexShapeColors.length])
    )

    console.log('🎨 ===== SHAPESET CREATOR RENDER =====')
    console.log('🎨 Layout mode:', layoutMode)
    console.log('🎨 SVG path:', svgPath)
    console.log('🎨 Total shapes calculated:', totalShapes)
    console.log('🎨 Loaded colors state:', loadedColors)
    console.log('🎨 Final initShapeColors being passed to ColorControllerUI:', initShapeColors)
    console.log('🎨 initShapeColors length:', initShapeColors?.length)

    // Generate title based on layout mode
    const getTitle = () => {
        if (layoutMode === 'cosmic') {
            return 'Cosmic'
        } else if (layoutMode === 'radiant') {
            return 'Radiant'
        } else {
            return 'Grid'
        }
    }

    // Don't render ColorControllerUI until we've checked localStorage
    // This ensures we use the correct colors from the start
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#2A2A2A]">
                <div className="text-[#AEAEAE]">Loading shapeset...</div>
            </div>
        )
    }

    return (
        <div>
            <Header />
            <div className='h-[70vh] lg:h-[91vh] flex items-center justify-center relative'>
                <div className='flex justify-center items-center w-full'>
                    <ColorControllerUI
                        layoutMode={layoutMode}
                        row={row}
                        col={col}
                        width={width}
                        height={height}
                        hSpace={hSpace}
                        vSpace={vSpace}
                        fillArea={fillArea}
                        bgColor={bgColor}
                        initShapeColors={initShapeColors}
                        showPanels={showPanels}
                        svgPath={svgPath}
                    />
                    {showPanels && (
                        <ExerciseIconsPanel
                            config={{
                                features: {
                                    importSVG: false,
                                    exportPalette: true,
                                    exportComposition: true
                                }
                            }}
                            row={row}
                            col={col}
                            onInstructionOpen={() => setIsInfoModalOpen(true)}
                        />
                    )}
                </div>
            </div>
            <Footer
                lesson='Shapeset Creator'
                title={getTitle()}
            />
            <ShapesetInfoModal
                isOpen={isInfoModalOpen}
                closeModal={() => setIsInfoModalOpen(false)}
                layoutMode={layoutMode}
                row={row}
                col={col}
                width={width}
                height={height}
                hSpace={hSpace}
                vSpace={vSpace}
                fillArea={fillArea}
            />
        </div>
    )
}

function Page() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#2A2A2A]">
                <div className="text-[#AEAEAE]">Loading Gallery...</div>
            </div>
        }>
            <ShapesetCreatorContent />
        </Suspense>
    )
}

export default Page
