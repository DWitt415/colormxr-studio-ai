import { useState, useRef } from 'react'

function ImportSVGModal({ isOpen, closeModal, onSVGImport }) {
    // State to track uploaded file
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);
    
    // Reference for the file input
    const fileInputRef = useRef(null);
    
    // Don't render anything if not open
    if (!isOpen) return null;

    // Handle file selection
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setError(null);
        
        if (!selectedFile) {
            setFile(null);
            setPreview(null);
            return;
        }
        
        // Validate file type
        if (selectedFile.type !== 'image/svg+xml' && !selectedFile.name.endsWith('.svg')) {
            setError('Please select a valid SVG file.');
            setFile(null);
            setPreview(null);
            return;
        }
        
        setFile(selectedFile);
        
        // Generate preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setPreview(event.target.result);
        };
        reader.readAsText(selectedFile);
    };
    
    // Parse the SVG file and extract colors and exact shape data
    const parseSVG = (svgContent) => {
        try {
            console.log("Parsing SVG content...");
            
            // Create a temporary DOM element to parse the SVG
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
            
            // Check for parsing errors
            const parserError = svgDoc.querySelector('parsererror');
            if (parserError) {
                console.error("XML parsing error:", parserError.textContent);
                setError("Failed to parse SVG file. XML parsing error.");
                return null;
            }
            
            // Extract SVG dimensions
            const svgElement = svgDoc.querySelector('svg');
            const svgWidth = parseFloat(svgElement.getAttribute('width') || 0);
            const svgHeight = parseFloat(svgElement.getAttribute('height') || 0);
            
            // Extract background color - find the first rectangle that covers the entire SVG
            let backgroundColor = 'rgb(255,255,255)'; // Default background
            const allRects = Array.from(svgDoc.querySelectorAll('rect'));
            // Find the first rectangle that might be a background
            for (const rect of allRects) {
                const x = parseFloat(rect.getAttribute('x') || 0);
                const y = parseFloat(rect.getAttribute('y') || 0);
                const width = parseFloat(rect.getAttribute('width') || 0);
                const height = parseFloat(rect.getAttribute('height') || 0);
                
                // If this rectangle covers (or nearly covers) the entire SVG, treat it as background
                if (x <= 1 && y <= 1 && width >= svgWidth - 2 && height >= svgHeight - 2) {
                    backgroundColor = rect.getAttribute('fill');
                    console.log("Found background color:", backgroundColor);
                    break;
                }
            }
            
            // Extract shape data - get all rectangles except the background
            const shapeRects = Array.from(svgDoc.querySelectorAll('rect')).filter(rect => {
                const x = parseFloat(rect.getAttribute('x') || 0);
                const y = parseFloat(rect.getAttribute('y') || 0);
                const width = parseFloat(rect.getAttribute('width') || 0);
                const height = parseFloat(rect.getAttribute('height') || 0);
                
                // Skip the background rectangle
                return !(x <= 1 && y <= 1 && width >= svgWidth - 2 && height >= svgHeight - 2);
            });
            
            console.log("Found", shapeRects.length, "shape rectangles");
            
            // Extract exact shape data with positions and dimensions
            const shapesData = shapeRects.map(rect => {
                return {
                    x: parseFloat(rect.getAttribute('x') || 0),
                    y: parseFloat(rect.getAttribute('y') || 0),
                    width: parseFloat(rect.getAttribute('width') || 0),
                    height: parseFloat(rect.getAttribute('height') || 0),
                    color: rect.getAttribute('fill')
                };
            });
            
            // Extract colors from shapes
            const shapeColors = shapesData.map(shape => shape.color);
            
            // Calculate spacing between shapes to assist with grid detection
            let xSpacing = 0;
            let ySpacing = 0;
            
            // Sort shapes by position for spacing analysis
            const sortedByX = [...shapesData].sort((a, b) => a.x - b.x);
            const sortedByY = [...shapesData].sort((a, b) => a.y - b.y);
            
            // Find common spacing in x direction
            const xDiffs = [];
            for (let i = 1; i < sortedByX.length; i++) {
                const diff = sortedByX[i].x - (sortedByX[i-1].x + sortedByX[i-1].width);
                if (diff > 0) xDiffs.push(diff);
            }
            
            // Find common spacing in y direction
            const yDiffs = [];
            for (let i = 1; i < sortedByY.length; i++) {
                const diff = sortedByY[i].y - (sortedByY[i-1].y + sortedByY[i-1].height);
                if (diff > 0) yDiffs.push(diff);
            }
            
            // Calculate average spacing if we have multiple values
            if (xDiffs.length > 0) {
                xSpacing = xDiffs.reduce((sum, val) => sum + val, 0) / xDiffs.length;
            }
            
            if (yDiffs.length > 0) {
                ySpacing = yDiffs.reduce((sum, val) => sum + val, 0) / yDiffs.length;
            }
            
            console.log(`Detected spacing: X=${xSpacing.toFixed(2)}, Y=${ySpacing.toFixed(2)}`);
            
            return {
                backgroundColor,
                shapeColors,
                shapesData,
                xSpacing,
                ySpacing,
                svgWidth,
                svgHeight
            };
        } catch (error) {
            console.error("Error parsing SVG:", error);
            setError("Failed to parse SVG file. Please ensure it's a valid ColorMXR SVG.");
            return null;
        }
    };
    
    // Simple import handler
    const handleImport = () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const svgContent = event.target.result;
            if (svgContent.length < 100) {
                setError('The selected file appears to be empty or invalid.');
                return;
            }
            
            const parsedData = parseSVG(svgContent);
            if (!parsedData) return;
            
            if (!parsedData.shapesData || parsedData.shapesData.length === 0) {
                setError('No shape data found in the SVG.');
                return;
            }
            
            onSVGImport(parsedData);
            closeModal();
        };
        reader.onerror = () => setError('Failed to read the file.');
        reader.readAsText(file);
    };

    // Helper method to trigger file selection
    const triggerFileSelection = (e) => {
        if (e) e.stopPropagation();
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50" onClick={closeModal}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 mx-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-medium text-[#5670F8] mb-4">Import SVG</h2>
                
                <div>
                    <p className="text-sm text-gray-300 mb-4">
                        Select a ColorMXR SVG file to import. This will update the current shapeset with the colors from the SVG.
                    </p>
                    
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".svg,image/svg+xml"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    
                    <div 
                        className="border-2 border-dashed border-gray-600 rounded-md p-6 mb-4 text-center"
                    >
                        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" />
                        </svg>
                        
                        <button
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium"
                            onClick={triggerFileSelection}
                        >
                            Select SVG File
                        </button>
                        
                        {file && (
                            <p className="mt-3 text-sm text-blue-300">
                                Selected: {file.name}
                            </p>
                        )}
                    </div>
                    
                    {preview && (
                        <div className="mb-4 p-2 border border-gray-600 rounded-md">
                            <p className="text-xs text-gray-400 mb-1">Preview:</p>
                            <div 
                                className="w-full aspect-video bg-white rounded overflow-hidden flex items-center justify-center"
                                dangerouslySetInnerHTML={{ __html: preview }}
                                style={{ maxHeight: "150px" }}
                            />
                        </div>
                    )}
                    
                    {error && (
                        <p className="text-sm text-red-500 mb-4">{error}</p>
                    )}
                    
                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white"
                            onClick={closeModal}
                        >
                            Cancel
                        </button>
                        <button
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleImport}
                            disabled={!file}
                        >
                            Import
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportSVGModal;
