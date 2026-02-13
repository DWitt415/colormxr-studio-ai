// filepath: /Users/dwitt/Sites/colormxr_dev/components/Modals/LightboxModal.jsx
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState } from 'react'

function LightboxModal({ 
  isOpen, 
  closeModal, 
  item, 
  onNext, 
  onPrevious, 
  hasNext, 
  hasPrevious,
  seriesContext = null, // Optional object with series information: { id, name, currentIndex, totalItems }
}) {
  // State to track if the metadata overlay is visible
  const [showMetadata, setShowMetadata] = useState(false);
  
  // Toggle metadata overlay visibility
  const toggleMetadata = () => {
    setShowMetadata(prev => !prev);
  };
  
  // Close metadata when clicking the underlay
  const closeMetadata = (e) => {
    // Only close if clicking directly on the underlay, not on the modal content
    if (e.target === e.currentTarget) {
      setShowMetadata(false);
    }
  };
  
  // Determine if item is a palette or a shapeset
  const isPalette = item && !item.shape_colors && item.palette_colors;
  
  if (!item) return null;
  
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 overflow-hidden">
          <div className="flex min-h-full items-center justify-center text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel 
                className="w-[95vw] h-[95vh] transform overflow-hidden p-0 text-bodytext align-middle shadow-xl transition-all"
                style={isPalette && item.background_color ? { backgroundColor: item.background_color } : { backgroundColor: 'transparent' }}
              >
                {/* Control buttons at the top */}
                <div className="absolute top-4 left-0 right-0 z-50 flex px-4">
                  {/* Left side controls */}
                  <div className="flex items-center gap-2 w-1/3">
                    {/* Info button (top-left corner) */}
                    <button
                      onClick={toggleMetadata}
                      className="p-2 transition-colors lightbox-control"
                      aria-label={showMetadata ? "Hide metadata" : "Show metadata"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#3D3D3D" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    
                    {/* Series name displayed next to info icon */}
                    {seriesContext && (
                      <span className="font-medium px-2 py-1" style={{ color: "#333333" }}>
                        {seriesContext.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Center navigation controls */}
                  <div className="flex items-center justify-center gap-6 w-1/3">
                    {/* Previous button - always enabled with rollover functionality */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Just use onPrevious directly in all cases - the parent component 
                        // already implements proper circular navigation
                        onPrevious();
                      }}
                      className="p-2 lightbox-control transition-colors"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#3D3D3D" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Series position indicator - no background, #333333 text */}
                    {seriesContext && (
                      <div className="py-2 px-3 text-sm" style={{ color: "#333333" }}>
                        {seriesContext.currentIndex} / {seriesContext.totalItems}
                      </div>
                    )}
                    
                    {/* Next button - always enabled with rollover functionality */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        // Just use onNext directly in all cases - the parent component 
                        // already implements proper circular navigation
                        onNext();
                      }}
                      className="p-2 lightbox-control transition-colors"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#3D3D3D" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Right side controls */}
                  <div className="w-1/3 flex justify-end">
                    {/* Close button (top-right corner) */}
                    <button
                      onClick={closeModal}
                      className="p-2 transition-colors lightbox-control"
                      aria-label="Close lightbox"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#3D3D3D" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Content Container - Full screen */}
                <div className="flex flex-col items-center h-full relative">
                  
                  <div className={`w-full h-full ${isPalette ? '' : 'border border-gray-700 rounded-lg overflow-hidden bg-white shadow-2xl'}`}>
                    {isPalette ? (
                      // For palette items, display the SVG or image depending on filename
                      (() => {
                        console.log("Rendering palette item:", item);
                        console.log("Item URL:", item.url);
                        console.log("Item filename:", item.filename);
                        console.log("Is SVG:", item.filename && item.filename.toLowerCase().endsWith('.svg'));
                        
                        // Generate fallback SVG content directly from palette colors
                        const generateFallbackSVG = () => {
                          if (!item.palette_colors || !Array.isArray(item.palette_colors)) {
                            return null;
                          }
                          
                          const svgWidth = 550;
                          const svgHeight = 150;
                          const squareSize = 100;
                          const padding = 25;
                          const gap = 10;
                          
                          let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
                            <rect width="${svgWidth}" height="${svgHeight}" fill="${item.background_color || '#FFFFFF'}" />`;
                          
                          // Make sure we have exactly 5 colors for display
                          let displayColors = [...item.palette_colors];
                          
                          // If we have fewer than 5 colors, add default colors
                          if (displayColors.length < 5) {
                            const defaultColors = ["#D9D9D9", "#A7A7A7", "#949494", "#5B5B5B", "#3B3B3B"];
                            for (let i = displayColors.length; i < 5; i++) {
                              displayColors.push(defaultColors[i]);
                            }
                          }
                          
                          // If we have more than 5 colors, trim the array
                          if (displayColors.length > 5) {
                            displayColors = displayColors.slice(0, 5);
                          }
                          
                          // Add each color square
                          for (let i = 0; i < 5; i++) {
                            const x = padding + (i * (squareSize + gap));
                            const y = padding;
                            svgContent += `<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${displayColors[i]}" />`;
                          }
                          
                          svgContent += '</svg>';
                          return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
                        };
                        
                        // Use SVG rendering with better error handling
                        if (item.filename && item.filename.toLowerCase().endsWith('.svg')) {
                          // For SVG files, try loading them with proper fallback
                          return (
                            <object
                              type="image/svg+xml"
                              data={item.url}
                              className="w-full h-full"
                              style={{ minHeight: '100%', objectFit: 'contain' }}
                              onLoad={() => console.log("SVG loaded successfully!")}
                              onError={(e) => {
                                console.error("SVG loading error:", e);
                                // Try to fetch the SVG directly to see what's wrong
                                fetch(item.url)
                                  .then(response => {
                                    console.log(`SVG fetch status: ${response.status} ${response.statusText}`);
                                    if (!response.ok) {
                                      throw new Error(`HTTP error! status: ${response.status}`);
                                    }
                                    return response.text();
                                  })
                                  .then(text => console.log("SVG content sample:", text.substring(0, 100) + "..."))
                                  .catch(err => console.error("SVG fetch failed:", err));
                              }}
                            >
                              {/* Fallback content if object fails to load */}
                              <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-4">
                                <div className="mb-4">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <p className="text-gray-600 text-center">SVG failed to load.</p>
                                <p className="text-gray-500 text-sm mt-1">Generating palette from colors...</p>
                                {/* Use a fallback image generated from palette colors */}
                                <img
                                  src={generateFallbackSVG()}
                                  className="w-full mt-4"
                                  style={{ maxHeight: '150px', objectFit: 'contain' }}
                                  alt="Color palette (fallback)"
                                  onError={(e) => console.error("Fallback SVG error:", e)}
                                />
                              </div>
                            </object>
                          );
                        } else {
                          // For regular images
                          return (
                            <img
                              src={item.url}
                              className="w-full h-full" 
                              style={{ minHeight: '100%', objectFit: 'contain' }}
                              alt="Color palette"
                              onError={(e) => {
                                console.error("Image loading error:", e);
                                // Set src to fallback SVG on error
                                e.target.src = generateFallbackSVG();
                              }}
                            />
                          );
                        }
                      })()
                    ) : (
                      // For shapeset items, display the SVG
                      item.svg_content ? (
                        // If we have direct SVG content stored in the database, use it with a data URI
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg_content)}`}
                            className="w-full h-full"
                            style={{ minHeight: '100%', objectFit: 'contain' }}
                            alt="Shapeset"
                            onError={(e) => {
                              console.error("Error displaying SVG content:", e);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="hidden flex-col items-center justify-center bg-gray-100 p-4 absolute inset-0"
                          >
                            <p className="text-gray-600 text-center">Error displaying SVG content</p>
                          </div>
                        </div>
                      ) : (
                        // Fall back to using the URL if we don't have direct content
                        <img
                          src={item.url}
                          className="w-full h-full"
                          style={{ minHeight: '100%', objectFit: 'contain' }}
                          alt="Shapeset"
                          onError={(e) => {
                            console.error("Error loading SVG from URL:", e);
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      )
                    )}
                    
                    {/* Metadata overlay - only shown when info button is clicked */}
                    {showMetadata && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center transition-opacity z-10" onClick={closeMetadata}>
                        <div className="px-7 py-5 backdrop-blur-2xl text-bodytext bg-background relative overflow-hidden rounded-xl max-w-lg lightbox-info-modal modal-dialog">
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
                          
                          <div className="relative z-20 text-white">
                            <div className="space-y-3 text-left">
                              <div className="flex items-center">
                                <span className="w-32 text-gray-200">Name:</span>
                                <span className="text-gray-200">{item.filename}</span>
                              </div>
                              <div className="flex items-center">
                                <span className="w-32 text-gray-200">Created:</span>
                                <span className="text-gray-200">{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString()}</span>
                              </div>
                              
                              {isPalette && (
                                <div>
                                  <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 rounded bg-transparent mx-auto">
                                    {item.palette_colors && Array.isArray(item.palette_colors) && 
                                      item.palette_colors.map((color, index) => (
                                        <div 
                                          key={index} 
                                          className="flex flex-col items-center"
                                          title={color}
                                        >
                                          <div 
                                            className="w-10 h-10 rounded-sm border border-white/20" 
                                            style={{ backgroundColor: color }} 
                                          />
                                          <span className="text-xs mt-1 text-gray-200">{color}</span>
                                        </div>
                                      ))
                                    }
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default LightboxModal;
