import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useRef, useState, useEffect } from 'react'
import html2canvas from 'html2canvas'
import GalleryAddButton from '@/components/GalleryAddButton'
import SaveSuccessModal from '@/components/Modals/SaveSuccessModal'

function CompositionModal({
    isOpen,
    closeModal,
    shapeColors = [],
    backgroundColor = 'rgb(255,255,255)',
    row = 5,
    col = 5,
    layoutMode = 'grid',
    width = 150,
    height = 150,
    hSpace = 0,
    vSpace = 0,
    svgPath,
    svgContent
}) {
    const compositionRef = useRef(null)

    // Log received props
    console.log('📥 CompositionModal received props:', {
        layoutMode,
        svgPath,
        svgContent: svgContent ? `${svgContent.length} chars` : 'null',
        row,
        col
    });
    
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
    const [filename, setFilename] = useState(() => {
        // Try to restore the last used filename with sequential number if needed
        if (typeof window !== 'undefined') {
            const storedBase = sessionStorage.getItem('compositionBaseFilename');
            const storedCount = sessionStorage.getItem('compositionSaveCount');
            const base = storedBase || initialFilename;
            const count = storedCount ? parseInt(storedCount, 10) : 0;
            // If count > 0, append the sequential number
            return count > 0 ? `${base}-${count}` : base;
        }
        return initialFilename;
    });
    const [baseFilename, setBaseFilename] = useState(() => {
        // Try to restore the last used base filename
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('compositionBaseFilename');
            return stored || initialFilename;
        }
        return initialFilename;
    }); // Track the original base name
    const [saveCount, setSaveCount] = useState(() => {
        // Initialize saveCount from sessionStorage so it persists across modal opens/closes
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('compositionSaveCount');
            return stored ? parseInt(stored, 10) : 0;
        }
        return 0;
    });
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    // Update filename when modal opens to show the next sequential number
    useEffect(() => {
        if (isOpen) {
            console.log('Modal opened. saveCount:', saveCount, 'baseFilename:', baseFilename);

            // Reset success modal state when export dialog opens
            setIsSuccessModalOpen(false);

            // saveCount represents the number of times we've saved THIS filename
            // First open: saveCount=0, show "blah", will save as "blah", then increment to 1
            // Second open: saveCount=1, show "blah-1", will save as "blah-1", then increment to 2
            // Third open: saveCount=2, show "blah-2", will save as "blah-2", then increment to 3

            if (saveCount === 0) {
                console.log('Setting filename to:', baseFilename, '(first save)');
                setFilename(baseFilename);
            } else {
                const displayFilename = `${baseFilename}-${saveCount}`;
                console.log('Setting filename to:', displayFilename);
                setFilename(displayFilename);
            }
        }
    }, [isOpen, saveCount, baseFilename]);

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
                    scale: 1, // Use 1:1 scale for 1080x720 output
                    width: 1080,
                    height: 720,
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
            let svgContent = '';

            if (layoutMode === 'grid') {
                // Grid layout export - 1080x720 with centered content
                const svgWidth = 1080;
                const svgHeight = 720;
                const cellWidth = width || 100;
                const cellHeight = height || 100;
                const horizontalGap = hSpace || 0;
                const verticalGap = vSpace || 0;

                // Calculate total grid dimensions including gaps
                const totalWidth = (col * cellWidth) + ((col - 1) * horizontalGap);
                const totalHeight = (row * cellHeight) + ((row - 1) * verticalGap);

                // Center the grid in the canvas
                const startX = (svgWidth - totalWidth) / 2;
                const startY = (svgHeight - totalHeight) / 2;

                svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <!-- Grid composition exported from Colormxr -->
            <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}" />`;

                for (let r = 0; r < row; r++) {
                    for (let c = 0; c < col; c++) {
                        const index = (r * col) + c;
                        const color = index < shapeColors.length ? formatColor(shapeColors[index]) : '#CCCCCC';
                        const x = startX + (c * (cellWidth + horizontalGap));
                        const y = startY + (r * (cellHeight + verticalGap));
                        svgContent += `
            <rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="${color}" />`;
                    }
                }
                svgContent += `
</svg>`;

            } else if (layoutMode === 'cosmic') {
                // Cosmic layout export (Full HD 1920x1080)
                const svgWidth = 1920;
                const svgHeight = 1080;
                const centerX = svgWidth / 2;
                const centerY = svgHeight / 2;

                svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <!-- Cosmic composition exported from Colormxr -->
            <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}" />`;

                // Render from largest to smallest (reverse order for proper layering)
                for (let i = col - 1; i >= 0; i--) {
                    const currentWidth = (width || 100) + i * (hSpace || 40);
                    const currentHeight = (height || 100) + i * (vSpace || 40);
                    const color = i < shapeColors.length ? formatColor(shapeColors[i]) : '#CCCCCC';
                    const x = centerX - currentWidth / 2;
                    const y = centerY - currentHeight / 2;

                    svgContent += `
            <rect x="${x}" y="${y}" width="${currentWidth}" height="${currentHeight}" fill="${color}" />`;
                }
                svgContent += `
</svg>`;

            } else if (layoutMode === 'radiant') {
                // Radiant layout export using width parameter (Full HD 1920x1080)
                const svgWidth = 1920;
                const svgHeight = 1080;
                const centerX = svgWidth / 2;
                const centerY = svgHeight / 2;
                const angleStep = 360 / col;
                const triangleWidth = width || 150;

                svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
            <!-- Radiant composition exported from Colormxr -->
            <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}" />
            <g>`;

                for (let i = 0; i < col; i++) {
                    const angle = i * angleStep;
                    const color = i < shapeColors.length ? formatColor(shapeColors[i]) : '#CCCCCC';

                    // Calculate triangle points using width parameter
                    const angleRad = (angle * Math.PI) / 180;
                    const halfWidth = triangleWidth / 2;
                    const radius = Math.max(svgWidth, svgHeight);

                    // Base points perpendicular to the angle direction at distance radius
                    const x1 = centerX + radius * Math.cos(angleRad) - halfWidth * Math.sin(angleRad);
                    const y1 = centerY + radius * Math.sin(angleRad) + halfWidth * Math.cos(angleRad);
                    const x2 = centerX + radius * Math.cos(angleRad) + halfWidth * Math.sin(angleRad);
                    const y2 = centerY + radius * Math.sin(angleRad) - halfWidth * Math.cos(angleRad);

                    svgContent += `
                <polygon points="${centerX},${centerY} ${x1},${y1} ${x2},${y2}" fill="${color}" />`;
                }

                svgContent += `
            </g>
</svg>`;
            }

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
                                <DialogPanel
                                    className="w-full text-bodytext bg-background relative overflow-hidden rounded-xl modal-dialog"
                                    style={{
                                        position: 'relative',
                                        borderRadius: '0.75rem',
                                        width: '600px',
                                        height: '341px', /* 20% smaller than 426px */
                                        padding: '20px 30px',
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

                                    {/* Modal Content */}
                                    <div className="relative z-20 rounded-xl h-full flex flex-col">
                                        <h2 className="mb-8" style={{ fontFamily: "'Open Sans', sans-serif", fontSize: '18px', fontWeight: 'normal', color: '#5670F8' }}>Export color composition</h2>

                                        <div className="flex flex-col justify-between flex-1">
                                            {/* Hidden div for screenshot functionality */}
                                            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'visible' }}>
                                                <div
                                                    ref={compositionRef}
                                                    className="relative"
                                                    style={{
                                                        backgroundColor: backgroundColor,
                                                        width: '1080px',
                                                        height: '720px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    {layoutMode === 'grid' && (
                                                        <div style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: `repeat(${col}, 35px)`,
                                                            gridTemplateRows: `repeat(${row}, 35px)`,
                                                            gap: `${vSpace || 0}px ${hSpace || 0}px`
                                                        }}>
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
                                                    )}

                                                    {layoutMode === 'cosmic' && (
                                                        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                                            {Array.from({ length: col }, (_, i) => {
                                                                const index = col - 1 - i; // Reverse order for proper layering
                                                                const currentWidth = (width || 100) + index * (hSpace || 40);
                                                                const currentHeight = (height || 100) + index * (vSpace || 40);
                                                                const shapeColor = index < shapeColors.length ? shapeColors[index] : '#CCCCCC';

                                                                return (
                                                                    <div
                                                                        key={index}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            left: '50%',
                                                                            top: '50%',
                                                                            width: `${currentWidth}px`,
                                                                            height: `${currentHeight}px`,
                                                                            transform: 'translate(-50%, -50%)',
                                                                            backgroundColor: shapeColor,
                                                                            zIndex: col - index
                                                                        }}
                                                                    />
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {layoutMode === 'radiant' && (
                                                        <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                                                            {Array.from({ length: col }, (_, i) => {
                                                                const angleStep = 360 / col;
                                                                const rotationAngle = i * angleStep;
                                                                const triangleWidth = width || 150;
                                                                const triangleHeight = 1000;
                                                                const shapeColor = i < shapeColors.length ? shapeColors[i] : '#CCCCCC';

                                                                return (
                                                                    <div
                                                                        key={i}
                                                                        style={{
                                                                            position: 'absolute',
                                                                            left: '50%',
                                                                            top: '50%',
                                                                            width: `${triangleWidth * 2}px`,
                                                                            height: `${triangleHeight}px`,
                                                                            transformOrigin: `${triangleWidth}px 0px`,
                                                                            transform: `translate(-${triangleWidth}px, 0px) rotate(${rotationAngle}deg)`,
                                                                            clipPath: `polygon(50% 0%, 0% 100%, 100% 100%)`
                                                                        }}
                                                                    >
                                                                        <div style={{
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            backgroundColor: shapeColor
                                                                        }} />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}

                                                    {layoutMode === 'svg' && svgContent && (
                                                        <div
                                                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                            dangerouslySetInnerHTML={{
                                                                __html: (() => {
                                                                    // Parse and modify SVG to apply colors and remove strokes
                                                                    const parser = new DOMParser();
                                                                    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                                                                    const svgElement = svgDoc.documentElement;

                                                                    // Find all colorable elements
                                                                    const colorableElements = svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, polyline');

                                                                    // Apply colors and remove strokes
                                                                    colorableElements.forEach((element, index) => {
                                                                        if (index < shapeColors.length && shapeColors[index]) {
                                                                            element.setAttribute('fill', shapeColors[index]);
                                                                        }
                                                                        element.setAttribute('stroke', 'none');
                                                                    });

                                                                    // Set size to fit preview
                                                                    svgElement.setAttribute('width', '300');
                                                                    svgElement.setAttribute('height', '300');
                                                                    svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

                                                                    const serializer = new XMLSerializer();
                                                                    return serializer.serializeToString(svgElement);
                                                                })()
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Filename input - centered vertically */}
                                            <div className="flex flex-col justify-center flex-1">
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={filename}
                                                        onChange={(e) => {
                                                            setFilename(e.target.value);
                                                            setBaseFilename(e.target.value);
                                                            setSaveCount(0); // Reset count when user changes the name
                                                            sessionStorage.setItem('compositionSaveCount', '0');
                                                            sessionStorage.setItem('compositionBaseFilename', e.target.value);
                                                        }}
                                                        className="text-xl font-normal text-white mb-1 bg-transparent border-none outline-none w-full"
                                                        style={{ fontFamily: "'Open Sans', sans-serif" }}
                                                    />
                                                    <div className="text-sm font-normal text-bodytext">Filename</div>
                                                </div>
                                            </div>

                                            {/* Action Buttons - all in one row */}
                                            <div className="w-full">
                                                <div className="flex gap-4 items-center w-full">
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

                                                    <button
                                                        className="text-white py-2 px-6 rounded whitespace-nowrap"
                                                        style={{ backgroundColor: '#5670F8', minWidth: '140px' }}
                                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#4560E7'}
                                                        onMouseLeave={(e) => e.target.style.backgroundColor = '#5670F8'}
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
                                            layoutMode={layoutMode}
                                            width={width}
                                            height={height}
                                            hSpace={hSpace}
                                            vSpace={vSpace}
                                            svgPath={svgPath}
                                            svgContent={svgContent}
                                            customFilename={saveCount === 0 ? baseFilename : `${baseFilename}-${saveCount}`}
                                            title="Save to Gallery"
                                            onSuccess={() => {
                                                console.log('Save success! Current saveCount:', saveCount);
                                                const newCount = saveCount + 1;
                                                console.log('Incrementing saveCount to:', newCount);
                                                setSaveCount(newCount);
                                                sessionStorage.setItem('compositionSaveCount', newCount.toString());
                                                closeModal();
                                                setIsSuccessModalOpen(true);
                                            }}
                                        />
                                    </div>
                                    
                                </DialogPanel>
                            </TransitionChild>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Success Toast Notification - outside the main dialog so it can show when dialog closes */}
            <SaveSuccessModal
                isOpen={isSuccessModalOpen}
                closeModal={() => setIsSuccessModalOpen(false)}
                filename={filename}
            />
        </>
    )
}

export default CompositionModal
