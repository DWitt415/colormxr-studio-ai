'use client'
import React, { useState, useEffect } from 'react'
import Header from '@/components/Header'
import GalleryFooter from '@/components/GalleryFooter'
import LightboxModal from '@/components/Modals/LightboxModal'
import { useParams, useRouter } from 'next/navigation'
import supabase from '@/utils/supabase'
import { storeGalleryPath } from '@/utils/navigation'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Item Component
function SortableItem({ item, series, openLightbox, handleDeleteItem, generateFallbackThumbnail, handleSetThumbnail }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow aspect-[4/3]"
            {...attributes}
            {...listeners}
        >
            <div
                style={{ backgroundColor: '#2A2A2A' }}
                onClick={() => openLightbox(item)}
                title="view composition"
                className="cursor-pointer"
            >
                <div
                    className={item.isStaticImage ? "p-4 thumbnail relative group h-full flex items-center justify-center" : "p-3 thumbnail relative group h-full flex items-center justify-center"}
                    style={{
                        backgroundColor: item.background_color || '#f3f4f6'
                    }}
                >
                    {/* Try to use SVG content directly if available, fall back to URL if not */}
                    {item.svg_content ? (
                        <img
                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg_content)}`}
                            alt={`Item ${item.filename || ''}`}
                            className="max-w-full max-h-full object-contain pointer-events-none"
                            onError={(e) => {
                                console.log(`Using fallback for ${item.filename}`)
                                const fallbackSrc = generateFallbackThumbnail(item)
                                if (fallbackSrc) {
                                    e.target.src = fallbackSrc
                                } else {
                                    e.target.style.opacity = "0"
                                }
                            }}
                        />
                    ) : (
                        <img
                            src={item.url}
                            alt={`Item ${item.filename || ''}`}
                            className="max-w-full max-h-full object-contain pointer-events-none"
                            style={item.isStaticImage ? {
                                width: '50%',
                                height: '50%'
                            } : {}}
                            onError={(e) => {
                                console.log(`Using fallback for ${item.filename}`)
                                const fallbackSrc = generateFallbackThumbnail(item)
                                if (fallbackSrc) {
                                    e.target.src = fallbackSrc
                                } else {
                                    e.target.style.opacity = "0"
                                }
                            }}
                        />
                    )}

                    {/* Set as thumbnail icon - upper left corner */}
                    <div
                        className={series.thumbnail_id === item.id
                            ? "absolute top-2 left-2 bg-blue-500/80 rounded-full p-1.5 cursor-pointer pointer-events-auto z-10"
                            : "absolute top-2 left-2 bg-white/80 rounded-full p-1.5 hover:bg-white cursor-pointer pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        }
                        onClick={(e) => {
                            e.stopPropagation()
                            handleSetThumbnail(item)
                        }}
                        title={series.thumbnail_id === item.id ? "Current thumbnail" : "Set as thumbnail"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>

                    {/* Overlay with action icons */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity pointer-events-none">
                        {/* View icon */}
                        <div
                            className="bg-white/80 rounded-full p-3 hover:bg-white cursor-pointer pointer-events-auto"
                            onClick={(e) => {
                                e.stopPropagation()
                                openLightbox(item)
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>

                        {/* Open in Colormxr icon - invisible for static images but keeps space */}
                        <div
                            className={item.isStaticImage
                                ? "rounded-full p-3 pointer-events-none invisible"
                                : "bg-white/80 rounded-full p-3 hover:bg-white cursor-pointer pointer-events-auto"
                            }
                            onClick={(e) => {
                                e.stopPropagation()
                                // Disable for static images
                                if (item.isStaticImage) {
                                    return
                                }
                                // Store the item data in localStorage
                                if (typeof window !== 'undefined') {
                                    console.log('🎨 ===== OPENING ITEM IN COLORMXR =====')
                                    console.log('🎨 Full item object:', JSON.stringify(item, null, 2))
                                    console.log('🎨 Shape colors:', item.shape_colors)
                                    console.log('🎨 Background color:', item.background_color)
                                    console.log('🎨 Layout mode:', item.layout_mode)
                                    console.log('🎨 Grid rows:', item.grid_rows)
                                    console.log('🎨 Grid cols:', item.grid_cols)
                                    console.log('🎨 Cell width:', item.cell_width, 'Type:', typeof item.cell_width)
                                    console.log('🎨 Cell height:', item.cell_height, 'Type:', typeof item.cell_height)
                                    console.log('🎨 H space:', item.h_space, 'Type:', typeof item.h_space)
                                    console.log('🎨 V space:', item.v_space, 'Type:', typeof item.v_space)

                                    const dataToStore = {
                                        shapeColors: item.shape_colors || [],
                                        backgroundColor: item.background_color || 'rgb(255,255,255)',
                                        id: item.id
                                    }

                                    console.log('🎨 Data being stored:', dataToStore)
                                    localStorage.setItem('editingShapeset', JSON.stringify(dataToStore))

                                    // Store gallery context for footer display
                                    localStorage.setItem('galleryContext', JSON.stringify({
                                        galleryName: series.name,
                                        compositionTitle: item.filename?.replace('.svg', '') || `Composition ${item.id}`
                                    }))
                                    console.log('📍 Stored gallery context:', {
                                        galleryName: series.name,
                                        compositionTitle: item.filename?.replace('.svg', '')
                                    })

                                    // Build URL parameters - use stored layout info if available, otherwise defaults
                                    const params = new URLSearchParams()
                                    params.append('layoutMode', item.layout_mode || 'grid')

                                    // For SVG layout mode, add svgPath parameter
                                    if (item.layout_mode === 'svg' && item.svg_path) {
                                        params.append('svgPath', item.svg_path)
                                    } else {
                                        // For other layouts, add grid parameters
                                        params.append('row', item.grid_rows || '5')
                                        params.append('col', item.grid_cols || '5')

                                        // Add cell dimensions and spacing if available
                                        if (item.cell_width) params.append('width', item.cell_width)
                                        if (item.cell_height) params.append('height', item.cell_height)
                                        if (item.h_space !== undefined && item.h_space !== null) params.append('hSpace', item.h_space)
                                        if (item.v_space !== undefined && item.v_space !== null) params.append('vSpace', item.v_space)
                                    }

                                    console.log('🎨 Navigating to:', `/shapeset-creator?${params.toString()}`)

                                    // Navigate to shapeset creator
                                    window.location.href = `/shapeset-creator?${params.toString()}`
                                }
                            }}
                            title="Open in Colormxr"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>

                        {/* Delete icon */}
                        <div
                            className="bg-red-500/80 rounded-full p-3 hover:bg-red-600 cursor-pointer pointer-events-auto"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteItem(item, e)
                            }}
                            title="Delete item"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function SeriesGalleryPage() {
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
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState('')

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Require 8px movement before drag starts (allows clicks to work)
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Handle drag end
    const handleDragEnd = async (event) => {
        const { active, over } = event

        if (active.id !== over.id) {
            const oldIndex = seriesItems.findIndex((item) => item.id === active.id)
            const newIndex = seriesItems.findIndex((item) => item.id === over.id)

            const newItems = arrayMove(seriesItems, oldIndex, newIndex)
            setSeriesItems(newItems)

            // Update sort_order in database for all items
            try {
                const tableName = series.type === 'composition' ? 'shapeset_gallery' : 'palette_gallery'

                console.log('💾 Saving new order to database...')

                // Update each item's sort_order
                const updates = newItems.map((item, index) =>
                    supabase
                        .from(tableName)
                        .update({ sort_order: index })
                        .eq('id', item.id)
                )

                await Promise.all(updates)
                console.log('✅ Order saved successfully!')
            } catch (err) {
                console.error('❌ Error updating sort order:', err)
                alert('Failed to save order. Please make sure the sort_order column exists in your database.')
            }
        }
    }

    useEffect(() => {
        if (!seriesId) {
            setError('No series ID provided')
            setLoading(false)
            return
        }

        // Store this gallery path for navigation
        storeGalleryPath(`/gallery/series/${seriesId}`)

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
            
            // Set the series data
            setSeries(seriesData)
            
            // 2. Determine which table to query based on the series type
            const isComposition = seriesData.type === 'composition'
            const tableName = isComposition ? 'shapeset_gallery' : 'palette_gallery'
            const storageBucket = isComposition ? 'shapeset-gallery' : 'palette-gallery'
            
            // 3. Fetch all items in the series
            const { data: itemsData, error: itemsError } = await supabase
                .from(tableName)
                .select('*')
                .eq('series_id', seriesId)
                .order('sort_order', { ascending: true, nullsFirst: false })
                .order('created_at', { ascending: false })
                
            if (itemsError) throw itemsError
            
            if (!itemsData || itemsData.length === 0) {
                setSeriesItems([])
                setLoading(false)
                return
            }
            
            // Add timestamp to prevent browser caching of URLs
            const timestamp = Date.now()
            
            // Process items to add URLs or use SVG content directly
            const processedItems = await Promise.all(itemsData.map(async (item, index) => {
                // Initialize sort_order if not set
                if (item.sort_order === null || item.sort_order === undefined) {
                    // Set sort_order based on current position
                    await supabase
                        .from(tableName)
                        .update({ sort_order: index })
                        .eq('id', item.id)
                    item.sort_order = index
                }

                // If we have SVG content, use it directly
                if (item.svg_content) {
                    return {
                        ...item,
                        url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svg_content)}`
                    }
                }

                // For static images (layout_mode === 'image'), use svg_path as storage path
                if (item.layout_mode === 'image' && item.svg_path) {
                    const { data: urlData } = await supabase
                        .storage
                        .from(storageBucket)
                        .getPublicUrl(`${item.svg_path}?t=${timestamp}`)

                    return {
                        ...item,
                        url: urlData.publicUrl,
                        isStaticImage: true // Mark as static image
                    }
                }

                // Otherwise get the URL from storage using filename
                const { data: urlData } = await supabase
                    .storage
                    .from(storageBucket)
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
    
    // Function to handle deleting an item from the series
    const handleDeleteItem = async (item, e) => {
        if (e) {
            e.stopPropagation()
        }

        if (!confirm(`Are you sure you want to delete this item? This action cannot be undone.`)) {
            return
        }

        try {
            setIsDeleting(true)

            console.log(`🗑️ Starting deletion for item ${item.id}...`)

            // Determine table and storage bucket based on series type
            const isComposition = series.type === 'composition'
            const tableName = isComposition ? 'shapeset_gallery' : 'palette_gallery'
            const storageBucket = isComposition ? 'shapeset-gallery' : 'palette-gallery'

            // 1. Delete from database FIRST (most important)
            console.log(`Step 1: Deleting from ${tableName}...`)
            const { error: dbError, data: deleteResult } = await supabase
                .from(tableName)
                .delete()
                .eq('id', item.id)
                .select()

            if (dbError) {
                console.error('❌ Database deletion failed:', dbError)
                throw new Error(`Database deletion failed: ${dbError.message}`)
            }

            console.log('✅ Database record deleted:', deleteResult)

            // 2. Delete from storage if there's a filename
            if (item.filename) {
                console.log('Step 2: Deleting storage file:', item.filename)
                const { error: storageError } = await supabase
                    .storage
                    .from(storageBucket)
                    .remove([item.filename])

                if (storageError) {
                    console.warn('⚠️ Storage deletion warning:', storageError)
                } else {
                    console.log('✅ Storage file deleted successfully')
                }
            }

            // 3. If this was the thumbnail, clear the thumbnail_id from the series
            if (series.thumbnail_id === item.id) {
                console.log('Step 3: Clearing series thumbnail...')
                const { error: updateError } = await supabase
                    .from('series_gallery')
                    .update({ thumbnail_id: null })
                    .eq('id', seriesId)

                if (updateError) {
                    console.warn('⚠️ Error clearing thumbnail:', updateError)
                } else {
                    setSeries(prev => ({
                        ...prev,
                        thumbnail_id: null
                    }))
                    console.log('✅ Series thumbnail cleared')
                }
            }

            // 4. Update local state to remove the deleted item
            setSeriesItems(prev => prev.filter(i => i.id !== item.id))

            // 5. Close lightbox if this item was being viewed
            if (selectedItem && selectedItem.id === item.id) {
                setIsLightboxOpen(false)
                setSelectedItem(null)
            }

            console.log(`✅ Deletion completed successfully for item ${item.id}`)

        } catch (err) {
            console.error('❌ Error deleting item:', err)
            alert(`Failed to delete item: ${err.message}\n\nPlease try again.`)
        } finally {
            setIsDeleting(false)
        }
    }
    
    // Handle series name editing
    const handleStartEditingName = () => {
        if (series) {
            setEditedName(series.name)
            setIsEditingName(true)
        }
    }

    const handleCancelEditingName = () => {
        setIsEditingName(false)
        setEditedName('')
    }

    const handleSaveSeriesName = async () => {
        if (!series || !editedName.trim()) {
            return
        }

        try {
            console.log('💾 Updating series name...')
            console.log('Series ID:', seriesId)
            console.log('Old name:', series.name)
            console.log('New name:', editedName.trim())

            // Check current user session
            const { data: sessionData } = await supabase.auth.getSession()
            console.log('Current user session:', sessionData?.session?.user?.id)

            const { data, error } = await supabase
                .from('series_gallery')
                .update({ name: editedName.trim() })
                .eq('id', seriesId)
                .select()

            if (error) {
                console.error('❌ Supabase error:', error)
                throw error
            }

            console.log('✅ Database update result:', data)

            if (!data || data.length === 0) {
                console.error('❌ No rows were updated. This might be an RLS policy issue.')
                alert('Failed to update series name. This might be a permissions issue. Check the browser console for details.')
                return
            }

            // Update local state
            setSeries(prev => ({
                ...prev,
                name: editedName.trim()
            }))

            setIsEditingName(false)
            setEditedName('')

            console.log('✅ Series name updated successfully')
        } catch (err) {
            console.error('❌ Error updating series name:', err)
            alert(`Failed to update series name: ${err.message}`)
        }
    }

    const handleNameKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSaveSeriesName()
        } else if (e.key === 'Escape') {
            handleCancelEditingName()
        }
    }

    // Handle setting series thumbnail
    const handleSetThumbnail = async (item) => {
        try {
            console.log('🖼️ Setting thumbnail for series...')

            const { error } = await supabase
                .from('series_gallery')
                .update({ thumbnail_id: item.id })
                .eq('id', seriesId)

            if (error) throw error

            // Update local state
            setSeries(prev => ({
                ...prev,
                thumbnail_id: item.id
            }))

            console.log('✅ Thumbnail set successfully!')
        } catch (err) {
            console.error('❌ Error setting thumbnail:', err)
            alert('Failed to set thumbnail. Please try again.')
        }
    }

    // Generate a fallback thumbnail from colors (same as in gallery pages)
    const generateFallbackThumbnail = (item) => {
        try {
            // Get colors based on item type
            const colors = item.shape_colors || item.palette_colors
            const backgroundColor = item.background_color || '#FFFFFF'
            
            if (!Array.isArray(colors) || colors.length === 0) {
                return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="${backgroundColor}" /></svg>`)}`
            }
            
            // Create a simple grid SVG
            const size = 100
            const cellSize = 30
            const padding = 5
            
            let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <rect width="${size}" height="${size}" fill="${backgroundColor}" />`
            
            // Add up to 4 color squares in a grid
            const maxColors = Math.min(4, colors.length)
            for (let i = 0; i < maxColors; i++) {
                const row = Math.floor(i / 2)
                const col = i % 2
                const x = padding + col * (cellSize + padding)
                const y = padding + row * (cellSize + padding)
                
                svgContent += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${colors[i]}" />`
            }
            
            svgContent += '</svg>'
            return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`
            
        } catch (err) {
            console.error('Error generating fallback thumbnail:', err)
            return null
        }
    }

    return (
        <div style={{ backgroundColor: "#4B4B4B" }}>
            <Header />

            <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 text-white">
                {/* Back button */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => {
                            // Store the main gallery path before navigating back
                            storeGalleryPath('/gallery')
                            router.back()
                        }}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <img src="/return_icon.svg" alt="Return" className="h-6 w-6" />
                        <span className="text-lg text-gray-200">return to main gallery</span>
                    </button>
                </div>

                {/* Series title */}
                <div className="flex items-center gap-3 mb-12">
                    {isEditingName ? (
                        <>
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={handleNameKeyDown}
                                className="text-[20px] font-normal text-white bg-[#3A3A3A] border border-gray-600 rounded px-3 py-1 focus:outline-none focus:border-blue-500"
                                style={{ minWidth: '300px' }}
                                autoFocus
                            />
                            <button
                                onClick={handleSaveSeriesName}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancelEditingName}
                                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <h1 className="text-[20px] font-normal text-white">
                                {series ? series.name : 'Series'}
                            </h1>
                            {series && (
                                <button
                                    onClick={handleStartEditingName}
                                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                                    title="Edit series name"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                            )}
                        </>
                    )}
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
                        <p className="text-xl">No items in this series</p>
                    </div>
                )}
                
                {/* Series items grid */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={seriesItems.map(item => item.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {seriesItems.map((item) => (
                                <SortableItem
                                    key={item.id}
                                    item={item}
                                    series={series}
                                    openLightbox={openLightbox}
                                    handleDeleteItem={handleDeleteItem}
                                    handleSetThumbnail={handleSetThumbnail}
                                    generateFallbackThumbnail={generateFallbackThumbnail}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
            
            <GalleryFooter title={series ? series.name : 'Series'} />
            
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
