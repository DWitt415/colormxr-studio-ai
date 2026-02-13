/**
 * Colormxr Font Configuration
 * 
 * This configuration object defines the font system used across the application.
 * Use this to maintain consistent typography and easily switch font families.
 */

export const fontConfig = {
  // Font Families
  families: {
    primary: "'Open Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    secondary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
    mono: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace"
  },

  // Font Sizes (in rem and px equivalents)
  sizes: {
    xs: { rem: '0.75rem', px: '12px' },
    sm: { rem: '0.875rem', px: '14px' },
    base: { rem: '1rem', px: '16px' },
    lg: { rem: '1.125rem', px: '18px' },
    xl: { rem: '1.25rem', px: '20px' },
    '2xl': { rem: '1.5rem', px: '24px' },
    '3xl': { rem: '1.875rem', px: '30px' },
    '4xl': { rem: '2.25rem', px: '36px' }
  },

  // Font Weights
  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },

  // Line Heights
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },

  // Component-specific font styles
  components: {
    modalTitle: {
      fontFamily: 'primary',
      fontSize: 'lg',
      fontWeight: 'semibold',
      lineHeight: 'tight'
    },
    modalBody: {
      fontFamily: 'primary',
      fontSize: 'base',
      fontWeight: 'normal',
      lineHeight: 'normal'
    },
    buttonText: {
      fontFamily: 'primary',
      fontSize: 'sm',
      fontWeight: 'medium',
      lineHeight: 'tight'
    },
    footerText: {
      fontFamily: 'primary',
      fontSize: 'sm',
      fontWeight: 'normal',
      lineHeight: 'normal'
    },
    galleryItemText: {
      fontFamily: 'primary',
      fontSize: 'xs',
      fontWeight: 'normal',
      lineHeight: 'tight'
    }
  }
}

/**
 * Helper function to get font styles for inline CSS
 * @param {string} component - Component name from fontConfig.components
 * @returns {object} - CSS style object
 */
export const getFontStyles = (component) => {
  const config = fontConfig.components[component]
  if (!config) {
    console.warn(`Font component '${component}' not found in fontConfig`)
    return {}
  }

  return {
    fontFamily: fontConfig.families[config.fontFamily],
    fontSize: fontConfig.sizes[config.fontSize].rem,
    fontWeight: fontConfig.weights[config.fontWeight],
    lineHeight: fontConfig.lineHeights[config.lineHeight]
  }
}

/**
 * Helper function to get CSS custom property names
 * @param {string} component - Component name from fontConfig.components
 * @returns {object} - CSS custom property names
 */
export const getFontCSSVars = (component) => {
  const config = fontConfig.components[component]
  if (!config) {
    console.warn(`Font component '${component}' not found in fontConfig`)
    return {}
  }

  return {
    fontFamily: `var(--font-${config.fontFamily})`,
    fontSize: `var(--font-size-${config.fontSize})`,
    fontWeight: `var(--font-weight-${config.fontWeight})`,
    lineHeight: `var(--line-height-${config.lineHeight})`
  }
}

/**
 * Helper function to generate Tailwind classes
 * @param {string} component - Component name from fontConfig.components
 * @returns {string} - Space-separated Tailwind class names
 */
export const getFontTailwindClasses = (component) => {
  const config = fontConfig.components[component]
  if (!config) {
    console.warn(`Font component '${component}' not found in fontConfig`)
    return ''
  }

  const classes = [
    `font-${config.fontFamily}`,
    `text-${config.fontSize}`,
    `font-${config.fontWeight}`,
    `leading-${config.lineHeight}`
  ]

  return classes.join(' ')
}

export default fontConfig