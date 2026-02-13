'use client'
import React, { useEffect, useState, useRef } from 'react';

/**
 * SVGLayout - Loads and displays external SVG files
 * Allows coloring individual SVG elements
 * @param {string} svgPath - Path to SVG file
 * @param {Array} shapeColors - Array of colors for each shape
 * @param {Array|number|string} selectedShape - Currently selected shape(s)
 * @param {Array|number} activeShape - Currently active (pressed) shape(s)
 * @param {Function} handleShapeClick - Click handler
 * @param {Function} handleShapeMouseDown - Mouse down handler
 * @param {Function} handleShapeMouseUp - Mouse up handler
 */
const SVGLayout = ({
    svgPath,
    svgContent,
    shapeColors,
    selectedShape,
    activeShape,
    backgroundColor,
    handleShapeClick,
    handleShapeMouseDown,
    handleShapeMouseUp,
    handleBackgroundClick
}) => {
    const [svgData, setSvgData] = useState(svgContent || null);
    const [error, setError] = useState(null);
    const containerRef = useRef(null);
    const shapesRef = useRef([]);
    const handlersRef = useRef({ handleShapeClick, handleShapeMouseDown, handleShapeMouseUp, handleBackgroundClick });

    // Keep handlers up to date
    useEffect(() => {
        handlersRef.current = { handleShapeClick, handleShapeMouseDown, handleShapeMouseUp, handleBackgroundClick };
    }, [handleShapeClick, handleShapeMouseDown, handleShapeMouseUp, handleBackgroundClick]);

    // Load SVG from path if not provided directly
    useEffect(() => {
        if (!svgContent && svgPath) {
            console.log('🔄 Loading SVG from path:', svgPath);
            fetch(svgPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch SVG: ${response.status}`);
                    }
                    return response.text();
                })
                .then(data => {
                    console.log('✅ SVG loaded successfully');
                    setSvgData(data);
                })
                .catch(err => {
                    console.error('❌ Error loading SVG:', err);
                    setError('Failed to load SVG: ' + err.message);
                });
        }
    }, [svgPath, svgContent]);

    // Parse SVG and set up initial structure (only once)
    useEffect(() => {
        if (!svgData || !containerRef.current) return;

        console.log('🎨 Parsing SVG and setting up interactions');

        // Parse SVG string
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;

        // Check for parsing errors
        const parserError = svgElement.querySelector('parsererror');
        if (parserError) {
            console.error('❌ SVG parsing error:', parserError.textContent);
            setError('SVG parsing error');
            return;
        }

        // Find all colorable elements (paths, rects, circles, etc.)
        const colorableElements = svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, polyline');
        console.log(`Found ${colorableElements.length} shapes in SVG`);

        // Store references to shapes
        shapesRef.current = Array.from(colorableElements);

        // Initialize colors from the SVG elements
        console.log('🎨 Initializing SVG colors, shapeColors array:', shapeColors);
        console.log('🎨 shapeColors length:', shapeColors?.length, 'SVG shapes count:', colorableElements.length);

        colorableElements.forEach((element, index) => {
            const originalFill = element.getAttribute('fill') || 'rgb(0,0,0)';

            // Apply the color from shapeColors if available, otherwise keep original
            if (shapeColors[index]) {
                console.log(`Shape ${index}: Applying saved color:`, shapeColors[index]);
                element.setAttribute('fill', shapeColors[index]);
            } else {
                console.log(`Shape ${index}: No saved color, keeping original:`, originalFill);
                element.setAttribute('fill', originalFill);
            }
        });

        // Add event handlers to each shape
        colorableElements.forEach((element, index) => {
            element.style.cursor = 'pointer';
            element.style.pointerEvents = 'auto';
            element.dataset.shapeIndex = index; // Store index in dataset

            const clickHandler = (e) => {
                e.stopPropagation();
                console.log('🖱️ Shape clicked:', index);
                handlersRef.current.handleShapeClick(index);
            };

            const mouseDownHandler = (e) => {
                e.stopPropagation();
                console.log('👇 Shape mouse down:', index);
                handlersRef.current.handleShapeMouseDown(index);
            };

            const mouseUpHandler = (e) => {
                e.stopPropagation();
                handlersRef.current.handleShapeMouseUp();
            };

            element.addEventListener('click', clickHandler);
            element.addEventListener('mousedown', mouseDownHandler);
            element.addEventListener('mouseup', mouseUpHandler);
            element.addEventListener('touchstart', mouseDownHandler);
            element.addEventListener('touchend', mouseUpHandler);
        });

        // Add click handler to SVG element itself for background clicks
        svgElement.addEventListener('click', (e) => {
            // Only handle click if it's directly on the SVG (not bubbled from a shape)
            if (e.target === svgElement) {
                console.log('🖱️ Background clicked via SVG element');
                if (handleBackgroundClick) {
                    handleBackgroundClick();
                }
            }
        });

        // Clear container and add SVG
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(svgElement);

        console.log('✅ SVG setup complete');

    }, [svgData]);

    // Update colors when they change
    useEffect(() => {
        if (shapesRef.current.length === 0) return;

        shapesRef.current.forEach((element, index) => {
            if (shapeColors[index]) {
                element.setAttribute('fill', shapeColors[index]);
            }
        });
    }, [shapeColors]);

    // Update visual feedback for active shapes (pressed state only)
    useEffect(() => {
        if (shapesRef.current.length === 0) return;

        shapesRef.current.forEach((element, index) => {
            const isActive = Array.isArray(activeShape)
                ? activeShape.includes(index)
                : activeShape === index;

            // Only show visual feedback when actively pressed (not just selected)
            if (isActive) {
                element.style.opacity = '0.7';
            } else {
                element.style.opacity = '1';
            }
        });
    }, [activeShape]);

    if (error) {
        return (
            <div style={{
                padding: '20px',
                background: '#f44336',
                color: '#fff',
                borderRadius: '8px'
            }}>
                {error}
            </div>
        );
    }

    if (!svgData) {
        return (
            <div style={{
                padding: '20px',
                background: '#333',
                color: '#fff',
                borderRadius: '8px'
            }}>
                Loading SVG...
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'transparent',
                pointerEvents: 'auto'
            }}
            onClick={(e) => {
                // If clicking the container (not a shape), select background
                console.log('🖱️ SVGLayout clicked, target:', e.target.tagName, e.target);
                if (e.target === containerRef.current || e.target.tagName.toLowerCase() === 'svg') {
                    console.log('🖱️ Background clicked via SVGLayout');
                    if (handleBackgroundClick) {
                        handleBackgroundClick();
                    }
                }
            }}
        />
    );
};

export default SVGLayout;
