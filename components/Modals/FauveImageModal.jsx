'use client'
import React, { useRef } from 'react'

function FauveImageModal({ isOpen, closeModal }) {
    const imageRef = useRef(null)
    const canvasRef = useRef(null)

    if (!isOpen) return null

    const handleImageClick = (e) => {
        // Only proceed if Shift is pressed
        if (!e.shiftKey) return

        const img = imageRef.current
        if (!img) return

        // Get click position relative to the image
        const rect = img.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // Create or get canvas
        let canvas = canvasRef.current
        if (!canvas) {
            canvas = document.createElement('canvas')
            canvasRef.current = canvas
        }

        // Set canvas size to match image natural dimensions
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight

        // Draw image to canvas
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)

        // Calculate the position in the original image coordinates
        const scaleX = img.naturalWidth / img.width
        const scaleY = img.naturalHeight / img.height
        const imageX = Math.floor(x * scaleX)
        const imageY = Math.floor(y * scaleY)

        // Get pixel color
        const pixelData = ctx.getImageData(imageX, imageY, 1, 1).data
        const r = pixelData[0]
        const g = pixelData[1]
        const b = pixelData[2]
        const color = `rgb(${r},${g},${b})`

        console.log('🎨 Color picked from image:', color, 'at position:', { x: imageX, y: imageY })

        // Apply color to selected shape via global function
        if (typeof window !== 'undefined' && window.applyColorToSelectedShape) {
            window.applyColorToSelectedShape(color)
        } else {
            console.warn('⚠️ window.applyColorToSelectedShape not available')
        }
    }

    return (
        <div className="fixed left-4 top-4 z-[100] pointer-events-auto">
            <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/80 hover:bg-white transition-colors z-10"
                    aria-label="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Image with color picker */}
                <img
                    ref={imageRef}
                    src="/ext_images/Fauve.png"
                    alt="Fauve reference"
                    className="max-w-[400px] max-h-[500px] object-contain cursor-crosshair"
                    onClick={handleImageClick}
                    crossOrigin="anonymous"
                />
            </div>
        </div>
    )
}

export default FauveImageModal
