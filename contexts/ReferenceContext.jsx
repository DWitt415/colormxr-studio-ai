'use client'
import React, { createContext, useContext, useState } from 'react'
import FauveImageModal from '@/components/Modals/FauveImageModal'

const ReferenceContext = createContext()

export function ReferenceProvider({ children }) {
    const [isReferenceOpen, setIsReferenceOpen] = useState(false)

    const toggleReference = () => {
        setIsReferenceOpen(prev => !prev)
    }

    const openReference = () => {
        setIsReferenceOpen(true)
    }

    const closeReference = () => {
        setIsReferenceOpen(false)
    }

    return (
        <ReferenceContext.Provider value={{ isReferenceOpen, toggleReference, openReference, closeReference }}>
            {children}
            <FauveImageModal isOpen={isReferenceOpen} closeModal={closeReference} />
        </ReferenceContext.Provider>
    )
}

export function useReference() {
    const context = useContext(ReferenceContext)
    if (!context) {
        throw new Error('useReference must be used within a ReferenceProvider')
    }
    return context
}
