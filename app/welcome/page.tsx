'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth } from '@/utils/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ColorControllerUI from '@/components/ColorControllerUI'
import { useRouter } from 'next/navigation'
import supabase from '@/utils/supabase'

type Composition = {
    shape_colors: string[]
    background_color: string
    [key: string]: any
}

function page() {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const [randomComposition, setRandomComposition] = useState<Composition | null>(null)
    const [compositionLoading, setCompositionLoading] = useState(true)
    const hasFetchedRef = useRef(false)

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/')
        }
    }, [user, isLoading, router])

    // Fetch a random composition from the gallery (only once)
    useEffect(() => {
        const fetchRandomComposition = async () => {
            // Prevent multiple fetches
            if (hasFetchedRef.current) {
                console.log('⏭️ Skipping fetch - already fetched')
                return
            }

            hasFetchedRef.current = true
            console.log('🎲 Fetching random composition...')

            try {
                setCompositionLoading(true)

                // Get all compositions
                const { data, error } = await supabase
                    .from('shapeset_gallery')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (error) {
                    console.error('Error fetching compositions:', error)
                    setCompositionLoading(false)
                    return
                }

                if (data && data.length > 0) {
                    // Pick a random one
                    const randomIndex = Math.floor(Math.random() * data.length)
                    const composition = data[randomIndex]

                    console.log('📸 Loaded random composition:', composition)
                    setRandomComposition(composition)
                }

                setCompositionLoading(false)
            } catch (err) {
                console.error('Error loading composition:', err)
                setCompositionLoading(false)
            }
        }

        // Only fetch if we don't have a composition yet and user is authenticated
        if (user && !isLoading && !randomComposition) {
            fetchRandomComposition()
        }
    }, [user, isLoading, randomComposition])

    // Show loading while checking auth
    if (isLoading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <main style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            overflow: 'hidden'
        }}>
            <Header />

            {/* Interactive composition display - full background */}
            {!compositionLoading && randomComposition && randomComposition.shape_colors && (
                <div
                    className="animate-fadeIn"
                    style={{
                        position: 'absolute',
                        top: '36px',
                        left: 0,
                        right: 0,
                        bottom: '40px',
                        width: '100%',
                        height: 'calc(100vh - 76px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        animationFillMode: 'forwards'
                    }}>
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        top: '-50px'
                    }}>
                        <ColorControllerUI
                            layoutMode={randomComposition.layout_mode || 'grid'}
                            row={randomComposition.grid_rows || 5}
                            col={randomComposition.grid_cols || 5}
                            width={randomComposition.cell_width || 120}
                            height={randomComposition.cell_height || 120}
                            hSpace={randomComposition.h_space || 0}
                            vSpace={randomComposition.v_space || 0}
                            svgPath={randomComposition.svg_path || null}
                            bgColor={randomComposition.background_color || 'rgb(255,255,255)'}
                            initShapeColors={randomComposition.shape_colors}
                            hidePalette={true}
                        />
                    </div>
                </div>
            )}

            {/* Text overlay on top of composition */}
            <div style={{
                position: 'absolute',
                top: '36px',
                left: 0,
                right: 0,
                bottom: '40px',
                pointerEvents: 'none',
                zIndex: 1
            }} className='flex items-center'>
                <div className='lg:pl-14 px-5 lg:px-0' style={{ pointerEvents: 'auto' }}>
                    <h1 className='text-[#5771FF] font-light text-3xl lg:text-4xl'>
                        Colormxr
                    </h1>
                    <h2 className='text-[#4A4A4A] font-light text-3xl lg:text-4xl'>
                        A new way to color
                    </h2>
                </div>
            </div>

            <Footer
                lesson="Welcome"
                title="Colormxr"
                customText="©2025. All rights reserved."
                shapeColors={[]}
                backgroundColor="rgb(255,255,255)"
                row={1}
                col={1}
            />
        </main>
    )
}

export default page