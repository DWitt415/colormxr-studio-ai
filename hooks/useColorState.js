import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing color state and conversions
 * Handles RGB, CMY, and derived color values
 */
export const useColorState = () => {
    const [red, setRed] = useState(0);
    const [green, setGreen] = useState(0);
    const [blue, setBlue] = useState(0);
    const [black, setBlack] = useState(0);
    const [yellow, setYellow] = useState(0);
    const [cyan, setCyan] = useState(0);
    const [magenta, setMagenta] = useState(0);

    // Z-key state for grayscale mode
    const [isZPressed, setIsZPressed] = useState(false);

    // Computed output color
    const outputColorCode = `rgb(${red},${green},${blue})`;

    // RGB to CMY conversion
    const rgbToCmy = useCallback((r, g, b) => {
        const clamp = (value) => Math.min(255, Math.max(0, value));
        r = clamp(r);
        g = clamp(g);
        b = clamp(b);

        const rNorm = r / 255;
        const gNorm = g / 255;
        const bNorm = b / 255;

        const c = Math.round((1 - rNorm) * 100);
        const m = Math.round((1 - gNorm) * 100);
        const y = Math.round((1 - bNorm) * 100);

        return { c, m, y };
    }, []);

    // Update derived color values when RGB changes
    useEffect(() => {
        const newBlack = Math.round((red + green + blue) / 3);
        const newYellow = Math.round(red + (green - red) / 2);
        const newCyan = Math.round(green + (blue - green) / 2);
        const newMagenta = Math.round(red + (blue - red) / 2);

        if (newBlack !== black) setBlack(newBlack);
        if (newYellow !== yellow) setYellow(newYellow);
        if (newCyan !== cyan) setCyan(newCyan);
        if (newMagenta !== magenta) setMagenta(newMagenta);
    }, [red, green, blue]);

    // Z-key event listeners for grayscale mode
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'z') setIsZPressed(true);
        };

        const handleKeyUp = (event) => {
            if (event.key === 'z') setIsZPressed(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Function to update sliders from color string
    const updateSlidersFromColor = useCallback((colorString) => {
        if (!colorString) return;

        let r, g, b;

        if (colorString.startsWith('#')) {
            r = parseInt(colorString.slice(1, 3), 16);
            g = parseInt(colorString.slice(3, 5), 16);
            b = parseInt(colorString.slice(5, 7), 16);
        } else if (colorString.startsWith('rgb')) {
            const match = colorString.match(/\d+/g);
            if (match && match.length >= 3) {
                r = parseInt(match[0]);
                g = parseInt(match[1]);
                b = parseInt(match[2]);
            } else {
                return;
            }
        } else {
            return;
        }

        setRed(r);
        setGreen(g);
        setBlue(b);
    }, []);

    return {
        // RGB values
        red, setRed,
        green, setGreen,
        blue, setBlue,

        // Derived values
        black, setBlack,
        yellow, setYellow,
        cyan, setCyan,
        magenta, setMagenta,

        // Computed
        outputColorCode,
        isZPressed,

        // Utilities
        rgbToCmy,
        updateSlidersFromColor
    };
};
