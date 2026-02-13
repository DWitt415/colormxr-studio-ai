'use client'
import React from 'react';

/**
 * RadiantLayout - Triangular sunburst pattern radiating from center
 * Triangles emanate from a central point, rotated evenly around 360 degrees
 * Triangle height extends beyond container to hide bottom vertices
 *
 * @param {number} col - Number of triangular segments
 * @param {number} width - Base width of each triangle
 * @param {boolean} fillArea - If true, triangles fill entire area like pie slices
 * @param {Array} shapeColors - Array of colors for each shape
 * @param {Array|number|string} selectedShape - Currently selected shape(s)
 * @param {Array|number} activeShape - Currently active (pressed) shape(s)
 * @param {string} backgroundColor - Background color
 * @param {Function} handleShapeClick - Click handler
 * @param {Function} handleShapeMouseDown - Mouse down handler
 * @param {Function} handleShapeMouseUp - Mouse up handler
 */
const RadiantLayout = ({
    col, // Number of triangular segments
    width, // Base width of each triangle
    fillArea = false, // If true, fill entire area like pie slices
    shapeColors,
    selectedShape,
    activeShape,
    backgroundColor,
    handleShapeClick,
    handleShapeMouseDown,
    handleShapeMouseUp
}) => {

    const triangles = [];

    // Calculate rotation angle for even distribution
    const angleStep = 360 / col;

    // Use a large radius to extend triangles beyond viewport
    const radius = 3000;

    // If fillArea is true, calculate width to create perfect pie slices
    // Width is calculated so triangles meet edge-to-edge at the radius
    const effectiveWidth = fillArea
        ? 2 * radius * Math.tan((angleStep * Math.PI) / 360)
        : width;

    for (let i = 0; i < col; i++) {
        const index = i;
        const angle = i * angleStep;

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

        triangles.push({
            index,
            angle,
            fillColor
        });
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                zIndex: 1
            }}
        >
            <svg
                style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: `${radius * 2}px`,
                    height: `${radius * 2}px`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                }}
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            >
                {triangles.map(({ index, angle, fillColor }) => {
                    // Calculate triangle points radiating from center
                    const centerX = radius;
                    const centerY = radius;

                    // Convert angle to radians
                    const angleRad = (angle * Math.PI) / 180;

                    // Calculate the two base points using the effectiveWidth
                    // Width defines the base width of each triangle
                    const halfWidth = effectiveWidth / 2;

                    // Base points perpendicular to the angle direction at distance radius
                    const x1 = centerX + radius * Math.cos(angleRad) - halfWidth * Math.sin(angleRad);
                    const y1 = centerY + radius * Math.sin(angleRad) + halfWidth * Math.cos(angleRad);
                    const x2 = centerX + radius * Math.cos(angleRad) + halfWidth * Math.sin(angleRad);
                    const y2 = centerY + radius * Math.sin(angleRad) - halfWidth * Math.cos(angleRad);

                    return (
                        <polygon
                            key={index}
                            points={`${centerX},${centerY} ${x1},${y1} ${x2},${y2}`}
                            fill={fillColor}
                            stroke="none"
                            style={{ cursor: 'pointer', pointerEvents: 'all' }}
                            onClick={() => handleShapeClick(index)}
                            onMouseDown={() => handleShapeMouseDown(index)}
                            onMouseUp={() => handleShapeMouseUp()}
                            onMouseLeave={() => handleShapeMouseUp()}
                            onTouchStart={() => handleShapeMouseDown(index)}
                            onTouchEnd={() => handleShapeMouseUp()}
                        />
                    );
                })}
            </svg>
        </div>
    );
};

export default RadiantLayout;
