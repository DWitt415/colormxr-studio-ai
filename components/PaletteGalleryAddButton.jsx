'use client'

import React, { useState } from 'react';
import { storePreviousExercisePath } from '@/utils/navigation';
import supabase from '@/utils/supabase';
import SaveSuccessModal from '@/components/Modals/SaveSuccessModal';

const PaletteGalleryAddButton = ({ colors = [], backgroundColor = 'rgb(255,255,255)', title = "Save Palette to Gallery" }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isSaveSuccessOpen, setIsSaveSuccessOpen] = useState(false);
    const [savedFilename, setSavedFilename] = useState('');
    // Series state variables removed as they're no longer needed
    const [selectedSeries, setSelectedSeries] = useState(null);
    
    function saveSuccessModalClose() {
        setIsSaveSuccessOpen(false);
    }
    
    // Function to handle the initial click
    const handleClick = () => {
        // Save directly without showing series modal
        savePaletteToGallery(null);
    };
    
    // Handle series selection (keeping for potential future use)
    const handleSeriesSelect = (series) => {
        console.log('Selected series:', series);
        setSelectedSeries(series);
        // Save to gallery with the selected series
        savePaletteToGallery(series);
    };
    
    // Generate palette image as SVG (better quality than PNG)
    const generatePaletteSVG = () => {
        // Set size values
        const squareSize = 140; // 40% larger than original 100px
        const squareHeight = 120; // 20% taller than original 100px
        const padding = 25; // padding on each side
        const gap = 14; // gap increased proportionally
        
        const svgWidth = (5 * squareSize) + (4 * gap) + (padding * 2); // 40% longer
        const svgHeight = squareHeight + (padding * 2); // 20% taller
        
        // Make sure we have exactly 5 colors for display
        let displayColors = [...colors];
        
        // If we have fewer than 5 colors, add default colors
        if (displayColors.length < 5) {
            const defaultColors = ["#D9D9D9", "#A7A7A7", "#949494", "#5B5B5B", "#3B3B3B"];
            for (let i = displayColors.length; i < 5; i++) {
                displayColors.push(defaultColors[i]);
            }
        }
        
        // If we have more than 5 colors, trim the array
        if (displayColors.length > 5) {
            displayColors.length = 5;
        }
        
        // Format all colors to hex
        displayColors = displayColors.map(formatColor);
        
        // Build SVG content
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
        <!-- Palette from Colormxr -->
        
        <!-- Background -->
        <rect width="${svgWidth}" height="${svgHeight}" fill="${backgroundColor}" />
        
        <!-- Color squares -->`;
        
        // Add each color square
        for (let i = 0; i < 5; i++) {
            const x = padding + (i * (squareSize + gap));
            const y = padding;
            svgContent += `
        <rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${displayColors[i]}" />`;
        }
        
        // Close SVG
        svgContent += `
</svg>`;
        
        return svgContent;
    };
    
    // Legacy function to generate PNG (keeping for backwards compatibility)
    const generatePaletteImage = async () => {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size - 5 squares plus padding
        const squareSize = 100;
        const padding = 25; // padding on each side
        const gap = 10; // gap between squares
        
        canvas.width = (5 * squareSize) + (4 * gap) + (padding * 2);
        canvas.height = squareSize + (padding * 2);
        
        // Draw background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Make sure we have exactly 5 colors for display
        let displayColors = [...colors];
        
        // If we have fewer than 5 colors, add default colors
        if (displayColors.length < 5) {
            const defaultColors = ["#D9D9D9", "#A7A7A7", "#949494", "#5B5B5B", "#3B3B3B"];
            for (let i = displayColors.length; i < 5; i++) {
                displayColors.push(defaultColors[i]);
            }
        }
        
        // If we have more than 5 colors, trim the array
        if (displayColors.length > 5) {
            displayColors.length = 5;
        }
        
        // Format all colors to hex
        displayColors = displayColors.map(formatColor);
        
        // Draw each color square
        for (let i = 0; i < 5; i++) {
            const x = padding + (i * (squareSize + gap));
            const y = padding;
            
            ctx.fillStyle = displayColors[i];
            ctx.fillRect(x, y, squareSize, squareSize);
        }
        
        return canvas;
    };
    
    // Function to save palette to Supabase
    async function savePaletteToGallery(series = null) {
        if (isSaving) return;
        
        try {
            setIsSaving(true);
            
            // Store current path before potentially navigating to gallery
            storePreviousExercisePath();
            
            // Create timestamp for filename
            const now = new Date();
            const dateString = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            }).replace(/\//g, '-');
            const timeString = `${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
            const filename = `colormxr-palette-${dateString}-${timeString}`;
            
            // Convert RGB colors to HEX for consistency
            const formattedColors = colors.map(formatColor);
            
            // Generate SVG content for better quality
            const svgContent = generatePaletteSVG();
            
            // Create SVG blob
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            
            // Variable to hold our final image URL
            let finalImageUrl = '';
            let useLocalFallback = false;
            
            try {
                // Check if the bucket exists by listing files (will fail if bucket doesn't exist)
                const { data: bucketCheck, error: bucketError } = await supabase
                    .storage
                    .from('palette-gallery')
                    .list('', { limit: 1 });
                    
                if (bucketError) {
                    console.error('Error checking palette-gallery bucket:', bucketError);
                    throw new Error('Bucket not found - please visit /supabase-diagnostic to set up the required storage buckets.');
                }
                
                // Upload the SVG to Supabase storage
                console.log("Starting SVG upload to Supabase:", `${filename}.svg`);
                console.log("SVG content sample:", svgContent.substring(0, 200) + "...");
                
                const { data: uploadData, error: storageError } = await supabase
                    .storage
                    .from('palette-gallery')
                    .upload(`${filename}.svg`, blob, {
                        contentType: 'image/svg+xml',
                        upsert: false
                    });
                    
                console.log("Upload response:", uploadData);
                    
                if (storageError) {
                    console.error('Storage upload error details:', storageError);
                    throw new Error(`Failed to upload to storage. Details: ${storageError.message || JSON.stringify(storageError)}`);
                }
                
                console.log("SVG upload successful");
                
                // Get the public URL for the uploaded SVG
                console.log("Getting public URL for:", `${filename}.svg`);
                const { data: publicUrlData } = supabase
                    .storage
                    .from('palette-gallery')
                    .getPublicUrl(`${filename}.svg`);
                
                console.log("Public URL data:", publicUrlData);
                finalImageUrl = publicUrlData?.publicUrl || '';
                console.log("Final image URL:", finalImageUrl);
            } catch (storageError) {
                console.error('Storage operation failed:', storageError);
                
                if (storageError.message && storageError.message.includes('security')) {
                    throw new Error(`RLS Policy Error: You need to configure proper row-level security policies in Supabase. Visit /supabase-diagnostic for help.`);
                }
                
                // Create a data URI from SVG content as fallback if storage fails
                finalImageUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
                useLocalFallback = true;
                
                // Show helpful message to the user
                alert(`Storage error: ${storageError.message}. Using local image as fallback.\n\nPlease visit /supabase-diagnostic to configure your storage buckets.`);
            }
            
            // Try to save to the database
            try {
                // Note: For database tables, use the underscore version (palette_gallery)
                // For storage buckets, use the hyphen version (palette-gallery)
                const { data: dbData, error: dbError } = await supabase
                    .from('palette_gallery')  // Database table uses underscore
                    .insert({
                        filename: `${filename}.svg`,
                        url: finalImageUrl,  // Use our final URL (either from storage or local)
                        palette_colors: formattedColors,
                        background_color: formatColor(backgroundColor),
                        series_id: series?.id || null, // Use the selected series ID if available
                        created_at: new Date().toISOString()
                    })
                    .select();  // Return the inserted data
                    
                if (dbError) {
                    console.error('Database insert error details:', dbError);
                    throw new Error(`Failed to save to database. Details: ${dbError.message || JSON.stringify(dbError)}`);
                }
                
                console.log('Palette successfully saved:', dbData);
                
                // If DB save works, show success
                setSavedFilename(`${filename}.svg`);
                setIsSaveSuccessOpen(true);
            } catch (dbError) {
                console.error('Database operation failed:', dbError);
                
                if (dbError.message && dbError.message.includes('security policy')) {
                    // This is an RLS policy error
                    alert('Row-Level Security Policy Error: You need to configure proper RLS policies in Supabase.\n\nPlease visit /supabase-diagnostic for detailed instructions.');
                    console.error('RLS POLICY ERROR: Please check /utils/rls-policy-guide.md for instructions');
                } else if (useLocalFallback) {
                    // If we're already in fallback mode, still show success with local image
                    alert('Storage bucket is missing, but your palette has been rendered locally.');
                    setSavedFilename(`${filename}.svg (local only)`);
                    setIsSaveSuccessOpen(true);
                } else {
                    throw new Error(`Database error: ${dbError.message}`);
                }
            }
            
        } catch (error) {
            console.error('Error saving palette to gallery:', error);
            
            // More detailed error logging to help diagnose the issue
            if (error && error.message) {
                console.error('Error message:', error.message);
            }
            
            if (error && error.details) {
                console.error('Error details:', error.details);
            }
            
            // Check if Supabase URL and key are properly set
            if (!supabase.supabaseUrl || supabase.supabaseUrl === '') {
                console.error('Supabase URL is not configured correctly');
            }
            
            if (!supabase.supabaseKey || supabase.supabaseKey === '') {
                console.error('Supabase key is not configured correctly');
            }
            
            alert('There was a problem saving to the palette gallery. Check the console for more details.');
        } finally {
            setIsSaving(false);
        }
    }
    
    // Helper function to format color consistently
    const formatColor = (color) => {
        if (!color) return '#CCCCCC';
        
        try {
            // If it's an RGB color
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

    return (
        <>
                            <button
                    type="button"
                    onClick={handleClick}
                    disabled={isSaving}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                    style={{ fontSize: '16px', fontWeight: 'normal' }}
                >
                {isSaving ? 'Saving...' : 'Save to Gallery'}
                {isSaving && (
                    <span className="ml-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></div>
                    </span>
                )}
            </button>
            
            {/* Success Modal - Toast Style */}
            <SaveSuccessModal 
                key="palette-gallery-add-success-toast"
                isOpen={isSaveSuccessOpen} 
                closeModal={saveSuccessModalClose}
                filename={savedFilename} 
            />
            
            {/* Series Modal removed to avoid "save to series" dialog */}
        </>
    );
};

export default PaletteGalleryAddButton;
