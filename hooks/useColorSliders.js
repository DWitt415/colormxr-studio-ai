import { useCallback } from 'react';

/**
 * Custom hook for handling color slider logic
 * @param {Object} colorState - Color state from useColorState hook
 */
export const useColorSliders = (colorState) => {
    const {
        red, setRed,
        green, setGreen,
        blue, setBlue,
        yellow, setYellow,
        cyan, setCyan,
        magenta, setMagenta,
        isZPressed
    } = colorState;

    /**
     * Handle slider changes with support for grayscale mode (Z-key)
     * and secondary color sliders (Yellow, Cyan, Magenta)
     */
    const handleSliderChange = useCallback((color, value) => {
        let newRed = red;
        let newGreen = green;
        let newBlue = blue;

        if (isZPressed) {
            // Z-key mode: adjust all channels proportionally
            switch (color) {
                case 'Red':
                    const deltaRed = value - red;
                    newRed = value;
                    newGreen = Math.min(Math.max(green + deltaRed, 0), 255);
                    newBlue = Math.min(Math.max(blue + deltaRed, 0), 255);
                    break;
                case 'Green':
                    const deltaGreen = value - green;
                    newRed = Math.min(Math.max(red + deltaGreen, 0), 255);
                    newGreen = value;
                    newBlue = Math.min(Math.max(blue + deltaGreen, 0), 255);
                    break;
                case 'Blue':
                    const deltaBlue = value - blue;
                    newRed = Math.min(Math.max(red + deltaBlue, 0), 255);
                    newGreen = Math.min(Math.max(green + deltaBlue, 0), 255);
                    newBlue = value;
                    break;
            }
        } else {
            // Normal slider behavior
            switch (color) {
                case 'Red':
                    newRed = value;
                    break;
                case 'Green':
                    newGreen = value;
                    break;
                case 'Blue':
                    newBlue = value;
                    break;
                case 'Black':
                    // Black slider updates all channels equally
                    newRed = value;
                    newGreen = value;
                    newBlue = value;
                    break;
                case 'Yellow':
                    // Yellow affects Red and Green
                    if (value > yellow) {
                        if (green > red) {
                            newGreen = Math.min(green + (value - yellow), 255);
                            newRed = Math.min(red + (value - yellow), 255);
                        } else {
                            newRed = Math.min(red + (value - yellow), 255);
                            newGreen = Math.min(green + (value - yellow), 255);
                        }
                    } else {
                        if (green < red) {
                            newGreen = Math.max(green - (yellow - value), 0);
                            newRed = Math.max(red - (yellow - value), 0);
                        } else {
                            newRed = Math.max(red - (yellow - value), 0);
                            newGreen = Math.max(green - (yellow - value), 0);
                        }
                    }
                    break;
                case 'Cyan':
                    // Cyan affects Green and Blue
                    if (value > cyan) {
                        if (green > blue) {
                            newGreen = Math.min(green + (value - cyan), 255);
                            newBlue = Math.min(blue + (value - cyan), 255);
                        } else {
                            newBlue = Math.min(blue + (value - cyan), 255);
                            newGreen = Math.min(green + (value - cyan), 255);
                        }
                    } else {
                        if (green < blue) {
                            newGreen = Math.max(green - (cyan - value), 0);
                            newBlue = Math.max(blue - (cyan - value), 0);
                        } else {
                            newBlue = Math.max(blue - (cyan - value), 0);
                            newGreen = Math.max(green - (cyan - value), 0);
                        }
                    }
                    break;
                case 'Magenta':
                    // Magenta affects Red and Blue
                    if (value > magenta) {
                        if (red > blue) {
                            newRed = Math.min(red + (value - magenta), 255);
                            newBlue = Math.min(blue + (value - magenta), 255);
                        } else {
                            newBlue = Math.min(blue + (value - magenta), 255);
                            newRed = Math.min(red + (value - magenta), 255);
                        }
                    } else {
                        if (red < blue) {
                            newRed = Math.max(red - (magenta - value), 0);
                            newBlue = Math.max(blue - (magenta - value), 0);
                        } else {
                            newBlue = Math.max(blue - (magenta - value), 0);
                            newRed = Math.max(red - (magenta - value), 0);
                        }
                    }
                    break;
            }
        }

        // Update RGB values (derived values update automatically via useEffect in useColorState)
        if (newRed !== red) setRed(newRed);
        if (newGreen !== green) setGreen(newGreen);
        if (newBlue !== blue) setBlue(newBlue);
    }, [red, green, blue, yellow, cyan, magenta, isZPressed, setRed, setGreen, setBlue]);

    return {
        handleSliderChange
    };
};
