import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useState, useRef, useEffect } from 'react'

function ShapesetModal({ isOpen, closeModal, shapeColors = [], backgroundColor = 'rgb(255,255,255)', row = 5, col = 5, width = 150, height = 150 }) {
    // Reference to SVG container
    const svgPreviewRef = useRef(null);
    
    // State for showing confirmation message
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [exportedFileName, setExportedFileName] = useState('');
    
    // Reset confirmation state when modal opens
    useEffect(() => {
        if (isOpen) {
            setShowConfirmation(false);
        }
    }, [isOpen]);
    
    // Print values for debugging
    console.log("ShapesetModal rendered with:");
    console.log("- backgroundColor:", backgroundColor);
    console.log("- shapeColors:", shapeColors.length, "items");
    console.log("- dimensions:", row, "x", col);
    
    // Helper function to format color consistently (handles both RGB and HEX)
    const formatColor = (color) => {
        if (!color) return 'rgb(200,200,200)';
        
        try {
            // If it's already RGB format, return it as is
            if (typeof color === 'string' && color.startsWith('rgb')) return color;
            
            // If it's a HEX color, ensure it's properly formatted
            if (typeof color === 'string' && color.startsWith('#')) {
                return color;
            }
            
            // Default fallback
            return 'rgb(200,200,200)';
        } catch (error) {
            console.error("Error formatting color:", error);
            return 'rgb(200,200,200)';
        }
    };
    // Create timestamp for initial filename
    const now = new Date()
    const dateString = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    }).replace(/\//g, '-')
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const timeString = `${hours}${minutes}${seconds}`;
    const initialFilename = `Colormxr-shapeset-${dateString}-${timeString}`;
    
    // State for the filename input
    const [filename, setFilename] = useState(initialFilename);
    
    // Create an SVG representation of the shapeset - used by both preview and export
    const createShapesetSVG = () => {
        // Original grid dimensions
        const originalGridWidth = col * width;
        const originalGridHeight = row * height;
        
        // Set fixed landscape SVG dimensions with 16:9 ratio (regardless of grid size)
        // Making it large enough to comfortably fit the grid
        const viewBoxWidth = 1600; // Fixed width for consistent landscape orientation
        const viewBoxHeight = 900; // Fixed height with 16:9 ratio
        
        // Scale grid to 79.2% of original size (66% increased by 20%)
        const scaleFactor = 0.66 * 1.2; // 0.792 (66% plus 20% increase)
        const scaledGridWidth = originalGridWidth * scaleFactor;
        const scaledGridHeight = originalGridHeight * scaleFactor;
        
        // Scaled cell dimensions for individual shapes
        const cellWidth = width * scaleFactor;
        const cellHeight = height * scaleFactor;
        
        // Get background color with fallback
        const bgColor = formatColor(backgroundColor) || 'rgb(255,255,255)';
        console.log("Using background color for SVG:", bgColor);
        
        // Create SVG with proper dimensions - preserveAspectRatio ensures it displays correctly
        let svgContent = `<svg width="100%" height="100%" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;
        
        // Add the background rectangle for the entire viewBox (wide 16:9 landscape view)
        svgContent += `<rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="${bgColor}" />`;
        
        // Position the grid in the center of the viewBox
        // This centers the grid in the wider landscape view (with more space on sides)
        const gridOffsetX = Math.floor((viewBoxWidth - scaledGridWidth) / 2);
        const gridOffsetY = Math.floor((viewBoxHeight - scaledGridHeight) / 2);
        
        // Create a group for all shapes to ensure they stay together
        svgContent += `<g>`;
        
        // Add all shape rectangles with absolutely NO gaps between them
        for (let i = 0; i < row; i++) {
            for (let j = 0; j < col; j++) {
                // Calculate the position with integer values to prevent anti-aliasing gaps
                const x = gridOffsetX + Math.floor(j * cellWidth);
                const y = gridOffsetY + Math.floor(i * cellHeight);
                const shapeNum = i * col + j;
                
                // Get shape color with fallback
                let shapeColor = 'rgb(200,200,200)';
                if (shapeNum < shapeColors.length) {
                    shapeColor = formatColor(shapeColors[shapeNum]);
                }
                
                // Add the shape rectangle - using slight overlap (width+1, height+1) to prevent hairline gaps
                svgContent += `<rect x="${x}" y="${y}" width="${cellWidth + 1}" height="${cellHeight + 1}" fill="${shapeColor}" stroke="none" vector-effect="non-scaling-stroke" shape-rendering="crispEdges" />`;
            }
        }
        
        // Close the shape group
        svgContent += `</g>`;
        
        // Close SVG tag
        svgContent += `</svg>`;
        
        return svgContent;
    };
    

    
    // Handle SVG export
    const handleExportAsSVG = () => {
        try {
            console.log("Exporting SVG...");
            
            // Generate SVG content with XML declaration
            const svgContent = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n' +
                '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
                createShapesetSVG();
            
            // Convert to blob and create download URL
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Create and trigger download
            const downloadLink = document.createElement('a');
            downloadLink.href = svgUrl;
            downloadLink.download = `${filename}.svg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            // Clean up
            URL.revokeObjectURL(svgUrl);
            
            // Show success feedback with confirmation message
            console.log("SVG export complete");
            
            // Show confirmation message instead of closing immediately
            setExportedFileName(`${filename}.svg`);
            setShowConfirmation(true);
        } catch (error) {
            console.error("Error exporting SVG:", error);
            alert("There was an error exporting your SVG. Please try again.");
        }
    };
    
    // Handle PNG export
    const handleExportAsPNG = () => {
        try {
            console.log("Exporting PNG...");
            
            // Create a temporary SVG element with the content
            const svgContent = createShapesetSVG();
            const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
            const svgUrl = URL.createObjectURL(svgBlob);
            
            // Create an Image object to load the SVG
            const img = new Image();
            
            // Set up image onload handler
            img.onload = () => {
                // Create a canvas element to draw the image
                const canvas = document.createElement('canvas');
                // Set dimensions to match the 16:9 aspect ratio
                canvas.width = 1600;
                canvas.height = 900;
                
                // Get the canvas context and draw the image
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert canvas to PNG blob
                canvas.toBlob((pngBlob) => {
                    // Create download link for the PNG
                    const pngUrl = URL.createObjectURL(pngBlob);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = pngUrl;
                    downloadLink.download = `${filename}.png`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    
                    // Clean up
                    URL.revokeObjectURL(pngUrl);
                    URL.revokeObjectURL(svgUrl);
                    
                    // Show success feedback with confirmation message
                    console.log("PNG export complete");
                    
                    // Show confirmation message instead of closing immediately
                    setExportedFileName(`${filename}.png`);
                    setShowConfirmation(true);
                }, 'image/png');
            };
            
            // Handle errors
            img.onerror = (error) => {
                console.error("Error creating PNG:", error);
                alert("There was an error exporting your PNG. Please try again.");
                URL.revokeObjectURL(svgUrl);
            };
            
            // Start loading the SVG image
            img.src = svgUrl;
            
        } catch (error) {
            console.error("Error exporting PNG:", error);
            alert("There was an error exporting your PNG. Please try again.");
        }
    };
    


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
                                <DialogPanel className="w-full max-w-3xl px-7 py-5 backdrop-blur-2xl text-bodytext bg-background relative overflow-hidden rounded-xl modal-dialog"
                                    style={{ 
                                        position: 'relative',
                                        borderRadius: '0.75rem'
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
                                    
                                    {/* ShapeSet Modal Content */}
                                    <div className="relative z-20 rounded-xl">
                                        <div className="flex flex-col gap-6">
                                            <h2 className="mb-8" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '18px', fontWeight: 'normal', color: 'inherit' }}>Export shapeset</h2>
                                            
                                            {/* Preview - a portrait representation of the shapeset with no gaps */}
                                            <div className="flex justify-center mb-4">
                                                {/* Current background color (debug) */}
                                                <div style={{ display: 'none' }}>
                                                    <div>Background color: {backgroundColor}</div>
                                                </div>
                                                
                                                {/* SVG Preview Container - No border, wider with 16:9 ratio */}
                                                <div className="relative" style={{ 
                                                    width: '100%', 
                                                    maxWidth: '850px', /* Adjusted for 16:9 aspect ratio */
                                                    margin: '0 auto'
                                                }}>
                                                    <div 
                                                        className="w-full"
                                                        ref={svgPreviewRef}
                                                        style={{ 
                                                            overflow: 'hidden',
                                                            // Set a 16:9 aspect ratio for true landscape orientation
                                                            aspectRatio: '16/9'
                                                        }}
                                                        dangerouslySetInnerHTML={{ __html: createShapesetSVG() }}
                                                    />
                                                    
                                                    {/* Remove dimension labels and background indicator */}
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
                                    
                                    {/* Confirmation Message (conditionally shown) */}
                                    {showConfirmation && (
                                        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-xl">
                                            <div className="px-7 py-5 backdrop-blur-2xl text-bodytext bg-background relative overflow-hidden rounded-xl modal-dialog max-w-md">
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
                                                <div className="relative z-20 text-center">
                                                    <div className="mb-4 flex justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg text-gray-200 mb-2">Save Successful</h3>
                                                    <p className="text-gray-300 mb-4">
                                                        Your file <span className="font-medium">{exportedFileName}</span> has been saved successfully.
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            setShowConfirmation(false);
                                                            closeModal();
                                                        }}
                                                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                                                    >
                                                        Done
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons - at bottom aligned with text */}
                                    <div className="flex justify-between items-center mt-6">
                                        <div className="flex gap-6">
                                            <button
                                                onClick={handleExportAsPNG}
                                                className="text-white py-2 px-4 rounded"
                                                style={{ backgroundColor: '#616161' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#616161'}
                                                disabled={showConfirmation}
                                            >
                                                Download PNG
                                            </button>
                                            
                                            <button
                                                onClick={handleExportAsSVG}
                                                className="text-white py-2 px-4 rounded"
                                                style={{ backgroundColor: '#616161' }}
                                                onMouseEnter={(e) => e.target.style.backgroundColor = '#505050'}
                                                onMouseLeave={(e) => e.target.style.backgroundColor = '#616161'}
                                                disabled={showConfirmation}
                                            >
                                                Download SVG
                                            </button>
                                        </div>
                                        
                                        <button
                                            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                                            style={{ fontSize: '16px', fontWeight: 'normal' }}
                                            disabled={showConfirmation}
                                        >
                                            Save to Gallery
                                        </button>
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

export default ShapesetModal
