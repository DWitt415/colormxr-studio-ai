'use client'
import React from 'react';

/**
 * GridLayout - Standard rectangular grid layout for shapes
 * @param {number} row - Number of rows
 * @param {number} col - Number of columns
 * @param {number} width - Width of each shape
 * @param {number} height - Height of each shape
 * @param {number} hSpace - Horizontal spacing
 * @param {number} vSpace - Vertical spacing
 * @param {Array} shapeColors - Array of colors for each shape
 * @param {Array|number|string} selectedShape - Currently selected shape(s)
 * @param {Array|number} activeShape - Currently active (pressed) shape(s)
 * @param {Function} handleShapeClick - Click handler
 * @param {Function} handleShapeMouseDown - Mouse down handler
 * @param {Function} handleShapeMouseUp - Mouse up handler
 */
const GridLayout = ({
    row,
    col,
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

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const index = i * col + j;

            // Determine if this shape is selected
            const isSelected = Array.isArray(selectedShape)
                ? selectedShape.includes(index)
                : selectedShape === index;

            // Get the shape color
            let shapeColor = shapeColors[index];

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

            // Normalize colors for comparison (to add stroke if matching background)
            const normalizeColor = (color) => {
                if (!color) return '#ffffff';
                if (color.startsWith('#')) return color.toLowerCase();
                if (color.startsWith('rgb')) {
                    const rgbValues = color.match(/\d+/g);
                    if (rgbValues && rgbValues.length === 3) {
                        const [r, g, b] = rgbValues.map(Number);
                        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toLowerCase()}`;
                    }
                }
                return color.toLowerCase();
            };

            const normalizedShapeColor = normalizeColor(shapeColor);
            const normalizedBgColor = normalizeColor(backgroundColor);
            const colorMatches = normalizedShapeColor === normalizedBgColor;

            shapes.push(
                <div
                    key={index}
                    className="shape-container"
                    style={{
                        width: `${width}px`,
                        height: `${height}px`,
                        margin: `${vSpace / 2}px ${hSpace / 2}px`,
                        position: 'relative',
                        cursor: 'pointer'
                    }}
                    onClick={() => handleShapeClick(index)}
                    onMouseDown={() => handleShapeMouseDown(index)}
                    onMouseUp={() => handleShapeMouseUp()}
                    onMouseOut={() => handleShapeMouseUp()}
                    onMouseLeave={() => handleShapeMouseUp()}
                    onTouchStart={() => handleShapeMouseDown(index)}
                    onTouchEnd={() => handleShapeMouseUp()}
                >
                    <svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${width} ${height}`}
                        preserveAspectRatio="none"
                        style={{ cursor: 'pointer' }}
                    >
                        <rect
                            x="0"
                            y="0"
                            width="100%"
                            height="100%"
                            fill={fillColor}
                            stroke="none"
                            strokeWidth="0"
                            rx="0"
                            ry="0"
                        />
                    </svg>
                </div>
            );
        }
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${col}, 1fr)`,
            }}
            className="grid gap-[0px]"
        >
            {shapes}
        </div>
    );
};

export default GridLayout;
