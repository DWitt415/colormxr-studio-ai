'use client'
import React from 'react';

/**
 * CosmicLayout - Concentric shapes emanating from center
 * Each shape grows larger and is positioned absolutely from the center
 * @param {number} count - Number of concentric shapes (uses col from props)
 * @param {number} width - Base width for innermost shape
 * @param {number} height - Base height for innermost shape
 * @param {number} hSpace - Horizontal growth increment per layer
 * @param {number} vSpace - Vertical growth increment per layer
 * @param {Array} shapeColors - Array of colors for each shape
 * @param {Array|number|string} selectedShape - Currently selected shape(s)
 * @param {Array|number} activeShape - Currently active (pressed) shape(s)
 * @param {string} backgroundColor - Background color
 * @param {Function} handleShapeClick - Click handler
 * @param {Function} handleShapeMouseDown - Mouse down handler
 * @param {Function} handleShapeMouseUp - Mouse up handler
 */
const CosmicLayout = ({
    col, // Number of concentric shapes
    width,
    height,
    hSpace,
    vSpace,
    shapeColors,
    selectedShape,
    activeShape,
    backgroundColor,
    handleShapeClick,
    handleShapeMouseDown,
    handleShapeMouseUp
}) => {
    const shapes = [];

    // Create concentric shapes from outermost to innermost
    // Reverse order so innermost is rendered on top
    for (let i = col - 1; i >= 0; i--) {
        const index = i;

        // Calculate size for this layer
        const currentWidth = width + i * hSpace;
        const currentHeight = height + i * vSpace;

        // Get the shape color
        let shapeColor = shapeColors[index] || shapeColors[index % shapeColors.length];

        // Check if this shape is active (being pressed)
        const isActive = Array.isArray(activeShape)
            ? activeShape.includes(index)
            : activeShape === index;

        // Apply opacity if shape is being pressed
        let fillColor = shapeColor;
        if (isActive && shapeColor) {
            if (shapeColor.startsWith('rgb(')) {
                fillColor = shapeColor.replace('rgb(', 'rgba(').replace(')', ', 0.6)');
            } else if (shapeColor.startsWith('#')) {
                const r = parseInt(shapeColor.slice(1, 3), 16);
                const g = parseInt(shapeColor.slice(3, 5), 16);
                const b = parseInt(shapeColor.slice(5, 7), 16);
                fillColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
            }
        }

        shapes.push(
            <svg
                key={index}
                width={currentWidth}
                height={currentHeight}
                style={{
                    position: 'absolute',
                    top: `calc(50% - ${currentHeight / 2}px)`,
                    left: `calc(50% - ${currentWidth / 2}px)`,
                    zIndex: col - i, // Higher z-index for inner shapes
                    cursor: 'pointer',
                    pointerEvents: 'all'
                }}
                onClick={() => handleShapeClick(index)}
                onMouseDown={() => handleShapeMouseDown(index)}
                onMouseUp={() => handleShapeMouseUp()}
                onMouseLeave={() => handleShapeMouseUp()}
                onTouchStart={() => handleShapeMouseDown(index)}
                onTouchEnd={() => handleShapeMouseUp()}
            >
                <rect
                    width="100%"
                    height="100%"
                    fill={fillColor}
                    className="cursor-pointer"
                />
            </svg>
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
            }}
        >
            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                {shapes}
            </div>
        </div>
    );
};

export default CosmicLayout;
