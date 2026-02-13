'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import GalleryFooter from '@/components/GalleryFooter'
import LightboxModal from '@/components/Modals/LightboxModal'
import supabase from '@/utils/supabase'
import { debugSessionStorage, storeLastViewedGallery, storeGalleryPath, GALLERY_TYPES } from '@/utils/navigation'
import Link from 'next/link'

function PaletteGalleryPage() {
    const [galleryItems, setGalleryItems] = useState([])
    const [seriesItems, setSeriesItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedItem, setSelectedItem] = useState(null)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    
    // Check session storage when gallery page loads
    useEffect(() => {
        //console.log('🎨 Palette Gallery page loaded');

        // Store that the user is viewing the palettes gallery
        storeLastViewedGallery(GALLERY_TYPES.PALETTES);

        // Store the gallery path
        storeGalleryPath('/palette-gallery');
        
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
    
    // Track deleted items in local storage to ensure they stay deleted
    const [deletedIds, setDeletedIds] = useState([])
    
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
        
        const itemId = item.id;
        const itemToDelete = item;
        
        try {
            setIsDeleting(true);
            
            // 1. First, add to deletedIds and update localStorage - this ensures the item stays hidden
            //    even if the server-side deletion temporarily fails
            const newDeletedIds = [...deletedIds, itemId];
            setDeletedIds(newDeletedIds);
            
            // Update localStorage to persist deleted IDs
            if (typeof window !== 'undefined') {
                localStorage.setItem('colormxr_deleted_palette_items', JSON.stringify(newDeletedIds));
                console.log(`Added item ${itemId} to deleted items in localStorage`);
            }
            
            // 2. Immediately update UI by removing the item
            setGalleryItems(current => current.filter(item => item.id !== itemId));
            
            // Extract the base filename without any query parameters
            const baseFilename = itemToDelete.filename.split('?')[0];
            
            console.log(`Deleting item with ID ${itemId} and filename ${baseFilename}`);
            
            // 3. Try multiple deletion methods to ensure it works
            
            // Method 1: Direct deletion via API
            try {
                console.log("Method 1: Deleting database record...");
                const { error: dbError } = await supabase
                    .from('palette_gallery')
                    .delete()
                    .eq('id', itemId);
                    
                if (dbError) {
                    console.warn("Method 1 DB deletion warning:", dbError);
                    // Continue with other methods
                } else {
                    console.log("Method 1: Database record deleted successfully");
                }
            } catch (err) {
                console.warn("Method 1 deletion error:", err);
                // Continue with other methods
            }
            
            // Method 2: Delete the storage file (try both approaches)
            try {
                console.log("Method 2: Deleting storage file...");
                const { error: storageError } = await supabase
                    .storage
                    .from('palette-gallery')  // Use correct bucket name with hyphens
                    .remove([baseFilename]);
                    
                if (storageError) {
                    console.warn("Storage deletion warning:", storageError);
                } else {
                    console.log("Method 2: Storage file deleted successfully");
                }
            } catch (err) {
                console.warn("Method 2 deletion error:", err);
            }
            
            console.log(`Deletion process completed for item ${itemId}`);
            
        } catch (error) {
            console.error('Error in delete process:', error);
            
            // Even if there's an error, we've already added it to deletedIds,
            // so the item will still be filtered out in the UI
            alert(`Note: The item has been removed from your gallery view.`);
        } finally {
            setIsDeleting(false);
        }
    }
    
    // Function to handle deleting a series
    const handleDeleteSeries = async (e, series) => {
        e.stopPropagation();
        e.preventDefault();
        
        if (isDeleting) return;
        
        const confirmed = confirm(`Are you sure you want to delete the series "${series.name}"? This will NOT delete the individual palettes within the series.`);
        if (!confirmed) return;
        
        try {
            setIsDeleting(true);
            
            // Delete the series from the database
            const { error } = await supabase
                .from('series_gallery')
                .delete()
                .eq('id', series.id);
                
            if (error) throw error;
            
            // Update the UI by removing the deleted series
            setSeriesItems(current => current.filter(item => item.id !== series.id));
            
            // Refresh the gallery items to reflect that they are no longer part of a series
            fetchIndividualItems();
            
        } catch (error) {
            console.error('Error deleting series:', error);
            alert(`Failed to delete series: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    }

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
            console.log("Fetching palette series data...");
            
            // Get all series of type 'palette'
            const { data: seriesData, error: seriesError } = await supabase
                .from('series_gallery')
                .select(`
                    *,
                    palette_gallery!inner(*)
                `)
                .eq('type', 'palette')
                .order('created_at', { ascending: false });
                
            if (seriesError) {
                throw seriesError;
            }
            
            if (!seriesData || seriesData.length === 0) {
                console.log("No palette series found");
                setSeriesItems([]);
                return;
            }
            
            console.log(`Found ${seriesData.length} palette series`);
            
            // Process each series to add thumbnail URL
            const processedSeries = await Promise.all(seriesData.map(async (series) => {
                // Find the thumbnail item (either specified by thumbnail_id or pick the first item)
                const thumbnailItem = series.palette_gallery.find(item => item.id === series.thumbnail_id) || 
                                      series.palette_gallery[0];
                
                if (!thumbnailItem) {
                    return {
                        ...series,
                        thumbnailUrl: null,
                        itemCount: series.palette_gallery.length
                    };
                }
                
                // Get URL for thumbnail
                const timestamp = Date.now();
                const { data: urlData } = await supabase
                    .storage
                    .from('palette-gallery')
                    .getPublicUrl(`${thumbnailItem.filename}?t=${timestamp}`);
                    
                return {
                    ...series,
                    thumbnailUrl: urlData?.publicUrl,
                    thumbnailColors: thumbnailItem.palette_colors,
                    thumbnailBackground: thumbnailItem.background_color,
                    itemCount: series.palette_gallery.length
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
            console.log("Fetching individual palette gallery items...");
            
            // Get items that are not part of any series
            const { data, error } = await supabase
                .from('palette_gallery')
                .select('*')
                .is('series_id', null)
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error("Error fetching palette gallery data:", error);
                throw error;
            }
            
            console.log(`Fetched ${data?.length || 0} individual palette gallery items`);
            
            if (!data || data.length === 0) {
                console.log("No individual palette gallery items found");
                setGalleryItems([]);
                return;
            }
            
            // Add timestamp to prevent browser caching of image URLs
            const timestamp = Date.now();
            console.log("Adding URLs to items with timestamp:", timestamp);
            
            // Get URLs for each gallery item
            const itemsWithUrls = await Promise.all(data.map(async (item) => {
                // Handle case where filename might be null or undefined
                if (!item.filename) {
                    console.warn(`Item ${item.id} has no filename`);
                    return { ...item, url: null };
                }
                
                console.log(`Getting public URL for item: ${item.id}, filename: ${item.filename}`);
                
                try {
                    // Always use the correct bucket name with hyphens
                    const { data: urlData } = await supabase
                        .storage
                        .from('palette-gallery')  // Always use dash format
                        .getPublicUrl(`${item.filename}?t=${timestamp}`);
                    
                    console.log(`URL from palette-gallery: ${urlData?.publicUrl || 'not found'}`);
                    
                    // Use the URL data we have from the query
                    if (urlData?.publicUrl) {
                        console.log(`Using URL from palette-gallery: ${urlData.publicUrl}`);
                        return {
                            ...item,
                            url: urlData.publicUrl
                        };
                    } else {
                        console.log(`No valid URL found for item ${item.id} with filename ${item.filename}`);
                        return {
                            ...item,
                            url: '' // Empty URL will trigger error handling in the UI
                        };
                    };
                } catch (error) {
                    console.error(`Error getting URL for item ${item.id}:`, error);
                    return {
                        ...item,
                        url: ''
                    };
                }
            }));
            
            console.log(`Processed ${itemsWithUrls.length} items with URLs`);
            
            // Filter out any items that are in the deletedIds list
            const filteredItems = itemsWithUrls.filter(item => !deletedIds.includes(item.id));
            console.log(`Filtered out ${itemsWithUrls.length - filteredItems.length} deleted items`);
            
            setGalleryItems(filteredItems);
        } catch (err) {
            console.error('Error fetching palette gallery items:', err);
            throw err;
        }
    };
    
    // Load deleted IDs from localStorage on mount
    useEffect(() => {
        // Load deleted IDs from local storage
        const loadDeletedIds = () => {
            if (typeof window !== 'undefined') {
                const storedIds = localStorage.getItem('colormxr_deleted_palette_items');
                if (storedIds) {
                    try {
                        const parsedIds = JSON.parse(storedIds);
                        setDeletedIds(parsedIds);
                        console.log('Loaded deleted palette IDs from localStorage:', parsedIds);
                    } catch (err) {
                        console.error('Error parsing deleted palette IDs from localStorage', err);
                        localStorage.removeItem('colormxr_deleted_palette_items');
                    }
                }
            }
        };
        
        loadDeletedIds();
        fetchAllGalleryData();
    }, [])

    return (
        <div style={{ backgroundColor: "#4B4B4B" }}>
            <Header />
            
            <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 text-white">
                {/* Header navigation removed */}
                
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {/* Series Section */}
                {!loading && seriesItems.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-[20px] font-normal mb-4">Saved Palettes</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {seriesItems.map((series) => (
                                <Link 
                                    href={`/palette-gallery/series/${series.id}`}
                                    key={series.id}
                                    className="block"
                                >
                                    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                                        <div 
                                            className="p-4 h-40 relative flex items-center justify-center"
                                            style={{ 
                                                backgroundColor: series.thumbnailBackground || '#FFFFFF'
                                            }}
                                        >
                                            {/* Display palette colors as inline blocks */}
                                            {series.thumbnailColors && Array.isArray(series.thumbnailColors) && (
                                                <div className="flex gap-2">
                                                    {series.thumbnailColors.map((color, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className="w-8 h-8 shadow-md"
                                                            style={{ 
                                                                backgroundColor: color,
                                                                aspectRatio: "1/1" 
                                                            }}
                                                        />
                                                    ))}
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
                                                {series.itemCount} items
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-white truncate">{series.name}</h3>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(series.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Individual Items Section */}
                <div>
                    <h2 className="text-[20px] font-normal mb-4">Palettes</h2>
                    
                    {!loading && !error && galleryItems.length === 0 && seriesItems.length === 0 && (
                        <div className="text-center text-gray-200 py-12">
                            <p className="text-xl">No palette items found</p>
                            <p className="mt-2">Save some color palettes to see them here!</p>
                        </div>
                    )}
                    
                    {!loading && !error && galleryItems.length === 0 && seriesItems.length > 0 && (
                        <div className="text-center text-gray-300 py-6">
                            <p>All palettes are in series</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6" style={{ columnGap: "20px", 
    rowGap: "0px" }}>
                        {galleryItems
                            .filter(item => !deletedIds.includes(item.id)) // Extra filter to ensure deleted items don't show
                            .map((item) => (
                            <div 
                                key={item.id} 
                                className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => openLightbox(item)}
                                style={{ 
                                    width: "100%", 
                                    minWidth: "140px", 
                                    height: "70%",
                                    backgroundColor: item.background_color || '#ffffff',
                                    marginBottom: "20px"
                                }}
                            >
                                <div className="p-1 relative group h-full overflow-hidden" style={{ minHeight: "70px" }}>
                                    <div className="flex items-center justify-center">
                                        <div className="flex gap-2 px-4 py-3">
                                            {item.palette_colors && Array.isArray(item.palette_colors) && 
                                                item.palette_colors.map((color, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="w-8 h-8 shadow-md"
                                                        style={{ 
                                                            backgroundColor: color, 
                                                            aspectRatio: "1/1",
                                                            boxSizing: "border-box"
                                                        }}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                    
                                    {/* Overlay with view icon on hover */}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity">
                                        {/* View icon */}
                                        <div 
                                            className="bg-white/50 rounded-full p-2 hover:bg-white/70 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openLightbox(item);
                                            }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </div>
                                        
                                        {/* Delete icon (bottom right) */}
                                        <div 
                                            className="absolute bottom-2 right-2 bg-white/50 rounded-full p-1 hover:bg-white/70 cursor-pointer"
                                            onClick={(e) => handleDeleteItem(e, item)}
                                            style={{ zIndex: 10 }}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            <GalleryFooter title="Saved Palettes" />
            
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

export default PaletteGalleryPage
