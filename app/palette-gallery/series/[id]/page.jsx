'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import GalleryFooter from '@/components/GalleryFooter'
import LightboxModal from '@/components/Modals/LightboxModal'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@/utils/supabase'

export default function PaletteSeriesGalleryPage() {
    const params = useParams()
    const router = useRouter()
    const seriesId = params?.id

    const [series, setSeries] = useState(null)
    const [seriesItems, setSeriesItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    // For lightbox functionality
    const [selectedItem, setSelectedItem] = useState(null)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    
    useEffect(() => {
        if (!seriesId) {
            setError('No series ID provided')
            setLoading(false)
            return
        }
        
        fetchSeriesAndItems()
    }, [seriesId])
    
    // Function to fetch series details and all items in the series
    const fetchSeriesAndItems = async () => {
        try {
            setLoading(true)
            
            // 1. Fetch the series information first
            const { data: seriesData, error: seriesError } = await supabase
                .from('series_gallery')
                .select('*')
                .eq('id', seriesId)
                .single()
                
            if (seriesError) throw seriesError
            
            if (!seriesData) {
                setError('Series not found')
                setLoading(false)
                return
            }
            
            // Verify this is a palette series
            if (seriesData.type !== 'palette') {
                setError('This is not a palette series')
                setLoading(false)
                return
            }
            
            // Set the series data
            setSeries(seriesData)
            
            // 2. Fetch all palette items in the series
            const { data: itemsData, error: itemsError } = await supabase
                .from('palette_gallery')
                .select('*')
                .eq('series_id', seriesId)
                .order('created_at', { ascending: false })
                
            if (itemsError) throw itemsError
            
            if (!itemsData || itemsData.length === 0) {
                setSeriesItems([])
                setLoading(false)
                return
            }
            
            // Add timestamp to prevent browser caching of URLs
            const timestamp = Date.now()
            
            // Process items to add URLs
            const processedItems = await Promise.all(itemsData.map(async (item) => {
                // Get the URL from storage
                const { data: urlData } = await supabase
                    .storage
                    .from('palette-gallery')
                    .getPublicUrl(`${item.filename}?t=${timestamp}`)
                    
                return {
                    ...item,
                    url: urlData.publicUrl
                }
            }))
            
            setSeriesItems(processedItems)
        } catch (err) {
            console.error('Error loading series data:', err)
            setError(`Failed to load series: ${err.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Handle opening the lightbox with the selected item
    const openLightbox = (item) => {
        setSelectedItem(item)
        setIsLightboxOpen(true)
    }
    
    // Handle closing the lightbox
    const closeLightbox = () => {
        setIsLightboxOpen(false)
    }
    
    // Navigation in the lightbox with circular navigation
    const goToNextItem = () => {
        if (!selectedItem || seriesItems.length === 0) return
        
        const currentIndex = seriesItems.findIndex(item => item.id === selectedItem.id)
        if (currentIndex < seriesItems.length - 1) {
            // If not at the last item, go to next item
            setSelectedItem(seriesItems[currentIndex + 1])
        } else {
            // If at the last item (N), wrap around to the first item (1)
            setSelectedItem(seriesItems[0])
        }
    }
    
    const goToPreviousItem = () => {
        if (!selectedItem || seriesItems.length === 0) return
        
        const currentIndex = seriesItems.findIndex(item => item.id === selectedItem.id)
        if (currentIndex > 0) {
            // If not at the first item, go to previous item
            setSelectedItem(seriesItems[currentIndex - 1])
        } else {
            // If at the first item, wrap around to the last item
            setSelectedItem(seriesItems[seriesItems.length - 1])
        }
    }
    
    // Check if there are next/previous items
    // With circular navigation, both buttons should be enabled as long as there's more than one item
    const hasNextItem = () => {
        return selectedItem && seriesItems.length > 1
    }
    
    const hasPreviousItem = () => {
        return selectedItem && seriesItems.length > 1
    }
    
    // Function to create series context information for the lightbox
    const getSeriesContext = () => {
        if (!series || !selectedItem) return null
        
        const currentIndex = seriesItems.findIndex(item => item.id === selectedItem.id)
        if (currentIndex === -1) return null
        
        return {
            id: series.id,
            name: series.name,
            currentIndex: currentIndex + 1, // 1-based for display
            totalItems: seriesItems.length
        }
    }
    
    // Function to handle setting a palette as the series thumbnail
    const setAsThumbnail = async (item) => {
        try {
            const { error } = await supabase
                .from('series_gallery')
                .update({ thumbnail_id: item.id })
                .eq('id', seriesId)
                
            if (error) throw error
            
            // Update the series data locally
            setSeries(prev => ({
                ...prev,
                thumbnail_id: item.id
            }))
            
        } catch (err) {
            console.error('Error setting thumbnail:', err)
            alert(`Failed to set as thumbnail: ${err.message}`)
        }
    }
    
    // Generate a fallback thumbnail from colors
    const generateFallbackThumbnail = (item) => {
        try {
            const paletteColors = item.palette_colors || []
            const backgroundColor = item.background_color || '#FFFFFF'
            
            if (!Array.isArray(paletteColors) || paletteColors.length === 0) {
                return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><rect width="300" height="100" fill="${backgroundColor}" /></svg>`)}`
            }
            
            // Set size values
            const width = 300; 
            const height = 100;
            const squareSize = 50;
            const padding = 12;
            const gap = 6;
            
            let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <rect width="${width}" height="${height}" fill="${backgroundColor}" />`;
            
            // Add up to 5 color squares
            const maxColors = Math.min(5, paletteColors.length);
            const startX = (width - (maxColors * squareSize + (maxColors - 1) * gap)) / 2;
            
            for (let i = 0; i < maxColors; i++) {
                const x = startX + i * (squareSize + gap);
                const y = (height - squareSize) / 2;
                
                svgContent += `<rect x="${x}" y="${y}" width="${squareSize}" height="${squareSize}" fill="${paletteColors[i]}" />`;
            }
            
            svgContent += '</svg>';
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
            
        } catch (err) {
            console.error('Error generating fallback thumbnail:', err)
            return null
        }
    }

    return (
        <div style={{ backgroundColor: "#4B4B4B" }}>
            <Header />
            
            <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 text-white">
                {/* Series header and back button */}
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => router.back()}
                        className="mr-4 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                    
                    <h1 className="text-2xl font-medium">
                        {series ? series.name : 'Palette Series'}
                    </h1>
                </div>
                
                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                    </div>
                )}
                
                {/* Error state */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error! </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                
                {/* Empty state */}
                {!loading && !error && seriesItems.length === 0 && (
                    <div className="text-center text-gray-200 py-12">
                        <p className="text-xl">No palettes in this series</p>
                    </div>
                )}
                
                {/* Series items grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {seriesItems.map((item) => (
                        <div 
                            key={item.id} 
                            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => openLightbox(item)}
                        >
                            <div 
                                className="palette-thumbnail relative group h-20"
                                style={{ 
                                    backgroundColor: item.background_color || '#ffffff' 
                                }}
                            >
                                <img 
                                    src={item.url}
                                    alt={`Palette ${item.id}`}
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        console.log(`Using fallback for palette: ${item.id}`);
                                        // Generate a fallback thumbnail
                                        const fallbackSrc = generateFallbackThumbnail(item);
                                        if (fallbackSrc) {
                                            e.target.src = fallbackSrc;
                                        } else {
                                            e.target.style.opacity = "0";
                                        }
                                    }}
                                />
                                
                                {/* Overlay with action icons */}
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
                                    
                                    {/* Set as thumbnail icon (only if not already the thumbnail) */}
                                    {series && series.thumbnail_id !== item.id && (
                                        <div 
                                            className="bg-white/50 rounded-full p-2 hover:bg-white/70 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAsThumbnail(item);
                                            }}
                                            title="Set as series thumbnail"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    {/* Thumbnail indicator */}
                                    {series && series.thumbnail_id === item.id && (
                                        <div 
                                            className="absolute top-2 left-2 bg-white/70 rounded-full p-1"
                                            title="Current thumbnail for series"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <GalleryFooter title={series ? series.name : 'Palette Series'} />
            
            {/* Lightbox Modal with series context */}
            <LightboxModal
                isOpen={isLightboxOpen}
                closeModal={closeLightbox}
                item={selectedItem}
                onNext={goToNextItem}
                onPrevious={goToPreviousItem}
                hasNext={hasNextItem()}
                hasPrevious={hasPreviousItem()}
                seriesContext={getSeriesContext()}
            />
        </div>
    )
}
