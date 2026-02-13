import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import PaletteGalleryAddButton from '@/components/PaletteGalleryAddButton'

function PaletteModal({ isOpen, closeModal, colors = [], backgroundColor = 'rgb(255,255,255)', colorPalette = [] }) {
    const paletteRef = useRef(null)
    
    // Create timestamp for initial filename
    const now = new Date()
    const dateString = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).replace(/\//g, '')
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}${minutes}${seconds}`;
    const initialFilename = `Colormxr-palette-${dateString}-${timeString}`;
    
    // State for the filename input
    const [filename, setFilename] = useState(initialFilename);

    // Only use colorPalette, NEVER fall back to colors
    // If colorPalette is empty, use a default set of grayscale colors
    const defaultPalette = ["#D9D9D9", "#A7A7A7", "#949494", "#5B5B5B", "#3B3B3B"];

    // Force use colorPalette
    const paletteToUse = colorPalette.length > 0 ? colorPalette : defaultPalette;

    // Convert hex values to RGB format
    const colorsToUse = paletteToUse.map(hexColor => {
        // Convert hex to RGB for consistency
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        return `rgb(${r},${g},${b})`;
    });
    
    let displayPalette = [...colorsToUse];
    
    // Convert RGB values to HEX for consistent display
    displayPalette = displayPalette.map(color => {
        // Check if it's an RGB color
        if (color && color.startsWith('rgb')) {
            const rgbValues = color.match(/\d+/g)
            if (rgbValues && rgbValues.length === 3) {
                const [r, g, b] = rgbValues.map(Number)
                return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`
            }
        }
        return color
    })
    
    const handleExportAsPNG = async () => {
        if (paletteRef.current) {
            try {
                // Configure html2canvas with better quality settings
                const canvas = await html2canvas(paletteRef.current, {
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
                console.error("Error exporting palette:", error)
            }
        }
    }
    
    // New function to export as SVG
    const handleExportAsSVG = () => {
        try {
            // Create SVG content
            const svgWidth = 550; // 5*100 + 4*10 + 50 (5 squares + 4 gaps + padding)
            const svgHeight = 150; // 100 + 50 (1 square height + padding)
            
            // Start SVG document
            let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <!-- Palette exported from Colormxr -->
            
            <!-- Background -->
            <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}" />
            
            <!-- Color squares -->`;
            
            // Add each color square
            displayPalette.forEach((color, index) => {
                const x = 25 + (index * 110); // 25px initial padding + previous squares and gaps
                svgContent += `
            <rect x="${x}" y="25" width="100" height="100" fill="${color}" />`;
            });
            
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
            console.error("Error exporting palette as SVG:", error);
        }
    }

    // Always use the provided backgroundColor for consistency

    return (
        <>
            <Transition appear show={isOpen}>
                <Dialog as="div" className="relative z-30 focus:outline-none" onClose={closeModal}>
                    <div className="fixed inset-0 z-30 w-screen overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
                        <div className="flex min-h-full items-center justify-center p-4">
                            <TransitionChild
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 transform-[scale(95%)]"
                                enterTo="opacity-100 transform-[scale(100%)]"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 transform-[scale(100%)]"
                                leaveTo="opacity-0 transform-[scale(95%)]"
                            >
                                <DialogPanel className="w-full max-w-3xl px-7 py-5 text-bodytext bg-background relative overflow-hidden rounded-xl modal-dialog"
                                    style={{
                                        position: 'relative',
                                        borderRadius: '0.75rem',
                                        backdropFilter: 'none',
                                        WebkitBackdropFilter: 'none'
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
                                    {/* Palette Modal Content */}
                                    <div className="relative z-20 rounded-xl">
                                        <div className="flex flex-col gap-6">
                                            <h2 className="mb-8" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '18px', fontWeight: 'normal', color: '#5670F8' }}>Export palette</h2>
                                            
                                            {/* Background shape with color squares - exactly 5 horizontal squares with 10px padding */}
                                            <div className="flex justify-center mb-4">
                                                <div 
                                                    ref={paletteRef}
                                                    className="relative"
                                                    style={{ 
                                                        backgroundColor: backgroundColor,
                                                        width: 'calc(5 * 100px + 4 * 10px + 50px)', /* 5 squares + 4 gaps + 50px extra */
                                                        height: 'calc(100px + 50px)', /* 1 square height + 50px extra */
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <div className="flex gap-[10px]">
                                                        {displayPalette.map((color, index) => (
                                                            <div 
                                                                key={index}
                                                                className="w-[100px] h-[100px] shadow-md"
                                                                style={{
                                                                    backgroundColor: color,
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Hex Values - formatted text box below the squares */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-normal text-bodytext mb-1">Hex colors:</label>
                                                <div className="w-full">
                                                    <p className="text-sm text-left font-normal" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                                                        {(() => {
                                                            // Convert backgroundColor to hex format
                                                            let bgHex = backgroundColor;
                                                            if (backgroundColor && backgroundColor.startsWith('rgb')) {
                                                                const rgbValues = backgroundColor.match(/\d+/g);
                                                                if (rgbValues && rgbValues.length === 3) {
                                                                    const [r, g, b] = rgbValues.map(Number);
                                                                    bgHex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
                                                                }
                                                            }
                                                            // Combine background color first, then palette colors
                                                            return [bgHex, ...displayPalette].map(color => color.toUpperCase()).join(', ');
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {/* Filename input field */}
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
                                    </div>
                                    
                                    {/* Action Buttons - at bottom aligned with text */}
                                    <div className="flex justify-between items-center mt-6">
                                        <div className="flex gap-6">
                                            <button
                                                onClick={handleExportAsPNG}
                                                className="text-white py-2 px-4 rounded"
                                                style={{ backgroundColor: '#616161', ':hover': { backgroundColor: '#505050' } }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#616161'}
                                            >
                                                Download PNG
                                            </button>
                                            
                                            <button
                                                onClick={handleExportAsSVG}
                                                className="text-white py-2 px-4 rounded"
                                                style={{ backgroundColor: '#616161', ':hover': { backgroundColor: '#505050' } }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#616161'}
                                            >
                                                Download SVG
                                            </button>
                                        </div>
                                        
                                        <PaletteGalleryAddButton 
                                            colors={displayPalette}
                                            backgroundColor={backgroundColor}
                                            title="Save Palette to Gallery"
                                        />
                                    </div>
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </>
    )
}

export default PaletteModal