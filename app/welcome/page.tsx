'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/utils/auth'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ColorControllerUI from '@/components/ColorControllerUI'
import TutorSidebarWithLesson from '@/components/Modals/TutorSidebarWithLesson'
import MiniMenu, { SECTIONS } from '@/components/Modals/MiniMenu'
import { useRouter } from 'next/navigation'

type ExerciseConfig = {
  lessonFilename: string
  lessonId: string
  exerciseId: string
  lessonTitle: string
  colorController: {
    layoutMode?: string
    svgPath?: string
    row?: number
    col?: number
    width?: number
    height?: number
    hSpace?: number
    vSpace?: number
    bgColor?: string
    initShapeColors?: string[]
  }
}

// Exercise configurations indexed to match SECTIONS order
const EXERCISE_CONFIGS: ExerciseConfig[] = [
  {
    // 0: primary
    lessonFilename: '1-primary-ai.md',
    lessonId: '1-primary-ai',
    exerciseId: 'primary',
    lessonTitle: 'Colormixing 101 - Mixing primary colors',
    colorController: {
      layoutMode: 'grid',
      row: 1,
      col: 1,
      width: 200,
      height: 200,
      hSpace: 0,
      vSpace: 0,
      bgColor: 'rgb(255,255,255)',
      initShapeColors: ['rgb(0,0,0)'],
    },
  },
  {
    // 1: secondary
    lessonFilename: '2-secondary-ai.md',
    lessonId: '2-secondary-ai',
    exerciseId: 'econdary',
    lessonTitle: 'Making Secondary Colors',
    colorController: {
      layoutMode: 'grid',
      row: 2,
      col: 3,
      width: 150,
      height: 150,
      hSpace: 20,
      vSpace: 20,
      bgColor: 'rgb(255,255,255)',
    },
  },
  {
    // 2: subtraction
    lessonFilename: '3-subtraction-ai.md',
    lessonId: '3-subtraction-ai',
    exerciseId: 'subtraction',
    lessonTitle: 'Color by Subtraction',
    colorController: {
      layoutMode: 'grid',
      row: 2,
      col: 6,
      width: 150,
      height: 150,
      hSpace: 10,
      vSpace: 10,
      bgColor: 'rgb(169,169,169)',
      initShapeColors: Array(6).fill('rgb(255,255,255)'),
    },
  },
  {
    // 3: relationships
    lessonFilename: '4-relationships-ai.md',
    lessonId: '4-relationships-ai',
    exerciseId: 'relationships',
    lessonTitle: 'Primary & Secondary Relationships',
    colorController: {
      layoutMode: 'grid',
      row: 2,
      col: 6,
      width: 150,
      height: 150,
      hSpace: 20,
      vSpace: 20,
      bgColor: 'rgb(169,169,169)',
      initShapeColors: [
        ...Array(6).fill('rgb(0,0,0)'),
        ...Array(6).fill('rgb(255,255,255)'),
      ],
    },
  },
  {
    // 4: complex-complement
    lessonFilename: '6-complex-complement-ai.md',
    lessonId: '6-complex-complement-ai',
    exerciseId: 'complex_complement',
    lessonTitle: 'Complex Complementary Colors',
    colorController: {
      layoutMode: 'grid',
      row: 1,
      col: 2,
      width: 150,
      height: 150,
      hSpace: 0,
      vSpace: 0,
      bgColor: 'rgb(255,255,255)',
      initShapeColors: ['rgb(171,171,171)', 'rgb(205,205,205)'],
    },
  },
  {
    // 5: phantom-colors
    lessonFilename: '5-phantom-colors-ai.md',
    lessonId: '5-phantom-colors-ai',
    exerciseId: 'phantom_colors',
    lessonTitle: "'Phantom' Complementary Colors",
    colorController: {
      layoutMode: 'grid',
      row: 1,
      col: 1,
      width: 250,
      height: 250,
      hSpace: 0,
      vSpace: 0,
      bgColor: 'rgb(207,207,207)',
    },
  },
  {
    // 6: color-wheel
    lessonFilename: '7-color-wheel-ai.md',
    lessonId: '7-color-wheel-ai',
    exerciseId: 'color_wheel',
    lessonTitle: 'Building the Color Wheel',
    colorController: {
      layoutMode: 'svg',
      svgPath: '/color-wheel.svg',
      bgColor: '#F0F0F0',
    },
  },
]

function page() {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    const [isMiniMenuOpen, setIsMiniMenuOpen] = useState(true)
    const [isTutorOpen, setIsTutorOpen] = useState(false)
    const [activeExerciseIdx, setActiveExerciseIdx] = useState<number | null>(0)
    const [completedIds, setCompletedIds] = useState<string[]>([])
    const [shapeColors, setShapeColors] = useState<string[]>([])

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/')
        }
    }, [user, isLoading, router])

    const handleSelectSection = (idx: number) => {
        setActiveExerciseIdx(idx)
        setShapeColors([])
        setIsMiniMenuOpen(false)
        setIsTutorOpen(true)
    }

    const handleNextExercise = () => {
        if (activeExerciseIdx !== null && activeExerciseIdx < EXERCISE_CONFIGS.length - 1) {
            const sectionId = SECTIONS[activeExerciseIdx].id
            setCompletedIds(prev => prev.includes(sectionId) ? prev : [...prev, sectionId])
            handleSelectSection(activeExerciseIdx + 1)
        }
    }

    const handleLessonComplete = () => {
        if (activeExerciseIdx !== null) {
            const sectionId = SECTIONS[activeExerciseIdx].id
            setCompletedIds(prev =>
                prev.includes(sectionId) ? prev : [...prev, sectionId]
            )
        }
        setIsTutorOpen(false)
        setIsMiniMenuOpen(true)
    }

    // Show loading while checking auth
    if (isLoading) {
        return <div className="h-screen flex items-center justify-center">Loading...</div>
    }

    const activeConfig = activeExerciseIdx !== null ? EXERCISE_CONFIGS[activeExerciseIdx] : null
    const cc = activeConfig?.colorController

    return (
        <main style={{
            position: 'relative',
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            backgroundColor: cc?.bgColor || 'rgb(255,255,255)',
        }}>
            {/* Mini menu — shown first, reopens after lesson completes */}
            <MiniMenu
                isOpen={isMiniMenuOpen}
                completedIds={completedIds}
                onSelectSection={handleSelectSection}
            />

            {/* AI tutor — shown after section is selected */}
            {activeConfig && (
                <TutorSidebarWithLesson
                    key={activeConfig.lessonId}
                    isOpen={isTutorOpen}
                    closeModal={() => setIsTutorOpen(false)}
                    lessonFilename={activeConfig.lessonFilename}
                    lessonId={activeConfig.lessonId}
                    exerciseId={activeConfig.exerciseId}
                    lessonTitle={activeConfig.lessonTitle}
                    exerciseState={{ shapeColors }}
                    onLessonComplete={handleLessonComplete}
                    onNextExercise={handleNextExercise}
                />
            )}

            <Header />

            {/* ColorControllerUI — updates when exercise changes */}
            {activeConfig && cc && (
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
                    }}
                >
                    <ColorControllerUI
                        key={activeConfig.exerciseId}
                        layoutMode={cc.layoutMode || 'grid'}
                        svgPath={cc.svgPath}
                        row={cc.row}
                        col={cc.col}
                        width={cc.width}
                        height={cc.height}
                        hSpace={cc.hSpace}
                        vSpace={cc.vSpace}
                        bgColor={cc.bgColor}
                        initShapeColors={cc.initShapeColors}
                        hidePalette={true}
                        onShapeColorsChange={(colors: string[]) => setShapeColors(colors)}
                    />
                </div>
            )}

            {/* Welcome text when no exercise is active */}
            {!activeConfig && (
                <div style={{
                    position: 'absolute',
                    top: '36px',
                    left: 0,
                    right: 0,
                    bottom: '40px',
                    pointerEvents: 'none',
                    zIndex: 1,
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
            )}

            <Footer
                lesson="Welcome"
                title="Getting Started"
                onMenuClick={(() => { setIsTutorOpen(false); setIsMiniMenuOpen(true); }) as unknown as null}
            />
        </main>
    )
}

export default page
