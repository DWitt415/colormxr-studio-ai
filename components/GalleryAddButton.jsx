'use client'

import React, { useState } from 'react';
import { storePreviousExercisePath, storeGalleryPath } from '@/utils/navigation';
import supabase from '@/utils/supabase';
import SeriesGalleryAddModal from '@/components/Modals/SeriesGalleryAddModal';

const GalleryAddButton = ({
    shapeColors = [],
    backgroundColor,
    row = 5,
    col = 5,
    layoutMode = 'grid',
    width = 150,
    height = 150,
    hSpace = 0,
    vSpace = 0,
    svgPath,
    svgContent,
    customFilename = null,
    title = "Save to Gallery",
    onSuccess
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState(null);
    
    // Function to handle the initial click
    const handleClick = () => {
        // Open series modal instead of saving directly
        setIsSeriesModalOpen(true);
    };
    
    // Handle series selection
    const handleSeriesSelect = (series) => {
        console.log('Selected series:', series);
        setSelectedSeries(series);
        // Save to gallery with the selected series
        saveToGallery(series);
    };
    
    // Function to save SVG to Supabase
    async function saveToGallery(series = null) {
        if (isSaving) return;

        try {
            setIsSaving(true);

            // Store current path before potentially navigating to gallery
            storePreviousExercisePath();

            // Determine the filename
            let filename;
            if (customFilename) {
                // Use the custom filename from CompositionModal (already includes sequential number if needed)
                filename = customFilename;
            } else {
                // Create timestamp-based filename (for non-composition saves)
                const now = new Date();
                const dateString = now.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\//g, '-');
                const timeString = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
                filename = `colormxr-shapeset-${dateString}-${timeString}`;
            }

            // Generate SVG content
            const generatedSvg = createShapesetSVG();

            // Save to Supabase Storage
            const { data, error } = await supabase
                .storage
                .from('shapeset-gallery')
                .upload(`${filename}.svg`, new Blob([generatedSvg], { type: 'image/svg+xml' }), {
                    contentType: 'image/svg+xml',
                    upsert: false
                });

            if (error) {
                // Check if it's a duplicate file error
                if (error.message && error.message.includes('already exists')) {
                    // Automatically increment filename until we find one that doesn't exist
                    let incrementedFilename = filename;
                    let counter = 1;
                    let uploadSuccessful = false;

                    while (!uploadSuccessful && counter < 100) {
                        incrementedFilename = `${filename}-${counter}`;

                        const { data: retryData, error: retryError } = await supabase
                            .storage
                            .from('shapeset-gallery')
                            .upload(`${incrementedFilename}.svg`, new Blob([generatedSvg], { type: 'image/svg+xml' }), {
                                contentType: 'image/svg+xml',
                                upsert: false
                            });

                        if (!retryError) {
                            uploadSuccessful = true;
                            filename = incrementedFilename; // Update filename for database insert
                            console.log(`✅ Saved as: ${incrementedFilename}.svg`);
                        } else if (retryError.message && retryError.message.includes('already exists')) {
                            counter++;
                        } else {
                            throw retryError;
                        }
                    }

                    if (!uploadSuccessful) {
                        throw new Error('Could not find available filename after 100 attempts');
                    }
                } else {
                    throw error;
                }
            }

            // Use the generated SVG content for database storage
            const svgToSave = generatedSvg;

            // Save metadata to database
            const dbData = {
                filename: `${filename}.svg`,
                shape_colors: shapeColors,
                background_color: backgroundColor,
                svg_content: svgToSave,
                layout_mode: layoutMode,
                grid_rows: row,
                grid_cols: col,
                cell_width: width,
                cell_height: height,
                h_space: hSpace,
                v_space: vSpace,
                svg_path: svgPath || null, // Save SVG path for svg layout mode
                series_id: series?.id || null, // Use the selected series ID if available
                created_at: new Date().toISOString()
            };

            console.log('💾 Saving to database with data:', {
                layoutMode: dbData.layout_mode,
                svgPath: dbData.svg_path,
                filename: dbData.filename,
                shapeColorsLength: dbData.shape_colors?.length
            });

            const { error: dbError } = await supabase
                .from('shapeset_gallery')
                .insert(dbData);
                
            if (dbError) {
                throw dbError;
            }

            // Store the gallery path based on where it was saved
            if (series && series.id) {
                // Saved to a series - store that series path
                storeGalleryPath(`/gallery/series/${series.id}`);
            } else {
                // Saved to singles - store main gallery path
                storeGalleryPath('/gallery');
            }

            // Call success callback if provided
            if (onSuccess) {
                onSuccess();
            }
            
        } catch (error) {
            console.error('Error saving to gallery:', error);
            
            // More detailed error logging
            if (error.message) {
                console.error('Error message:', error.message);
            }
            
            if (error.status) {
                console.error('Error status:', error.status);
            }
            
            if (error.statusCode) {
                console.error('Error status code:', error.statusCode);
            }

            if (error.code) {
                console.error('Error code:', error.code);
            }
            
            // Check Supabase URL and key to ensure they're set
            if (!supabase.supabaseUrl || supabase.supabaseUrl === '') {
                console.error('Supabase URL is not configured correctly!');
            }
            
            if (!supabase.supabaseKey || supabase.supabaseKey === '') {
                console.error('Supabase key is not configured correctly!');
            }
            
            // Alert with more specific information if available
            const errorMessage = error.message 
                ? `There was a problem saving to the gallery: ${error.message}` 
                : 'There was a problem saving to the gallery.';
            
            alert(errorMessage);
        } finally {
            setIsSaving(false);
        }
    }
    
    // Create SVG representation of the shapeset
    const createShapesetSVG = () => {
        // For SVG layout mode, use the provided svgContent if available
        if (layoutMode === 'svg' && svgContent) {
            console.log('📦 Creating SVG for svg layout mode');
            console.log('📦 svgContent length:', svgContent.length);
            console.log('📦 shapeColors:', shapeColors);

            // Parse the SVG to update fill colors with current shapeColors
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
            const svgElement = svgDoc.documentElement;

            // Get the viewBox or dimensions from the original SVG
            const viewBox = svgElement.getAttribute('viewBox');
            const width = svgElement.getAttribute('width') || '1920';
            const height = svgElement.getAttribute('height') || '1080';

            console.log('📦 Original viewBox:', viewBox);
            console.log('📦 Original width/height:', width, height);

            // Find all colorable elements and update their fills
            const colorableElements = svgElement.querySelectorAll('path, rect, circle, ellipse, polygon, polyline');
            console.log('📦 Found', colorableElements.length, 'colorable elements');

            colorableElements.forEach((element, index) => {
                if (index < shapeColors.length && shapeColors[index]) {
                    const oldFill = element.getAttribute('fill');
                    const newFill = formatColor(shapeColors[index]);
                    element.setAttribute('fill', newFill);
                    element.setAttribute('stroke', 'none'); // Remove any stroke
                    console.log(`📦 Shape ${index}: ${oldFill} → ${newFill}`);
                }
            });

            // Ensure the SVG has proper attributes for rendering
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            if (!viewBox) {
                svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
            }
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            // Serialize back to string
            const serializer = new XMLSerializer();
            const result = serializer.serializeToString(svgElement);
            console.log('📦 Final SVG length:', result.length);
            console.log('📦 Final SVG preview:', result.substring(0, 200));

            return result;
        }

        // Set fixed landscape SVG dimensions with 16:9 ratio (Full HD)
        const viewBoxWidth = 1920;
        const viewBoxHeight = 1080;

        // Get background color with fallback
        const bgColor = backgroundColor || 'rgb(255,255,255)';

        // Create SVG header
        let svgString = `<svg width="100%" height="100%" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">`;

        // Add background rectangle
        svgString += `<rect x="0" y="0" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="${bgColor}" />`;

        if (layoutMode === 'grid') {
            // Grid layout - use actual cell dimensions from shapeset
            const cellWidth = width || 150;
            const cellHeight = height || 150;
            const horizontalGap = hSpace || 0;
            const verticalGap = vSpace || 0;

            // Calculate total grid dimensions including gaps
            const totalGridWidth = (col * cellWidth) + ((col - 1) * horizontalGap);
            const totalGridHeight = (row * cellHeight) + ((row - 1) * verticalGap);

            // Center the grid in the canvas
            const gridOffsetX = Math.floor((viewBoxWidth - totalGridWidth) / 2);
            const gridOffsetY = Math.floor((viewBoxHeight - totalGridHeight) / 2);

            svgString += `<g>`;

            for (let i = 0; i < row; i++) {
                for (let j = 0; j < col; j++) {
                    const x = Math.round(gridOffsetX + (j * (cellWidth + horizontalGap)));
                    const y = Math.round(gridOffsetY + (i * (cellHeight + verticalGap)));
                    const shapeNum = i * col + j;

                    let shapeColor = 'rgb(200,200,200)';
                    if (shapeNum < shapeColors.length) {
                        shapeColor = formatColor(shapeColors[shapeNum]);
                    }

                    svgString += `<rect x="${x}" y="${y}" width="${cellWidth}" height="${cellHeight}" fill="${shapeColor}" stroke="none" shape-rendering="crispEdges" />`;
                }
            }

            svgString += `</g>`;

        } else if (layoutMode === 'cosmic') {
            // Cosmic layout - concentric shapes centered
            const centerX = viewBoxWidth / 2;
            const centerY = viewBoxHeight / 2;

            svgString += `<g>`;

            // Render from largest to smallest for proper layering
            for (let i = col - 1; i >= 0; i--) {
                const currentWidth = (width || 100) + i * (hSpace || 40);
                const currentHeight = (height || 100) + i * (vSpace || 40);

                let shapeColor = 'rgb(200,200,200)';
                if (i < shapeColors.length) {
                    shapeColor = formatColor(shapeColors[i]);
                }

                const x = centerX - currentWidth / 2;
                const y = centerY - currentHeight / 2;

                svgString += `<rect x="${x}" y="${y}" width="${currentWidth}" height="${currentHeight}" fill="${shapeColor}" stroke="none" />`;
            }

            svgString += `</g>`;

        } else if (layoutMode === 'radiant') {
            // Radiant layout - triangular sunburst from center using width parameter
            const centerX = viewBoxWidth / 2;
            const centerY = viewBoxHeight / 2;
            const angleStep = 360 / col;
            const radius = Math.max(viewBoxWidth, viewBoxHeight); // Extend to cover entire canvas

            svgString += `<g>`;

            for (let i = 0; i < col; i++) {
                const angle = i * angleStep;

                let shapeColor = 'rgb(200,200,200)';
                if (i < shapeColors.length) {
                    shapeColor = formatColor(shapeColors[i]);
                }

                // Calculate triangle points using width parameter
                const angleRad = (angle * Math.PI) / 180;
                const halfWidth = (width || 150) / 2;

                // Base points perpendicular to the angle direction at distance radius
                const x1 = centerX + radius * Math.cos(angleRad) - halfWidth * Math.sin(angleRad);
                const y1 = centerY + radius * Math.sin(angleRad) + halfWidth * Math.cos(angleRad);
                const x2 = centerX + radius * Math.cos(angleRad) + halfWidth * Math.sin(angleRad);
                const y2 = centerY + radius * Math.sin(angleRad) - halfWidth * Math.cos(angleRad);

                svgString += `<polygon points="${centerX},${centerY} ${x1},${y1} ${x2},${y2}" fill="${shapeColor}" stroke="none" />`;
            }

            svgString += `</g>`;
        }

        // Close SVG tag
        svgString += `</svg>`;

        return svgString;
    };
    
    // Helper function to format color consistently
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

    return (
        <>
            <div className='cursor-pointer' onClick={handleClick} title={title}>
                <img 
                    src="/gallery-add-icon.svg" 
                    alt="Add to Gallery" 
                    className={isSaving ? 'opacity-50' : ''}
                    title={title}
                />
                {isSaving && (
                    <div className="absolute translate-x-2 -translate-y-3">
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>

            {/* Series Selection Modal */}
            <SeriesGalleryAddModal
                isOpen={isSeriesModalOpen}
                closeModal={() => setIsSeriesModalOpen(false)}
                onSelectSeries={handleSeriesSelect}
                type="composition"
            />
        </>
    );
};

export default GalleryAddButton;
