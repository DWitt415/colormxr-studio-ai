'use client';
import React, { useState, Suspense, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import DirectSVGImporter from '@/components/DirectSVGImporter'
import PaletteModal from '@/components/Modals/PaletteModal'
import ShapesetModal from '@/components/Modals/ShapesetModal'
import ExerciseIconsPanel from '@/components/ExerciseIconsPanel'

// Create a client component for SVG Viewer content
function SVGViewerContent({ updateFileName, updateShapeColors, updateBgColor, updatePaletteColors }) {
  /**
   * SVG Viewer Page - A dedicated page for viewing imported SVGs
   * This page completely replaces the exercise page when viewing imported SVGs
   * and eliminates the CMYK slider jittering issues by using a clean, focused UI
   */
  
  // State for SVG data
  const [svgData, setSVGData] = useState(null);
  const [paletteColors, setPaletteColors] = useState([
    "#D9D9D9", "#D9D9D9", "#D9D9D9", "#D9D9D9", "#D9D9D9"
  ]);
  const [backgroundColor, setBackgroundColor] = useState('rgb(255,255,255)');
  const [shapeColors, setShapeColors] = useState([]);
  const [fileName, setFileName] = useState(''); // Add state for file name
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  // On mount, check for SVG data in local storage (passed from exercise page)
  useEffect(() => {
    // Remove query parameters from URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.search) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
    
    const storedData = localStorage.getItem('importedSVGData');
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setSVGData(parsedData);
        
        // Extract file name from the data if available
        if (parsedData.fileName) {
          // Remove .svg extension if present
          const cleanFileName = parsedData.fileName.replace(/\.svg$/i, '');
          setFileName(cleanFileName);
          
          // Set page title to the file name
          document.title = cleanFileName || "SVG Viewer";
          
          // Pass the file name up to parent component
          if (updateFileName) {
            updateFileName(cleanFileName);
            console.log("Updating file name:", cleanFileName); // Debug logging
          }
        }
        
        // Initialize other state from the stored data
        if (parsedData.backgroundColor) {
          setBackgroundColor(parsedData.backgroundColor);
          if (updateBgColor) updateBgColor(parsedData.backgroundColor);
        }
        
        if (parsedData.shapeColors && parsedData.shapeColors.length > 0) {
          setShapeColors(parsedData.shapeColors);
          if (updateShapeColors) updateShapeColors(parsedData.shapeColors);
          // Also set initial palette colors
          const paletteColorsToUse = parsedData.shapeColors.slice(0, 5);
          setPaletteColors(paletteColorsToUse);
          // Make sure to notify the parent about the palette colors
          if (onPaletteChange) onPaletteChange(paletteColorsToUse);
        }
        
        // Clear storage after retrieval to avoid stale data on future visits
        localStorage.removeItem('importedSVGData');
      } catch (error) {
        console.error("Error parsing SVG data from localStorage:", error);
      }
    }
  }, [updateFileName, updateShapeColors, updateBgColor]);
    
  // Callback functions to update state from DirectSVGImporter
  const updatePaletteColorsHandler = (colors) => {
    if (colors && colors.length) {
      setPaletteColors(colors);
      // Pass palette colors up to parent immediately
      if (updatePaletteColors) {
        updatePaletteColors(colors);
      }
    }
  }
  
  const updateBackgroundColor = (color) => {
    if (color) {
      setBackgroundColor(color);
      if (updateBgColor) updateBgColor(color);
    }
  }
  
  const updateShapeColorsHandler = (colors) => {
    if (colors && colors.length) {
      setShapeColors(colors);
      if (updateShapeColors) updateShapeColors(colors);
    }
  }
  
  // Handle file selection from file dialog
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const fileContent = await readFileAsText(file);
      const parsedSVG = parseSVG(fileContent);
      
      if (parsedSVG && parsedSVG.shapesData && parsedSVG.shapesData.length > 0) {
        // Set file name
        const cleanFileName = file.name.replace(/\.svg$/i, '');
        setFileName(cleanFileName);
        document.title = cleanFileName || "SVG Viewer";
        
        // Update parent with file name
        if (updateFileName) {
          updateFileName(cleanFileName);
          console.log("File name updated from selected file:", cleanFileName); // Debug logging
        }
        
        // Add fileName to the parsedSVG data
        parsedSVG.fileName = file.name;
        
        // Set SVG data
        setSVGData(parsedSVG);
        
        // Set colors
        if (parsedSVG.backgroundColor) {
          setBackgroundColor(parsedSVG.backgroundColor);
          if (updateBgColor) updateBgColor(parsedSVG.backgroundColor);
        }
        
        if (parsedSVG.shapeColors && parsedSVG.shapeColors.length > 0) {
          setShapeColors(parsedSVG.shapeColors);
          if (updateShapeColors) updateShapeColors(parsedSVG.shapeColors);
          setPaletteColors(parsedSVG.shapeColors.slice(0, 5));
        }
      } else {
        alert("No valid shapes found in the SVG file.");
      }
    } catch (error) {
      console.error("Error parsing SVG file:", error);
      alert("There was an error parsing the SVG file. Please try again.");
    }
  };
  
  // Read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };
  
  // Parse SVG content
  const parseSVG = (svgContent) => {
    // Create a temporary DOM element to parse the SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
    
    // Extract rectangles
    const rects = Array.from(svgDoc.querySelectorAll('rect'));
    
    // Process rectangle data
    const shapesData = rects.map(rect => {
      const x = parseFloat(rect.getAttribute('x') || '0');
      const y = parseFloat(rect.getAttribute('y') || '0');
      const width = parseFloat(rect.getAttribute('width') || '0');
      const height = parseFloat(rect.getAttribute('height') || '0');
      const fill = rect.getAttribute('fill') || '#000000';
      
      return {
        type: 'rect',
        x,
        y,
        width,
        height,
        color: fill
      };
    });
    
    // Extract background color if available
    let backgroundColor = 'rgb(255,255,255)';
    const svgElement = svgDoc.querySelector('svg');
    if (svgElement && svgElement.style.backgroundColor) {
      backgroundColor = svgElement.style.backgroundColor;
    }
    
    // Extract colors from shapes
    const shapeColors = shapesData.map(shape => shape.color);
    
    return {
      shapesData,
      backgroundColor,
      shapeColors,
      fileName: ''  // Will be set later
    };
  };
  
  // Open file dialog
  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
    
  // If no SVG data, show load file UI
  if (!svgData || !svgData.shapesData || svgData.shapesData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">SVG Viewer</h1>
          <p className="text-gray-600">Load an SVG file to view and modify it</p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
          <input
            type="file"
            accept=".svg"
            className="hidden"
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
          
          <div className="flex flex-col items-center">
            <svg className="w-20 h-20 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            
            <p className="text-gray-600 mb-4">Drag and drop your SVG file here or click to browse</p>
            
            <button
              onClick={handleOpenFileDialog}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Select SVG File
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex items-center justify-center">
        <DirectSVGImporter
          svgData={svgData}
          onPaletteChange={updatePaletteColorsHandler}
          onBackgroundChange={updateBackgroundColor}
          onShapeColorsChange={updateShapeColorsHandler}
          fileName={fileName}
        />
      </div>
      
      {/* Add vertical color palette - same as in ColorControllerUI */}
      <div 
        className="fixed left-2 top-1/2 transform -translate-y-1/2 z-10" 
        style={{ 
            background: "transparent", 
            padding: "10px 10px", 
            borderRadius: "0 4px 4px 0",
            boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
            border: "1px solid transparent",
            borderImage: "linear-gradient(to bottom, #C8C8C8, #626262) 1",
            minWidth: "50px"
        }}
      >
        <div className="flex flex-col gap-2">
            {paletteColors.map((color, index) => (
                <div 
                    key={index}
                    className="palette-square shadow-sm hover:shadow-md transition-shadow"
                    style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: color,
                        cursor: "pointer"
                    }}
                />
            ))}
        </div>
      </div>
    </div>
  );
}

// Main page component that uses Suspense for client components
function SVGViewerPage() {
  // File name will be set in the SVGViewerContent component
  const [fileName, setFileName] = useState('');
  const [shapeColors, setShapeColors] = useState([]);
  const [backgroundColor, setBackgroundColor] = useState('rgb(255,255,255)');
  const [paletteColors, setPaletteColors] = useState([]);
  
  // Modal states
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState(false);
  const [isShapesetModalOpen, setIsShapesetModalOpen] = useState(false);
  
  // Function to receive file name from SVGViewerContent
  const updateFileName = (name) => {
    setFileName(name);
  };
  
  const updateShapeColors = (colors) => {
    setShapeColors(colors);
  };
  
  const updateBackgroundColor = (color) => {
    setBackgroundColor(color);
  };

  // Modal control functions
  const paletteModalOpen = () => {
    setIsPaletteModalOpen(true);
  };

  const paletteModalClose = () => {
    setIsPaletteModalOpen(false);
  };

  const shapesetModalOpen = () => {
    setIsShapesetModalOpen(true);
  };

  const shapesetModalClose = () => {
    setIsShapesetModalOpen(false);
  };

  // For compatibility with ExerciseIconsPanel
  const handleImportSVG = () => {
    // Since we're already in the SVG viewer, just refresh the page
    window.location.reload();
  };

  // No instruction modal in SVG viewer
  const handleInstructionOpen = () => {
    // No-op or could show a simple alert
    alert("SVG Viewer - Use the tools to edit and manipulate the imported SVG.");
  };

  // Set a clean page title without parameters
  useEffect(() => {
    document.title = "SVG Viewer";
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex-grow h-[calc(100vh-90px)] relative overflow-hidden">
        {/* Icon Panel positioned above everything else */}
        <div className="absolute top-0 right-0 z-50">
          <ExerciseIconsPanel
            onPaletteOpen={paletteModalOpen}
            onShapesetOpen={shapesetModalOpen}
            onImportSVGOpen={handleImportSVG}
            onInstructionOpen={handleInstructionOpen}
            shapeColors={shapeColors}
            backgroundColor={backgroundColor}
            importedShapesData={[]} // Fixed: Empty array since svgData might not be defined yet
          />
        </div>
        
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <SVGViewerContent 
            updateFileName={updateFileName} 
            updateShapeColors={updateShapeColors}
            updateBgColor={updateBackgroundColor}
            updatePaletteColors={setPaletteColors}
          />
        </Suspense>
      </div>
      
      <Footer lesson="" exerciseNumber="" title={fileName || ""} />
      
      {/* Modals */}
      <PaletteModal
        isOpen={isPaletteModalOpen}
        closeModal={paletteModalClose}
        colorPalette={shapeColors.slice(0, 5)}
        backgroundColor={backgroundColor}
      />
      
      <ShapesetModal
        isOpen={isShapesetModalOpen}
        closeModal={shapesetModalClose}
        shapeColors={shapeColors}
        backgroundColor={backgroundColor}
        importedShapesData={[]} // Fixed: Empty array since svgData might not be defined yet
      />
    </div>
  );
}

export default SVGViewerPage;
