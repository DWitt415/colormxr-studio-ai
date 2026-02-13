import { useState, useCallback } from 'react';

/**
 * Custom hook for managing shape selection and color linking
 * Handles single selection, group selection, and shift-click linking
 */
export const useShapeSelection = () => {
    const [selectedShape, setSelectedShape] = useState(null);
    const [activeShape, setActiveShape] = useState(null);
    const [lastShiftClickedShape, setLastShiftClickedShape] = useState(null);
    const [lastShiftClickedBackground, setLastShiftClickedBackground] = useState(false);
    const [isShiftPressed, setIsShiftPressed] = useState(false);

    // Shift-key event listeners
    useState(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Shift') setIsShiftPressed(true);
        };

        const handleKeyUp = (event) => {
            if (event.key === 'Shift') setIsShiftPressed(false);
        };

        if (typeof document !== 'undefined') {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('keyup', handleKeyUp);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('keyup', handleKeyUp);
            };
        }
    }, []);

    /**
     * Compare two shape selections for equality
     */
    const areSelectionsEqual = useCallback((selection1, selection2) => {
        if (typeof selection1 !== typeof selection2) return false;
        if (selection1 === selection2) return true;

        if (Array.isArray(selection1) && Array.isArray(selection2)) {
            if (selection1.length !== selection2.length) return false;
            const sorted1 = [...selection1].sort();
            const sorted2 = [...selection2].sort();
            return sorted1.every((val, i) => val === sorted2[i]);
        }

        return false;
    }, []);

    return {
        selectedShape,
        setSelectedShape,
        activeShape,
        setActiveShape,
        lastShiftClickedShape,
        setLastShiftClickedShape,
        lastShiftClickedBackground,
        setLastShiftClickedBackground,
        isShiftPressed,
        setIsShiftPressed,
        areSelectionsEqual
    };
};
