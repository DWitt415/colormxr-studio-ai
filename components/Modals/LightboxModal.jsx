// filepath: /Users/dwitt/Sites/colormxr_dev/components/Modals/LightboxModal.jsx
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { Fragment, useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import supabase from '@/utils/supabase'

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

  // State for editing the name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // State for fade transition
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentItem, setCurrentItem] = useState(item);

  // Reference for palette export
  const paletteRef = useRef(null);

  // Handle fade transition when item changes
  useEffect(() => {
    if (item && item.id !== currentItem?.id) {
      // Start fade out
      setIsTransitioning(true);

      // After fade out completes, update the item
      const fadeOutTimer = setTimeout(() => {
        setCurrentItem(item);

        // Pause before fading back in
        const fadeInTimer = setTimeout(() => {
          setIsTransitioning(false);
        }, 700);

        return () => clearTimeout(fadeInTimer);
      }, 400);

      return () => clearTimeout(fadeOutTimer);
    } else if (item && !currentItem) {
      // Initial load
      setCurrentItem(item);
    }
  }, [item]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (hasPrevious) {
          onPrevious();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (hasNext) {
          onNext();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, hasNext, hasPrevious, onNext, onPrevious, closeModal]);

  // Create filename based on item name or timestamp
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
  }).replace(/\//g, '-');
  const timeString = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  const fileName = currentItem?.filename ? currentItem.filename.replace(/\.[^/.]+$/, "") : `colormxr-palette-${dateString}-${timeString}`;

  // Handle PNG export
  const handleExportAsPNG = async () => {
    if (paletteRef.current) {
      try {
        // Temporarily make the palette element visible for capture
        const originalDisplay = paletteRef.current.style.display;
        paletteRef.current.style.display = 'block';
        paletteRef.current.classList.remove('hidden');

        // Configure html2canvas with better quality settings
        const canvas = await html2canvas(paletteRef.current, {
          backgroundColor: currentItem.background_color || null,
          scale: 3, // Higher quality for better detail
          width: 590, // Ensure correct width capture
          height: 150, // Ensure correct height capture
          logging: false,
          useCORS: true,
          allowTaint: true
        });
        
        // Restore the original visibility
        paletteRef.current.style.display = originalDisplay;
        paletteRef.current.classList.add('hidden');
        
        const image = canvas.toDataURL("image/png");
        
        // Download the image
        const downloadLink = document.createElement('a');
        downloadLink.href = image;
        downloadLink.download = `${fileName}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      } catch (error) {
        console.error("Error exporting palette as PNG:", error);
      }
    }
  };
  
  // Handle SVG export
  const handleExportAsSVG = () => {
    if (!currentItem || !currentItem.palette_colors) return;

    try {
      // Create SVG content
      const svgWidth = 590; // 5*100 + 4*10 + 2*25 (5 squares + 4 gaps + left/right padding)
      const svgHeight = 150; // 100 + 50 (1 square height + padding)
      const squareSize = 100;
      const padding = 25;
      const gap = 10;

      // Start SVG document
      let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
      <!-- Palette exported from Colormxr -->

      <!-- Background -->
      <rect width="${svgWidth}" height="${svgHeight}" fill="${currentItem.background_color || '#FFFFFF'}" />

      <!-- Color squares -->`;

      // Make sure we have exactly 5 colors for display
      let displayColors = [...currentItem.palette_colors];
      
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
        const normalizedPaletteColor = normalizeColor(displayColors[i]);
        const normalizedBgColor = normalizeColor(currentItem.background_color || '#FFFFFF');
        const colorMatches = normalizedPaletteColor === normalizedBgColor;
        
        svgContent += `
      <rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${displayColors[i]}" ${colorMatches ? 'stroke="#ABABAB" stroke-width="2"' : ''} />`;
      }
      
      // Close SVG document
      svgContent += `
</svg>`;
      
      // Create blob and download
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `${fileName}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error("Error exporting palette as SVG:", error);
    }
  };
  
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
  const isPalette = currentItem && !currentItem.shape_colors && currentItem.palette_colors;
  
  // Helper function to normalize colors to HEX format for comparison
  const normalizeColor = (color) => {
    if (!color) return '#ffffff';

    // If it's already hex, just return lowercase
    if (color.startsWith('#')) {
      return color.toLowerCase();
    }

    // If it's RGB format, convert to hex
    if (color.startsWith('rgb')) {
      const rgbValues = color.match(/\d+/g);
      if (rgbValues && rgbValues.length === 3) {
        const [r, g, b] = rgbValues.map(Number);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase()}`;
      }
    }

    return color.toLowerCase();
  };

  // Handle name edit start
  const handleNameClick = () => {
    setIsEditingName(true);
    setEditedName(currentItem.filename || '');
  };

  // Handle name save on blur
  const handleNameSave = async (closeDialog = false) => {
    if (!editedName.trim() || editedName === currentItem.filename) {
      setIsEditingName(false);
      if (closeDialog) {
        setShowMetadata(false);
      }
      return;
    }

    try {
      // Determine which table to update based on item type
      const tableName = isPalette ? 'palette_gallery' : 'shapeset_gallery';

      const { error } = await supabase
        .from(tableName)
        .update({ filename: editedName.trim() })
        .eq('id', currentItem.id);

      if (error) throw error;

      // Update local item
      currentItem.filename = editedName.trim();

    } catch (err) {
      console.error('Error updating filename:', err);
    } finally {
      setIsEditingName(false);
      if (closeDialog) {
        setShowMetadata(false);
      }
    }
  };

  // Handle Enter key to save and close dialog
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNameSave(true); // Pass true to close the dialog
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedName('');
    }
  };
  
  if (!currentItem) return null;
  
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
                style={isPalette && currentItem.background_color ? { backgroundColor: currentItem.background_color } : { backgroundColor: 'transparent' }}
              >
                {/* Control buttons at the top */}
                <div className="absolute top-4 left-0 right-0 z-50 flex px-4">
                  {/* Left side controls */}
                  <div className="flex items-center gap-2 w-1/3">
                    {/* Info button (top-left corner) */}
                    <button
                      onClick={toggleMetadata}
                      className="p-2 transition-colors"
                      aria-label={showMetadata ? "Hide metadata" : "Show metadata"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#565656" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
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
                      className="p-2 transition-colors"
                      aria-label="Previous image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#565656" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Series name and position indicator - no background, #565656 text */}
                    {seriesContext && (
                      <div className="flex items-center gap-2 py-2 px-3 text-sm" style={{ color: "#565656" }}>
                        <span>{seriesContext.name}:</span>
                        <span>{seriesContext.currentIndex} / {seriesContext.totalItems}</span>
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
                      className="p-2 transition-colors"
                      aria-label="Next image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#565656" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Right side controls */}
                  <div className="w-1/3 flex justify-end">
                    {/* Close button (top-right corner) */}
                    <button
                      onClick={closeModal}
                      className="p-2 transition-colors"
                      aria-label="Close lightbox"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="#565656" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Content Container - Full screen */}
                <div className="flex flex-col items-center h-full relative">

                  <div className={`w-full h-full ${isPalette ? '' : 'border border-gray-700 rounded-lg overflow-hidden bg-white shadow-2xl'}`}>
                    <div
                      style={{
                        opacity: isTransitioning ? 0 : 1,
                        transition: 'opacity 0.4s ease-in-out',
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      {isPalette ? (
                                      // For palette items, display the SVG or image depending on filename
                                      (() => {
                                        console.log("Rendering palette item:", currentItem);
                                        console.log("Item URL:", currentItem.url);
                                        console.log("Item filename:", currentItem.filename);
                                        console.log("Is SVG:", currentItem.filename && currentItem.filename.toLowerCase().endsWith('.svg'));
                                        
                                        // Generate fallback SVG content directly from palette colors
                                        const generateFallbackSVG = () => {
                                          if (!currentItem.palette_colors || !Array.isArray(currentItem.palette_colors)) {
                                            return null;
                                          }

                                          const svgWidth = 550;
                                          const svgHeight = 150;
                                          const squareSize = 100;
                                          const padding = 25;
                                          const gap = 10;

                                          // Create SVG without background color since we're applying it to the entire modal
                                          let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
                                            <rect width="${svgWidth}" height="${svgHeight}" fill="transparent" />`;

                                          // Make sure we have exactly 5 colors for display
                                          let displayColors = [...currentItem.palette_colors];

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
                                            const normalizedPaletteColor = normalizeColor(displayColors[i]);
                                            const normalizedBgColor = normalizeColor(currentItem.background_color || '#FFFFFF');
                                            const colorMatches = normalizedPaletteColor === normalizedBgColor;
                                            
                                            svgContent += `<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${displayColors[i]}" ${colorMatches ? 'stroke="#ABABAB" stroke-width="2"' : ''} />`;
                                          }
                                          
                                          svgContent += '</svg>';
                                          return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
                                        };
                                        
                                        // We'll use paletteRef directly without a setup function
                        
                        // Use SVG rendering with better error handling
                        if (currentItem.filename && currentItem.filename.toLowerCase().endsWith('.svg')) {
                          // For SVG files, try loading them with proper fallback
                          return (
                            <object
                              type="image/svg+xml"
                              data={currentItem.url}
                              className="w-full h-full"
                              style={{ minHeight: '100%', objectFit: 'contain' }}
                              onLoad={() => console.log("SVG loaded successfully!")}
                              onError={(e) => {
                                console.error("SVG loading error:", e);
                                // Try to fetch the SVG directly to see what's wrong
                                fetch(currentItem.url)
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
                              src={currentItem.url}
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
                      currentItem.svg_content ? (
                        // If we have direct SVG content stored in the database, use it with a data URI
                        <div className="w-full h-full flex items-center justify-center">
                          <img
                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(currentItem.svg_content)}`}
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
                        currentItem.isStaticImage ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <img
                              src={currentItem.url}
                              style={{
                                width: '50%',
                                height: '50%',
                                objectFit: 'contain'
                              }}
                              alt="Shapeset"
                              onError={(e) => {
                                console.error("Error loading image from URL:", e);
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <img
                            src={currentItem.url}
                            className="w-full h-full"
                            style={{
                              minHeight: '100%',
                              objectFit: 'contain'
                            }}
                            alt="Shapeset"
                            onError={(e) => {
                              console.error("Error loading SVG from URL:", e);
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        )
                      )
                    )}
                    </div>

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
                                {isEditingName ? (
                                  <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={handleNameKeyDown}
                                    autoFocus
                                    className="flex-1 bg-gray-700 text-gray-200 px-2 py-1 rounded border border-gray-500 focus:outline-none focus:border-blue-500"
                                  />
                                ) : (
                                  <span
                                    className="text-gray-200 cursor-pointer hover:text-blue-400 transition-colors"
                                    onClick={handleNameClick}
                                    title="Click to edit"
                                  >
                                    {currentItem.filename}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <span className="w-32 text-gray-200">Created:</span>
                                <span className="text-gray-200">{new Date(currentItem.created_at).toLocaleDateString()} {new Date(currentItem.created_at).toLocaleTimeString()}</span>
                              </div>
                              
                              {isPalette && (
                                <div>
                                  {/* Hidden palette element for export */}
                                  <div
                                    ref={paletteRef}
                                    className="hidden"
                                    style={{
                                      backgroundColor: currentItem.background_color || '#FFFFFF',
                                      width: '590px', /* 5*100px + 4*10px + 2*25px (5 squares + 4 gaps + left/right padding) */
                                      height: 'calc(100px + 50px)', /* 1 square height + 50px extra */
                                      position: 'absolute',
                                      left: '-9999px',
                                      top: 0,
                                      display: 'none'  /* Ensure it's not visible */
                                    }}
                                  >
                                    <div className="flex gap-[10px] p-[25px]">
                                      {currentItem.palette_colors && Array.isArray(currentItem.palette_colors) &&
                                        currentItem.palette_colors.slice(0, 5).map((color, index) => {
                                          const normalizedPaletteColor = normalizeColor(color);
                                          const normalizedBgColor = normalizeColor(currentItem.background_color || '#FFFFFF');
                                          const colorMatches = normalizedPaletteColor === normalizedBgColor;
                                          
                                          return (
                                            <div 
                                              key={index}
                                              className="w-[100px] h-[100px]"
                                              style={{
                                                backgroundColor: color,
                                                border: colorMatches ? '2px solid #ABABAB' : 'none'
                                              }}
                                            />
                                          );
                                        })
                                      }
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 rounded bg-transparent mx-auto">                                      {currentItem.palette_colors && Array.isArray(currentItem.palette_colors) &&
                                      currentItem.palette_colors.map((color, index) => {
                                        // Helper function to normalize colors to HEX format for comparison
                                        const normalizeColor = (color) => {
                                          if (!color) return '#FFFFFF';

                                          // If it's already hex, just return lowercase
                                          if (color.startsWith('#')) {
                                            return color.toLowerCase();
                                          }

                                          // If it's RGB format, convert to hex
                                          if (color.startsWith('rgb')) {
                                            const rgbValues = color.match(/\d+/g);
                                            if (rgbValues && rgbValues.length === 3) {
                                              const [r, g, b] = rgbValues.map(Number);
                                              return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase()}`;
                                            }
                                          }

                                          return color.toLowerCase();
                                        };

                                        const normalizedPaletteColor = normalizeColor(color);
                                        const normalizedBgColor = normalizeColor(currentItem.background_color || '#FFFFFF');
                                        const colorMatches = normalizedPaletteColor === normalizedBgColor;
                                        
                                        return (
                                          <div 
                                            key={index} 
                                            className="flex flex-col items-center"
                                            title={color}
                                          >
                                            <div 
                                              className="w-10 h-10 rounded-sm" 
                                              style={{ 
                                                backgroundColor: color,
                                                border: colorMatches
                                                  ? '2px solid #ABABAB' 
                                                  : '1px solid rgba(255, 255, 255, 0.2)'
                                              }} 
                                            />
                                            <span className="text-xs mt-1 text-gray-200">{color}</span>
                                          </div>
                                        );
                                      })}
                                  </div>
                                  
                                  {/* Download buttons */}
                                  <div className="mt-4 flex gap-2 justify-center">
                                    <button
                                      onClick={handleExportAsPNG}
                                      className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded text-sm"
                                    >
                                      Download PNG
                                    </button>
                                    
                                    <button
                                      onClick={handleExportAsSVG}
                                      className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded text-sm"
                                    >
                                      Download SVG
                                    </button>
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
