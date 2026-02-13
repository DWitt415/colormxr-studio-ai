import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import GalleryAddButton from '@/components/GalleryAddButton'
import SaveSuccessModal from '@/components/Modals/SaveSuccessModal'

function CompositionModal({ isOpen, closeModal, shapeColors = [], backgroundColor = 'rgb(255,255,255)', row = 5, col = 5 }) {
    const compositionRef = useRef(null)
    
    // Create timestamp for initial filename
    const now = new Date()
    const dateString = now.toLocaleDateString('en-US', { 
        year: '2-digit', 
        month: '2-digit', 
        day: '2-digit' 
    }).replace(/\//g, '')
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}${minutes}${seconds}`;
    const initialFilename = `Colormxr-comp-${dateString}-${timeString}`;
    
    // State for the filename input and success modal
    const [filename, setFilename] = useState(initialFilename);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Helper function to format color consistently (handles both RGB and HEX)
    const formatColor = (color) => {
        if (!color) return 'rgb(200,200,200)';
        
        try {
            // If it's already an RGB color
            if (typeof color === 'string' && color.startsWith('rgb')) {
                const rgbValues = color.match(/\d+/g);
                if (rgbValues && rgbValues.length === 3) {
                    const [r, g, b] = rgbValues.map(Number);
                    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                }
            }
            
            // If it's already a HEX color, ensure it's properly formatted
            if (typeof color === 'string' && color.startsWith('#')) {
                return color.toUpperCase();
            }
            
            // Default fallback
            return '#CCCCCC';
        } catch (error) {
            console.error("Error formatting color:", error);
            return '#CCCCCC';
        }
    };
    
    const handleExportAsPNG = async () => {
        if (compositionRef.current) {
            try {
                // Configure html2canvas with better quality settings
                const canvas = await html2canvas(compositionRef.current, {
                    backgroundColor: null,
                    scale: 3, // Higher quality for better detail
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                })
                const image = canvas.toDataURL("image/png")
                
                // Use the custom filename from state
                const downloadLink = document.createElement('a')
                downloadLink.href = image
                downloadLink.download = `${filename}.png`
                document.body.appendChild(downloadLink)
                downloadLink.click()
                document.body.removeChild(downloadLink)
            } catch (error) {
                console.error("Error exporting composition:", error)
            }
        }
    }
    
    // Generate SVG for the composition
    const handleExportAsSVG = () => {
        try {
            // Calculate dimensions based on grid
            const cellSize = 100;
            const padding = 25; // padding around the whole grid
            
            // Calculate SVG dimensions based on the grid
            const svgWidth = (col * cellSize) + (2 * padding);
            const svgHeight = (row * cellSize) + (2 * padding);
            
            // Start SVG document
            let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <!-- Composition exported from Colormxr -->
            
            <!-- Background -->
            <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}" />
            
            <!-- Color grid -->`;
            
            // Add each color cell
            for (let r = 0; r < row; r++) {
                for (let c = 0; c < col; c++) {
                    const index = (r * col) + c;
                    const color = index < shapeColors.length ? formatColor(shapeColors[index]) : '#CCCCCC';
                    const x = padding + (c * cellSize);
                    const y = padding + (r * cellSize);
                    
                    svgContent += `
            <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}" />`;
                }
            }
            
            // Close SVG document
            svgContent += `
</svg>`;
            
            // Create blob and download
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = `${filename}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Error exporting composition as SVG:", error);
        }
    }

    return (
        <>
            <Transition appear show={isOpen}>
                <Dialog as="div" className="relative z-30 focus:outline-none" onClose={closeModal}>
                    <div className="fixed inset-0 z-30 w-screen bg-black/80 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 transform-[scale(95%)]"
                                enterTo="opacity-100 transform-[scale(100%)]"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 transform-[scale(100%)]"
                                leaveTo="opacity-0 transform-[scale(95%)]"
                            >
                                <DialogPanel 
                                    className="w-full backdrop-blur-2xl text-bodytext bg-background relative overflow-hidden rounded-xl modal-dialog"
                                    style={{ 
                                        position: 'relative',
                                        borderRadius: '0.75rem',
                                        width: '600px',
                                        height: '341px', /* 20% smaller than 426px */
                                        padding: '20px 30px'
                                    }}
                                >
                                    {/* Gradient border with proper rounded corners */}
                                    <div 
                                        style={{
                                            position: 'absolute',
                                            inset: '0',
                                            borderRadius: '0.75rem',
                                            padding: '3px',
                                            background: 'linear-gradient(to bottom, #C8C8C8, #626262)',
                                            WebkitMask: 
                                                'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                            WebkitMaskComposite: 'xor',
                                            maskComposite: 'exclude',
                                            pointerEvents: 'none',
                                            zIndex: '10'
                                        }}
                                    ></div>

                                    {/* Modal Content */}
                                    <div className="relative z-20 rounded-xl h-full flex flex-col">
                                        <h2 className="mb-8" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '18px', fontWeight: 'normal', color: 'inherit' }}>Export shapeset</h2>
                                        
                                        <div className="flex flex-col justify-between flex-1">
                                            {/* Hidden div for screenshot functionality */}
                                            <div style={{ display: 'none' }}>
                                                <div 
                                                    ref={compositionRef}
                                                    className="relative"
                                                    style={{ 
                                                        backgroundColor: backgroundColor,
                                                        padding: '20px',
                                                        borderRadius: '4px',
                                                        display: 'grid',
                                                        gridTemplateColumns: `repeat(${col}, 35px)`,
                                                        gridTemplateRows: `repeat(${row}, 35px)`,
                                                        gap: '0'
                                                    }}
                                                >
                                                    {Array.from({ length: row * col }, (_, index) => (
                                                        <div 
                                                            key={index}
                                                            style={{
                                                                backgroundColor: index < shapeColors.length ? shapeColors[index] : '#CCCCCC',
                                                                width: '35px',
                                                                height: '35px'
                                                            }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Filename input field - centered vertically */}
                                            <div className="flex flex-col justify-center flex-1">
                                                <div>
                                                    <label htmlFor="filename" className="block text-sm font-normal text-bodytext mb-1">Filename:</label>
                                                    <input
                                                        type="text"
                                                        id="filename"
                                                        className="w-full font-normal bg-transparent border-none focus:outline-none"
                                                        style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '14px' }}
                                                        value={filename}
                                                        onChange={(e) => setFilename(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons - bottom aligned, left justified */}
                                            <div className="w-full">
                                                <div className="flex justify-between items-center w-full">
                                                    <div className="flex gap-6">
                                                        <button
                                                            onClick={handleExportAsPNG}
                                                            className="text-white py-2 px-6 rounded whitespace-nowrap"
                                                            style={{ backgroundColor: '#616161', minWidth: '140px' }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#616161'}
                                                        >
                                                            Download PNG
                                                        </button>
                                                        
                                                        <button
                                                            onClick={handleExportAsSVG}
                                                            className="text-white py-2 px-6 rounded whitespace-nowrap"
                                                            style={{ backgroundColor: '#616161', minWidth: '140px' }}
                                                            onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
                                                            onMouseLeave={(e) => e.target.style.backgroundColor = '#616161'}
                                                        >
                                                            Download SVG
                                                        </button>
                                                    </div>
                                                    
                                                    <button
                                                        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded whitespace-nowrap"
                                                        style={{ fontSize: '16px', fontWeight: 'normal', minWidth: '140px' }}
                                                        onClick={() => {
                                                            // Click the hidden gallery button and it will 
                                                            // trigger the success modal via onSuccess callback
                                                            const galleryButton = document.querySelector('[title="Save to Gallery"]');
                                                            if (galleryButton) galleryButton.click();
                                                        }}
                                                    >
                                                        Save to Gallery
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hidden GalleryAddButton for functionality */}
                                    <div style={{ display: 'none' }}>
                                        <GalleryAddButton 
                                            shapeColors={shapeColors}
                                            backgroundColor={backgroundColor}
                                            row={row}
                                            col={col}
                                            title="Save to Gallery"
                                            onSuccess={() => setIsSuccessModalOpen(true)}
                                        />
                                    </div>
                                    
                                    {/* Success Toast Notification */}
                                    <SaveSuccessModal
                                        isOpen={isSuccessModalOpen}
                                        closeModal={() => setIsSuccessModalOpen(false)}
                                        filename={filename}
                                    />
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default CompositionModal