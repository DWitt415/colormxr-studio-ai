import { fontConfig, getFontStyles, getFontCSSVars, getFontTailwindClasses } from './fontConfig.js'

/**
 * Font Loading Utility
 * 
 * This module handles font loading and provides utilities for consistent font usage
 * across the application.
 */

/**
 * Preload Google Fonts for better performance
 */
export const preloadFonts = () => {
  if (typeof document === 'undefined') return // SSR safety

  const fonts = [
    {
      href: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap',
      crossorigin: 'anonymous'
    },
    {
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
      crossorigin: 'anonymous'
    }
  ]

  fonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'style'
    link.href = font.href
    link.crossOrigin = font.crossorigin
    document.head.appendChild(link)
    
    // Also add the actual stylesheet
    const styleLink = document.createElement('link')
    styleLink.rel = 'stylesheet'
    styleLink.href = font.href
    styleLink.crossOrigin = font.crossorigin
    document.head.appendChild(styleLink)
  })
}

/**
 * Check if fonts are loaded
 */
export const checkFontsLoaded = async () => {
  if (typeof document === 'undefined' || !document.fonts) return true

  try {
    await document.fonts.ready
    return true
  } catch (error) {
    console.warn('Font loading check failed:', error)
    return false
  }
}

/**
 * Apply font styles to an element
 * @param {HTMLElement} element - DOM element to style
 * @param {string} component - Component name from fontConfig
 */
export const applyFontStyles = (element, component) => {
  if (!element) return

  const styles = getFontStyles(component)
  Object.assign(element.style, styles)
}

/**
 * Create a style object for React components
 * @param {string} component - Component name from fontConfig
 * @param {object} additionalStyles - Additional CSS properties
 * @returns {object} - Style object for React
 */
export const createFontStyle = (component, additionalStyles = {}) => {
  const fontStyles = getFontStyles(component)
  return { ...fontStyles, ...additionalStyles }
}

/**
 * Font detection utility
 */
export const isFontAvailable = (fontFamily) => {
  if (typeof document === 'undefined') return false

  const testString = 'mmmmmmmmmmlli'
  const testSize = '72px'
  
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  
  // Measure with fallback font
  context.font = `${testSize} monospace`
  const fallbackWidth = context.measureText(testString).width
  
  // Measure with requested font
  context.font = `${testSize} ${fontFamily}, monospace`
  const testWidth = context.measureText(testString).width
  
  return testWidth !== fallbackWidth
}

/**
 * Font fallback system
 */
export const getFallbackFont = (primaryFont) => {
  const fallbacks = {
    'Open Sans': 'Arial, sans-serif',
    'Inter': 'Helvetica, sans-serif',
    'Monaco': 'Consolas, monospace'
  }
  
  return fallbacks[primaryFont] || 'sans-serif'
}

/**
 * Dynamic font loading with error handling
 */
export const loadFont = async (fontFamily, fontWeight = 400, fontStyle = 'normal') => {
  if (typeof FontFace === 'undefined') {
    console.warn('FontFace API not supported')
    return false
  }

  try {
    // This is a placeholder - in a real implementation you'd load from a font file
    const fontFace = new FontFace(
      fontFamily,
      `url('https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@${fontWeight}&display=swap')`,
      { weight: fontWeight, style: fontStyle }
    )

    await fontFace.load()
    document.fonts.add(fontFace)
    return true
  } catch (error) {
    console.error(`Failed to load font ${fontFamily}:`, error)
    return false
  }
}

export { fontConfig, getFontStyles, getFontCSSVars, getFontTailwindClasses }