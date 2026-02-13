import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react'
import { useState } from 'react'

function NewShapesetModal({ isOpen, closeModal, layoutType }) {
    // Grid layout state
    const [gridRows, setGridRows] = useState('5')
    const [gridCols, setGridCols] = useState('5')
    const [gridWidth, setGridWidth] = useState('150')
    const [gridHeight, setGridHeight] = useState('150')
    const [gridHSpace, setGridHSpace] = useState('0')
    const [gridVSpace, setGridVSpace] = useState('0')

    // Link state for grid
    const [gridRowColLinked, setGridRowColLinked] = useState(true)
    const [gridSizeLinked, setGridSizeLinked] = useState(true)
    const [gridSpaceLinked, setGridSpaceLinked] = useState(true)

    // Cosmic layout state
    const [cosmicCount, setCosmicCount] = useState('7')
    const [cosmicWidth, setCosmicWidth] = useState('100')
    const [cosmicHeight, setCosmicHeight] = useState('100')
    const [cosmicHSpace, setCosmicHSpace] = useState('100')
    const [cosmicVSpace, setCosmicVSpace] = useState('100')

    // Link state for cosmic
    const [cosmicSizeLinked, setCosmicSizeLinked] = useState(true)
    const [cosmicGrowthLinked, setCosmicGrowthLinked] = useState(true)

    // Radiant layout state
    const [radiantCount, setRadiantCount] = useState('8')
    const [radiantWidth, setRadiantWidth] = useState('1000')
    const [radiantFillArea, setRadiantFillArea] = useState(false)

    // Handlers for linked values
    const handleGridRowsChange = (value) => {
        setGridRows(value)
        if (gridRowColLinked) setGridCols(value)
    }

    const handleGridColsChange = (value) => {
        setGridCols(value)
        if (gridRowColLinked) setGridRows(value)
    }

    const handleGridWidthChange = (value) => {
        setGridWidth(value)
        if (gridSizeLinked) setGridHeight(value)
    }

    const handleGridHeightChange = (value) => {
        setGridHeight(value)
        if (gridSizeLinked) setGridWidth(value)
    }

    const handleGridHSpaceChange = (value) => {
        setGridHSpace(value)
        if (gridSpaceLinked) setGridVSpace(value)
    }

    const handleGridVSpaceChange = (value) => {
        setGridVSpace(value)
        if (gridSpaceLinked) setGridHSpace(value)
    }

    const handleCosmicWidthChange = (value) => {
        setCosmicWidth(value)
        if (cosmicSizeLinked) setCosmicHeight(value)
    }

    const handleCosmicHeightChange = (value) => {
        setCosmicHeight(value)
        if (cosmicSizeLinked) setCosmicWidth(value)
    }

    const handleCosmicHSpaceChange = (value) => {
        setCosmicHSpace(value)
        if (cosmicGrowthLinked) setCosmicVSpace(value)
    }

    const handleCosmicVSpaceChange = (value) => {
        setCosmicVSpace(value)
        if (cosmicGrowthLinked) setCosmicHSpace(value)
    }

    const handleCreate = () => {
        const params = new URLSearchParams()

        if (layoutType === 'grid') {
            params.append('layoutMode', 'grid')
            params.append('row', gridRows)
            params.append('col', gridCols)
            params.append('width', gridWidth)
            params.append('height', gridHeight)
            params.append('hSpace', gridHSpace)
            params.append('vSpace', gridVSpace)
        } else if (layoutType === 'cosmic') {
            params.append('layoutMode', 'cosmic')
            params.append('col', cosmicCount)
            params.append('width', cosmicWidth)
            params.append('height', cosmicHeight)
            params.append('hSpace', cosmicHSpace)
            params.append('vSpace', cosmicVSpace)
        } else if (layoutType === 'radiant') {
            params.append('layoutMode', 'radiant')
            params.append('col', radiantCount)
            // If fill area is checked, width will be calculated automatically
            if (radiantFillArea) {
                params.append('fillArea', 'true')
            } else {
                params.append('width', radiantWidth)
            }
        }

        // Navigate to the shapeset creator page with parameters
        window.location.href = `/shapeset-creator?${params.toString()}`
    }

    const handleCancel = () => {
        closeModal()
    }

    return (
        <Transition appear show={isOpen}>
            <Dialog as="div" className="relative z-[1001] focus:outline-none" onClose={closeModal}>
                <div className="fixed inset-0 z-[1001]" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <DialogPanel
                                className="w-full max-w-md rounded-xl bg-background p-8 text-bodytext shadow-2xl"
                                style={{
                                    backdropFilter: 'none',
                                    WebkitBackdropFilter: 'none'
                                }}
                            >
                                <style jsx>{`
                                    .input-field {
                                        width: 100%;
                                        padding: 8px 12px;
                                        background: rgba(255, 255, 255, 0.05);
                                        border: 1px solid rgba(255, 255, 255, 0.1);
                                        border-radius: 6px;
                                        color: #D2D2D2;
                                        font-size: 14px;
                                        transition: all 0.2s;
                                    }
                                    .input-field:focus {
                                        outline: none;
                                        border-color: #5771FF;
                                        background: rgba(255, 255, 255, 0.08);
                                    }
                                    .input-field:hover {
                                        border-color: rgba(255, 255, 255, 0.2);
                                    }
                                    /* Dark mode number input steppers */
                                    .input-field::-webkit-inner-spin-button,
                                    .input-field::-webkit-outer-spin-button {
                                        opacity: 1;
                                        filter: invert(1) brightness(0.7);
                                    }
                                    .link-icon {
                                        width: 24px;
                                        height: 24px;
                                        display: flex;
                                        align-items: center;
                                        justify-center;
                                        cursor: pointer;
                                        transition: all 0.2s;
                                        color: #5771FF;
                                    }
                                    .link-icon:hover {
                                        color: #4560E6;
                                        transform: scale(1.1);
                                    }
                                    .link-icon.unlinked {
                                        color: #666;
                                    }
                                    .link-icon.unlinked:hover {
                                        color: #888;
                                    }
                                    .input-label {
                                        display: block;
                                        margin-bottom: 6px;
                                        color: #AEAEAE;
                                        font-size: 13px;
                                        font-weight: 500;
                                    }
                                    .input-group {
                                        margin-bottom: 16px;
                                    }
                                    .button-primary {
                                        background: #5771FF;
                                        color: white;
                                        padding: 10px 24px;
                                        border-radius: 8px;
                                        border: none;
                                        font-weight: 600;
                                        cursor: pointer;
                                        transition: all 0.2s;
                                    }
                                    .button-primary:hover {
                                        background: #4560E6;
                                        transform: translateY(-1px);
                                        box-shadow: 0 4px 12px rgba(87, 113, 255, 0.4);
                                    }
                                    .button-secondary {
                                        background: transparent;
                                        color: #AEAEAE;
                                        padding: 10px 24px;
                                        border-radius: 8px;
                                        border: none;
                                        font-weight: 600;
                                        cursor: pointer;
                                        transition: all 0.2s;
                                    }
                                    .button-secondary:hover {
                                        color: #D2D2D2;
                                    }
                                    .section-divider {
                                        height: 1px;
                                        background: rgba(255, 255, 255, 0.1);
                                        margin: 20px 0;
                                    }
                                `}</style>

                                <h2 className="text-xl font-semibold text-[#5670F8] mb-6">
                                    {layoutType === 'grid' && 'New Grid Shapeset'}
                                    {layoutType === 'cosmic' && 'New Cosmic Shapeset'}
                                    {layoutType === 'radiant' && 'New Radiant Shapeset'}
                                </h2>

                                <div className="overflow-y-auto max-h-[60vh] pr-2">
                                    {layoutType === 'grid' && (
                                        <>
                                            <div className="flex items-end gap-2 mb-4">
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Rows</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={gridRows}
                                                        onChange={(e) => handleGridRowsChange(e.target.value)}
                                                        min="1"
                                                        max="20"
                                                    />
                                                </div>
                                                <div
                                                    className={`link-icon mb-4 ${!gridRowColLinked ? 'unlinked' : ''}`}
                                                    onClick={() => setGridRowColLinked(!gridRowColLinked)}
                                                    title={gridRowColLinked ? 'Unlink values' : 'Link values'}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        {gridRowColLinked ? (
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                        ) : (
                                                            <>
                                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                            </>
                                                        )}
                                                        {gridRowColLinked && <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />}
                                                    </svg>
                                                </div>
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Columns</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={gridCols}
                                                        onChange={(e) => handleGridColsChange(e.target.value)}
                                                        min="1"
                                                        max="20"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-end gap-2 mb-4">
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Width (px)</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={gridWidth}
                                                        onChange={(e) => handleGridWidthChange(e.target.value)}
                                                        min="10"
                                                        max="500"
                                                    />
                                                </div>
                                                <div
                                                    className={`link-icon mb-4 ${!gridSizeLinked ? 'unlinked' : ''}`}
                                                    onClick={() => setGridSizeLinked(!gridSizeLinked)}
                                                    title={gridSizeLinked ? 'Unlink values' : 'Link values'}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        {gridSizeLinked ? (
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                        ) : (
                                                            <>
                                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                            </>
                                                        )}
                                                        {gridSizeLinked && <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />}
                                                    </svg>
                                                </div>
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Height (px)</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={gridHeight}
                                                        onChange={(e) => handleGridHeightChange(e.target.value)}
                                                        min="10"
                                                        max="500"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-end gap-2 mb-4">
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Horizontal Space (px)</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={gridHSpace}
                                                        onChange={(e) => handleGridHSpaceChange(e.target.value)}
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>
                                                <div
                                                    className={`link-icon mb-4 ${!gridSpaceLinked ? 'unlinked' : ''}`}
                                                    onClick={() => setGridSpaceLinked(!gridSpaceLinked)}
                                                    title={gridSpaceLinked ? 'Unlink values' : 'Link values'}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        {gridSpaceLinked ? (
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                        ) : (
                                                            <>
                                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                            </>
                                                        )}
                                                        {gridSpaceLinked && <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />}
                                                    </svg>
                                                </div>
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Vertical Space (px)</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={gridVSpace}
                                                        onChange={(e) => handleGridVSpaceChange(e.target.value)}
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {layoutType === 'cosmic' && (
                                        <>
                                            <div className="input-group mb-4">
                                                <label className="input-label">Number of Concentric Shapes</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={cosmicCount}
                                                    onChange={(e) => setCosmicCount(e.target.value)}
                                                    min="1"
                                                    max="15"
                                                />
                                                <div className="text-xs text-[#888] mt-1">
                                                    Shapes emanate from center
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 mb-4">
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Base Width (px)</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={cosmicWidth}
                                                        onChange={(e) => handleCosmicWidthChange(e.target.value)}
                                                        min="10"
                                                        max="300"
                                                    />
                                                    <div className="text-xs text-[#888] mt-1">
                                                        Innermost shape size
                                                    </div>
                                                </div>
                                                <div
                                                    className={`link-icon mt-6 ${!cosmicSizeLinked ? 'unlinked' : ''}`}
                                                    onClick={() => setCosmicSizeLinked(!cosmicSizeLinked)}
                                                    title={cosmicSizeLinked ? 'Unlink values' : 'Link values'}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        {cosmicSizeLinked ? (
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                        ) : (
                                                            <>
                                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                            </>
                                                        )}
                                                        {cosmicSizeLinked && <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />}
                                                    </svg>
                                                </div>
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Base Height (px)</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={cosmicHeight}
                                                        onChange={(e) => handleCosmicHeightChange(e.target.value)}
                                                        min="10"
                                                        max="300"
                                                    />
                                                    <div className="text-xs text-[#888] mt-1">
                                                        Innermost shape size
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2 mb-4">
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Horizontal Growth (px)</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={cosmicHSpace}
                                                        onChange={(e) => handleCosmicHSpaceChange(e.target.value)}
                                                        min="0"
                                                        max="200"
                                                    />
                                                    <div className="text-xs text-[#888] mt-1">
                                                        Width increase per layer
                                                    </div>
                                                </div>
                                                <div
                                                    className={`link-icon mt-6 ${!cosmicGrowthLinked ? 'unlinked' : ''}`}
                                                    onClick={() => setCosmicGrowthLinked(!cosmicGrowthLinked)}
                                                    title={cosmicGrowthLinked ? 'Unlink values' : 'Link values'}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        {cosmicGrowthLinked ? (
                                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                        ) : (
                                                            <>
                                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                            </>
                                                        )}
                                                        {cosmicGrowthLinked && <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />}
                                                    </svg>
                                                </div>
                                                <div className="input-group flex-1">
                                                    <label className="input-label">Vertical Growth (px)</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        value={cosmicVSpace}
                                                        onChange={(e) => handleCosmicVSpaceChange(e.target.value)}
                                                        min="0"
                                                        max="200"
                                                    />
                                                    <div className="text-xs text-[#888] mt-1">
                                                        Height increase per layer
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {layoutType === 'radiant' && (
                                        <>
                                            <div className="input-group">
                                                <label className="input-label">Number of Triangles</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    value={radiantCount}
                                                    onChange={(e) => setRadiantCount(e.target.value)}
                                                    min="3"
                                                    max="24"
                                                />
                                                <div className="text-xs text-[#888] mt-1">
                                                    Triangles radiate from center point
                                                </div>
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={radiantFillArea}
                                                        onChange={(e) => setRadiantFillArea(e.target.checked)}
                                                        className="w-4 h-4 cursor-pointer"
                                                    />
                                                    <span>Fill area</span>
                                                </label>
                                                <div className="text-xs text-[#888] mt-1">
                                                    Triangles sized to completely fill surface area like pie slices
                                                </div>
                                            </div>

                                            <div className="input-group">
                                                <label className="input-label">Triangle Width (px)</label>
                                                <input
                                                    type={radiantFillArea ? "text" : "number"}
                                                    className="input-field"
                                                    value={radiantFillArea ? '--' : radiantWidth}
                                                    onChange={(e) => !radiantFillArea && setRadiantWidth(e.target.value)}
                                                    min="50"
                                                    max="1000"
                                                    disabled={radiantFillArea}
                                                    style={{
                                                        opacity: radiantFillArea ? 0.5 : 1,
                                                        cursor: radiantFillArea ? 'not-allowed' : 'text'
                                                    }}
                                                />
                                                <div className="text-xs text-[#888] mt-1">
                                                    Base width of each triangular segment
                                                </div>
                                            </div>
                                        </>
                                    )}

                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleCancel}
                                        className="button-secondary flex-1"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        className="button-primary flex-1"
                                    >
                                        Create
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default NewShapesetModal
