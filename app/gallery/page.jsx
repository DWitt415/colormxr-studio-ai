'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import GalleryFooter from '@/components/GalleryFooter'
import LightboxModal from '@/components/Modals/LightboxModal'
import supabase from '@/utils/supabase'
import { debugSessionStorage, storeLastViewedGallery, storeGalleryPath, GALLERY_TYPES } from '@/utils/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

function GalleryPage() {
    const pathname = usePathname()
    const [galleryItems, setGalleryItems] = useState([])
    const [seriesItems, setSeriesItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [infoItem, setInfoItem] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [draggedItem, setDraggedItem] = useState(null)
    const [dragOverSeries, setDragOverSeries] = useState(null)
    
    // Check session storage when gallery page loads
    useEffect(() => {
        console.log('🏞️ Gallery page loaded');

        // Store that the user is viewing the compositions gallery
        storeLastViewedGallery(GALLERY_TYPES.COMPOSITIONS);

        // Store the gallery path
        storeGalleryPath('/gallery');
        
        // Check if we have direct access (not coming from an exercise page)
        const galleryEnteredFrom = sessionStorage.getItem('galleryEnteredFrom');
        if (!galleryEnteredFrom) {
            console.log('⚠️ Direct gallery access detected - checking for previous exercise paths');
            
            // Since we don't have a stored entry path, we should 
            // make sure we can get back to somewhere useful
            const lastExercisePath = localStorage.getItem('lastExercisePath');
            if (lastExercisePath) {
                console.log('🔄 Found last exercise path in localStorage:', lastExercisePath);
                // We'll use this when returning from gallery
                sessionStorage.setItem('prevExercisePath', lastExercisePath);
            } else {
                try {
                    // Try to get history
                    const history = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
                    if (history.length > 0) {
                        const lastPath = history[history.length - 1];
                        console.log('📚 Using most recent path from history:', lastPath);
                        sessionStorage.setItem('prevExercisePath', lastPath);
                    }
                } catch (e) {
                    console.error('Error checking exercise history:', e);
                }
            }
        }
        
        debugSessionStorage();
    }, [])
    
    
    // Handle opening the lightbox with the selected item
    const openLightbox = (item) => {
        setSelectedItem(item)
        setIsLightboxOpen(true)
    }
    
    // Handle closing the lightbox
    const closeLightbox = () => {
        setIsLightboxOpen(false)
    }
    
    // Navigation in the lightbox
    const goToNextItem = () => {
        if (!selectedItem || galleryItems.length === 0) return;
        
        const currentIndex = galleryItems.findIndex(item => item.id === selectedItem.id);
        if (currentIndex < galleryItems.length - 1) {
            // If not at the last item, go to next item
            setSelectedItem(galleryItems[currentIndex + 1]);
        } else {
            // If at the last item (N), wrap around to the first item (1)
            setSelectedItem(galleryItems[0]);
        }
    }
    
    const goToPreviousItem = () => {
        if (!selectedItem || galleryItems.length === 0) return;
        
        const currentIndex = galleryItems.findIndex(item => item.id === selectedItem.id);
        if (currentIndex > 0) {
            // If not at the first item, go to previous item
            setSelectedItem(galleryItems[currentIndex - 1]);
        } else {
            // If at the first item, wrap around to the last item
            setSelectedItem(galleryItems[galleryItems.length - 1]);
        }
    }
    
    // Check if there are next/previous items
    // With circular navigation, both buttons should be enabled as long as there's more than one item
    const hasNextItem = () => {
        return selectedItem && galleryItems.length > 1;
    }
    
    const hasPreviousItem = () => {
        return selectedItem && galleryItems.length > 1;
    }

    // Handle deleting a gallery item
    const handleDeleteItem = async (e, item) => {
        e.stopPropagation();

        if (isDeleting) return;

        if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
            return;
        }

        const itemId = item.id;
        const itemToDelete = item;

        try {
            setIsDeleting(true);

            console.log(`🗑️ Starting deletion for item ${itemId}...`);

            // 1. Delete from database FIRST (most important)
            console.log("Step 1: Deleting database record...");
            const { error: dbError, data: deleteResult } = await supabase
                .from('shapeset_gallery')
                .delete()
                .eq('id', itemId)
                .select(); // Use select() to verify what was deleted

            if (dbError) {
                console.error("❌ Database deletion failed:", dbError);
                throw new Error(`Database deletion failed: ${dbError.message}`);
            }

            console.log("✅ Database record deleted:", deleteResult);

            // Verify the deletion worked by trying to fetch the item
            const { data: verifyData } = await supabase
                .from('shapeset_gallery')
                .select('id')
                .eq('id', itemId)
                .single();

            if (verifyData) {
                console.error("⚠️ WARNING: Item still exists in database after deletion!");
                throw new Error('Item was not actually deleted from the database. Check RLS policies.');
            } else {
                console.log("✅ Verified: Item no longer exists in database");
            }

            // 2. Delete the storage file
            if (itemToDelete.filename) {
                const baseFilename = itemToDelete.filename.split('?')[0];
                console.log("Step 2: Deleting storage file:", baseFilename);

                const { error: storageError } = await supabase
                    .storage
                    .from('shapeset-gallery')
                    .remove([baseFilename]);

                if (storageError) {
                    console.warn("⚠️ Storage deletion warning:", storageError);
                    // Don't throw - storage deletion is less critical
                } else {
                    console.log("✅ Storage file deleted successfully");
                }
            }

            // 3. Update UI by removing the item
            setGalleryItems(current => current.filter(item => item.id !== itemId));

            console.log(`✅ Deletion completed successfully for item ${itemId}`);

        } catch (error) {
            console.error('❌ Error in delete process:', error);
            alert(`Failed to delete item: ${error.message}\n\nPlease try again.`);
        } finally {
            setIsDeleting(false);
        }
    }
    
    // Function to handle opening a shapeset in the editor
    const handleOpenInEditor = (e, item) => {
        e.stopPropagation();

        console.log('🎨 ===== OPENING ITEM IN COLORMXR (SINGLES) =====');
        console.log('🎨 Full item object:', JSON.stringify(item, null, 2));
        console.log('🎨 Shape colors:', item.shape_colors);
        console.log('🎨 Background color:', item.background_color);
        console.log('🎨 Layout mode:', item.layout_mode);
        console.log('🎨 SVG path:', item.svg_path);
        console.log('🎨 Grid rows:', item.grid_rows);
        console.log('🎨 Grid cols:', item.grid_cols);
        console.log('🎨 Cell width:', item.cell_width, 'Type:', typeof item.cell_width);
        console.log('🎨 Cell height:', item.cell_height, 'Type:', typeof item.cell_height);
        console.log('🎨 H space:', item.h_space, 'Type:', typeof item.h_space);
        console.log('🎨 V space:', item.v_space, 'Type:', typeof item.v_space);

        // Build URL parameters from the item metadata (same logic as series page)
        const params = new URLSearchParams();
        params.append('layoutMode', item.layout_mode || 'grid');

        // For SVG layout mode, add svgPath parameter
        if (item.layout_mode === 'svg' && item.svg_path) {
            params.append('svgPath', item.svg_path);
        } else {
            // For other layouts, add grid parameters
            params.append('row', item.grid_rows || '5');
            params.append('col', item.grid_cols || '5');

            // Add cell dimensions and spacing if available
            if (item.cell_width) params.append('width', item.cell_width);
            if (item.cell_height) params.append('height', item.cell_height);
            if (item.h_space !== undefined && item.h_space !== null) params.append('hSpace', item.h_space);
            if (item.v_space !== undefined && item.v_space !== null) params.append('vSpace', item.v_space);
        }

        console.log('🎨 Navigating to:', `/shapeset-creator?${params.toString()}`);

        // Navigate to shapeset-creator with the item's colors
        // We'll store the item data in localStorage so the editor can load it
        if (typeof window !== 'undefined') {
            const dataToStore = {
                shapeColors: item.shape_colors || [],
                backgroundColor: item.background_color || 'rgb(255,255,255)',
                id: item.id,
                // Store gallery information for footer display
                galleryName: 'Color Compositions',
                compositionTitle: item.filename ? item.filename.replace('.svg', '') : 'Untitled'
            };

            console.log('💾 Storing in localStorage:', dataToStore);
            localStorage.setItem('editingShapeset', JSON.stringify(dataToStore));

            // Store gallery context for footer display
            localStorage.setItem('galleryContext', JSON.stringify({
                galleryName: 'Color Compositions',
                compositionTitle: item.filename ? item.filename.replace('.svg', '') : 'Untitled'
            }));
            console.log('📍 Stored gallery context for footer');

            // Verify it was stored
            const stored = localStorage.getItem('editingShapeset');
            console.log('✅ Verified stored data:', stored);

            window.location.href = `/shapeset-creator?${params.toString()}`;
        }
    };

    // Handle drag start for composition items
    const handleDragStart = (e, item) => {
        console.log('🎯 Drag started for item:', item.id);
        setDraggedItem(item);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
    };

    // Handle drag end
    const handleDragEnd = (e) => {
        console.log('🎯 Drag ended');
        setDraggedItem(null);
        setDragOverSeries(null);
    };

    // Handle drag over series thumbnail
    const handleDragOverSeries = (e, series) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOverSeries(series.id);
    };

    // Handle drag leave series thumbnail
    const handleDragLeaveSeries = (e, series) => {
        e.preventDefault();
        setDragOverSeries(null);
    };

    // Handle drop on series thumbnail
    const handleDropOnSeries = async (e, series) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedItem) {
            console.warn('No dragged item found');
            return;
        }

        console.log(`📦 Dropping item ${draggedItem.id} into series ${series.id} (${series.name})`);

        try {
            // Update the composition to add it to the series
            const { data: updateData, error: updateError } = await supabase
                .from('shapeset_gallery')
                .update({ series_id: series.id })
                .eq('id', draggedItem.id)
                .select();

            if (updateError) {
                throw updateError;
            }

            console.log(`✅ Successfully moved item ${draggedItem.id} to series ${series.name}`);
            console.log('Update result:', updateData);

            // Verify the update by fetching the item
            const { data: verifyData, error: verifyError } = await supabase
                .from('shapeset_gallery')
                .select('id, series_id')
                .eq('id', draggedItem.id)
                .single();

            if (verifyError) {
                console.error('❌ Error verifying update:', verifyError);
            } else {
                console.log('✅ Verified item after update:', verifyData);
            }

            // Refresh the gallery data to show the updated state
            console.log('🔄 Refreshing gallery data...');
            await fetchAllGalleryData();
            console.log('✅ Gallery data refreshed');

        } catch (error) {
            console.error('❌ Error moving item to series:', error);
            alert(`Failed to move item to series: ${error.message}`);
        } finally {
            setDraggedItem(null);
            setDragOverSeries(null);
        }
    };

    // Function to handle deleting a series
    const handleDeleteSeries = async (e, series) => {
        e.stopPropagation();
        e.preventDefault();

        if (isDeleting) return;

        const confirmed = confirm(`Are you sure you want to delete the series "${series.name}" and all compositions within it? This action cannot be undone.`);
        if (!confirmed) return;

        try {
            setIsDeleting(true);

            console.log(`🗑️ Starting deletion of series "${series.name}" (ID: ${series.id})...`);

            // 1. Get all items in the series
            const { data: seriesItems, error: fetchError } = await supabase
                .from('shapeset_gallery')
                .select('*')
                .eq('series_id', series.id);

            if (fetchError) {
                throw new Error(`Failed to fetch series items: ${fetchError.message}`);
            }

            // 2. Delete all compositions in the series
            if (seriesItems && seriesItems.length > 0) {
                console.log(`Step 1: Deleting ${seriesItems.length} items from series...`);

                // Delete storage files
                const filenames = seriesItems
                    .map(item => item.filename)
                    .filter(filename => filename);

                if (filenames.length > 0) {
                    const { error: storageError } = await supabase
                        .storage
                        .from('shapeset-gallery')
                        .remove(filenames);

                    if (storageError) {
                        console.warn('⚠️ Storage deletion warning:', storageError);
                    } else {
                        console.log(`✅ Deleted ${filenames.length} storage files`);
                    }
                }

                // Delete all database records for items in the series
                const { error: deleteItemsError } = await supabase
                    .from('shapeset_gallery')
                    .delete()
                    .eq('series_id', series.id);

                if (deleteItemsError) {
                    throw new Error(`Failed to delete series items: ${deleteItemsError.message}`);
                }

                console.log(`✅ Deleted ${seriesItems.length} items from database`);
            }

            // 3. Delete the series itself
            console.log('Step 2: Deleting series record...');
            const { error: seriesError } = await supabase
                .from('series_gallery')
                .delete()
                .eq('id', series.id);

            if (seriesError) {
                throw new Error(`Failed to delete series: ${seriesError.message}`);
            }

            console.log(`✅ Series "${series.name}" deleted successfully`);

            // 4. Update the UI
            setSeriesItems(current => current.filter(item => item.id !== series.id));

            // Refresh individual items in case any were moved out of the series
            fetchIndividualItems();

        } catch (error) {
            console.error('❌ Error deleting series:', error);
            alert(`Failed to delete series: ${error.message}\n\nPlease try again.`);
        } finally {
            setIsDeleting(false);
        }
    }

    // Info overlay was removed
    // We'll keep the state for potential future use but don't need the click listener
    useEffect(() => {
        // Clear any existing info items when component mounts
        setInfoItem(null);
    }, []);

    // Function to generate a fallback SVG thumbnail from shape_colors
    const generateFallbackThumbnail = (shapeColors, backgroundColor) => {
        try {
            // Default colors if needed
            backgroundColor = backgroundColor || '#FFFFFF';
            
            // Make sure we have an array of colors
            if (!Array.isArray(shapeColors) || shapeColors.length === 0) {
                return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${backgroundColor}" /></svg>`)}`;
            }
            
            // Create a simple grid SVG with the first few colors
            const size = 100;
            const cellSize = 30;
            const padding = 5;
            
            let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <rect width="${size}" height="${size}" fill="${backgroundColor}" />`;
            
            // Add up to 4 color squares in a grid
            const maxColors = Math.min(4, shapeColors.length);
            for (let i = 0; i < maxColors; i++) {
                const row = Math.floor(i / 2);
                const col = i % 2;
                const x = padding + col * (cellSize + padding);
                const y = padding + row * (cellSize + padding);
                
                svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${shapeColors[i]}" />`;
            }
            
            svgContent += '</svg>';
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
            
        } catch (err) {
            console.error('Error generating fallback thumbnail:', err);
            return null;
        }
    };
    
    // Function to fetch both series and individual gallery items
    const fetchAllGalleryData = async () => {
        try {
            setLoading(true);
            
            // Fetch series data first
            await fetchSeriesData();
            
            // Then fetch individual items data
            await fetchIndividualItems();
            
            setError(null);
        } catch (err) {
            console.error('Error fetching gallery data:', err);
            setError(`Failed to load gallery: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // Function to fetch series data
    const fetchSeriesData = async () => {
        try {
            console.log("🔍 Fetching composition series data...");

            // Get all series of type 'composition'
            const { data: seriesData, error: seriesError } = await supabase
                .from('series_gallery')
                .select(`
                    *,
                    shapeset_gallery!inner(*)
                `)
                .eq('type', 'composition')
                .order('created_at', { ascending: false });
                
            if (seriesError) {
                throw seriesError;
            }
            
            if (!seriesData || seriesData.length === 0) {
                console.log("No series found");
                setSeriesItems([]);
                return;
            }

            console.log(`📦 Found ${seriesData.length} series:`);
            seriesData.forEach(s => console.log(`  - ${s.name} (ID: ${s.id})`));

            // Process each series to add thumbnail URL
            const processedSeries = await Promise.all(seriesData.map(async (series) => {
                // Get all items in the series
                const activeItems = series.shapeset_gallery

                // Find the thumbnail item (either specified by thumbnail_id or pick the first active item)
                const thumbnailItem = activeItems.find(item => item.id === series.thumbnail_id) ||
                                      activeItems[0];

                if (!thumbnailItem) {
                    return {
                        ...series,
                        thumbnailUrl: null,
                        itemCount: activeItems.length
                    };
                }

                // Use SVG content directly or get from storage
                let thumbnailUrl;
                if (thumbnailItem.svg_content) {
                    thumbnailUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(thumbnailItem.svg_content)}`;
                } else {
                    const { data: urlData } = await supabase
                        .storage
                        .from('shapeset-gallery')
                        .getPublicUrl(thumbnailItem.filename);

                    thumbnailUrl = urlData.publicUrl;
                }

                return {
                    ...series,
                    thumbnailUrl,
                    thumbnailColors: thumbnailItem.shape_colors,
                    thumbnailBackground: thumbnailItem.background_color,
                    itemCount: activeItems.length
                };
            }));
            
            setSeriesItems(processedSeries);
            console.log("Series data processed successfully");
            
        } catch (err) {
            console.error("Error fetching series:", err);
            throw err;
        }
    };
    
    // Function to fetch individual items (not in a series)
    const fetchIndividualItems = async () => {
        try {
            console.log("Fetching individual gallery items...");
            
            // Get items that are not part of any series
            console.log('🔄 Fetching individual gallery items from database...');
            const { data, error } = await supabase
                .from('shapeset_gallery')
                .select('*')
                .is('series_id', null)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching gallery data:", error);
                throw error;
            }

            console.log(`📊 Fetched ${data?.length || 0} individual gallery items from database:`);
            if (data && data.length > 0) {
                console.log('Item IDs:', data.map(item => item.id).join(', '));
            }
            
            if (!data || data.length === 0) {
                console.log("No individual gallery items found");
                setGalleryItems([]);
                return;
            }
            
            // Add timestamp to prevent browser caching of SVG URLs
            const timestamp = Date.now();
            console.log("Adding URLs to items with timestamp:", timestamp);
            
            // Get URLs for each gallery item
            const itemsWithUrls = await Promise.all(data.map(async (item) => {
                // Handle case where filename might be null or undefined
                if (!item.filename) {
                    console.warn(`Item ${item.id} has no filename`);
                    return { ...item, url: null };
                }
                
                // If we have svg_content stored directly, use that
                if (item.svg_content) {
                    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg_content)}`;
                    return {
                        ...item,
                        url: url
                    };
                }
                
                // Otherwise fall back to storage URL
                const { data: urlData } = await supabase
                    .storage
                    .from('shapeset-gallery')
                    .getPublicUrl(`${item.filename}?t=${timestamp}`);
                    
                return {
                    ...item,
                    url: urlData.publicUrl
                };
            }));
            
            console.log(`Processed ${itemsWithUrls.length} items with URLs`);

            setGalleryItems(itemsWithUrls);
        } catch (err) {
            console.error('Error fetching individual items:', err);
            throw err;
            setGalleryItems([]); // Clear items on error
        } finally {
            setLoading(false);
        }
    };
    
    // Fetch gallery data on mount and when returning to this page
    useEffect(() => {
        console.log('📍 Pathname changed to:', pathname);
        if (pathname === '/gallery') {
            console.log('🔄 Refetching gallery data due to pathname change...');
            fetchAllGalleryData();
        }
    }, [pathname]);

    // Also refetch when page visibility changes
    useEffect(() => {
        // Add a visibility change listener to refetch when user returns to the page
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                console.log('Page became visible, refetching gallery data...');
                fetchAllGalleryData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup listener on unmount
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [])

    return (
        <div style={{ backgroundColor: "#4B4B4B" }}>
            <Header />
            
            <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 text-white">
                {/* Header navigation removed */}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {/* Series Section */}
                {!loading && seriesItems.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-[20px] font-normal mb-4">Series</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8 gap-4">
                            {seriesItems.map((series) => (
                                <Link
                                    href={`/gallery/series/${series.id}`}
                                    key={series.id}
                                    className="block"
                                    onDragOver={(e) => handleDragOverSeries(e, series)}
                                    onDragLeave={(e) => handleDragLeaveSeries(e, series)}
                                    onDrop={(e) => handleDropOnSeries(e, series)}
                                >
                                    <div
                                        className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-pointer"
                                        style={{
                                            opacity: dragOverSeries === series.id ? 0.5 : 1,
                                            transition: 'opacity 0.2s'
                                        }}
                                    >
                                        <div
                                            className="h-24 relative"
                                            style={{
                                                backgroundColor: series.thumbnailBackground || '#f3f4f6'
                                            }}
                                        >
                                            {series.thumbnailUrl ? (
                                                <img 
                                                    src={series.thumbnailUrl}
                                                    alt={series.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => {
                                                        console.log(`Using fallback for series thumbnail: ${series.id}`);
                                                        // Generate a fallback thumbnail
                                                        const fallbackSrc = generateFallbackThumbnail(series.thumbnailColors, series.thumbnailBackground);
                                                        if (fallbackSrc) {
                                                            e.target.src = fallbackSrc;
                                                        } else {
                                                            e.target.style.opacity = "0";
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-700">
                                                    <span className="text-gray-400">No thumbnail</span>
                                                </div>
                                            )}
                                            
                                            {/* Delete button (top right) */}
                                            <div 
                                                className="absolute top-2 right-2 bg-white/50 rounded-full p-2 opacity-0 hover:opacity-100 hover:bg-white/70 cursor-pointer"
                                                onClick={(e) => handleDeleteSeries(e, series)}
                                                title="Delete series"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </div>
                                            
                                            {/* Item count badge */}
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                                                {series.itemCount} {series.itemCount === 1 ? 'item' : 'items'}
                                            </div>
                                        </div>
                                        <div className="px-4 py-2">
                                            <h3 className="font-medium text-white truncate" style={{ fontSize: '16px' }}>{series.name}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(series.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Individual Items Section */}
                {!loading && (
                    <div>
                        <h2 className="text-[20px] font-normal mb-4">Singles</h2>
                        
                        {!error && galleryItems.length === 0 && !loading && seriesItems.length === 0 && (
                            <div className="text-center text-gray-200 py-12">
                                <p className="text-xl">No gallery items found</p>
                                <p className="mt-2">Save some shapesets to see them here!</p>
                            </div>
                        )}
                        
                        {!error && galleryItems.length === 0 && !loading && seriesItems.length > 0 && (
                            <div className="text-center text-gray-300 py-6">
                                <p>All compositions are in series</p>
                            </div>
                        )}
                        
                        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
                            {galleryItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all cursor-move h-20 animate-fadeIn"
                                    style={{
                                        animationDelay: `${index * 30}ms`,
                                        opacity: draggedItem?.id === item.id ? 0.5 : (draggedItem ? 1 : 0),
                                        animationFillMode: 'forwards'
                                    }}
                                    draggable="true"
                                    onDragStart={(e) => handleDragStart(e, item)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => openLightbox(item)}
                                    title={item.filename}
                                >
                                    <div 
                                        className="p-1 shapeset-thumbnail relative group h-full"
                                        style={{ 
                                            backgroundColor: item.background_color || '#f3f4f6' 
                                        }}
                                    >
                                        {/* Try to use SVG content directly if available, fall back to URL if not */}
                                        {item.svg_content ? (
                                            <img 
                                                src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg_content)}`}
                                                alt={`Shapeset ${item.filename || ''}`}
                                                className="shapeset-img"
                                                key={`svg-${item.id}-${Date.now()}`}
                                                onError={(e) => {
                                                    console.log(`Using fallback for ${item.filename}`);
                                                    // Generate a fallback thumbnail from colors
                                                    const fallbackSrc = generateFallbackThumbnail(item.shape_colors, item.background_color);
                                                    if (fallbackSrc) {
                                                        e.target.src = fallbackSrc;
                                                    } else {
                                                        e.target.style.opacity = "0";
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <img 
                                                src={`${item.url}${item.url.includes('?') ? '&' : '?'}v=${Date.now()}`}
                                                alt={`Shapeset ${item.filename || ''}`}
                                                className="shapeset-img"
                                                key={`svg-${item.id}-${Date.now()}`}
                                                onError={(e) => {
                                                    console.log(`Using fallback for ${item.filename}`);
                                                    // Generate a fallback thumbnail from colors
                                                    const fallbackSrc = generateFallbackThumbnail(item.shape_colors, item.background_color);
                                                    if (fallbackSrc) {
                                                        e.target.src = fallbackSrc;
                                                    } else {
                                                        e.target.style.opacity = "0";
                                                    }
                                                }}
                                            />
                                        )}
                                        
                                        {/* Overlay with view icon on hover */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                            {/* View icon */}
                                            <div
                                                className="bg-white/50 rounded-full p-1.5 hover:bg-white/70 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openLightbox(item);
                                                }}
                                                title="View"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </div>

                                            {/* Open in Colormxr icon */}
                                            <div
                                                className="bg-white/50 rounded-full p-1.5 hover:bg-white/70 cursor-pointer"
                                                onClick={(e) => handleOpenInEditor(e, item)}
                                                title="Open in Colormxr"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </div>

                                            {/* Delete icon (bottom right) */}
                                            <div
                                                className="bg-red-500/70 rounded-full p-1.5 hover:bg-red-600/80 cursor-pointer"
                                                onClick={(e) => handleDeleteItem(e, item)}
                                                title="Delete"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            
            <GalleryFooter title="Gallery" />
            
            {/* Lightbox Modal with navigation */}
            <LightboxModal
                isOpen={isLightboxOpen}
                closeModal={closeLightbox}
                item={selectedItem}
                onNext={goToNextItem}
                onPrevious={goToPreviousItem}
                hasNext={hasNextItem()}
                hasPrevious={hasPreviousItem()}
            />
        </div>
    )
}

export default GalleryPage
