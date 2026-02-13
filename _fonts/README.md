# Font System for Colormxr Monorepo

This directory contains a comprehensive font system designed for the Colormxr monorepo. It provides consistent typography across all applications while maintaining flexibility for customization.

## 📁 Directory Contents

```
_fonts/
├── fonts.css              # Main CSS with Google Fonts imports and utility classes
├── fontConfig.js           # JavaScript configuration object with helper functions
├── fontLoader.js           # Font loading utilities and performance optimizations
├── tailwind.config.js      # Tailwind CSS font configuration
└── README.md              # This documentation
```

## 🎯 Font Stack

### **Primary Font: Open Sans**
- **Usage:** Body text, buttons, modals, general UI
- **Weights:** 300 (Light), 400 (Normal), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold)
- **Fallbacks:** system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif

### **Secondary Font: Inter**
- **Usage:** Headings, special emphasis, alternative styling
- **Weights:** 100-900 (Full range)
- **Fallbacks:** system-ui, Helvetica, sans-serif

### **Monospace Font: Monaco**
- **Usage:** Code, technical text, data display
- **Fallbacks:** Menlo, Ubuntu Mono, Consolas, source-code-pro, monospace

## 🚀 Implementation Methods

### **Method 1: CSS Custom Properties (Recommended)**
```css
/* Import the main font file */
@import '../_fonts/fonts.css';

.my-component {
  font-family: var(--font-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}
```

### **Method 2: JavaScript Configuration**
```javascript
import { getFontStyles } from '../_fonts/fontConfig.js'

const MyComponent = () => {
  const titleStyles = getFontStyles('modalTitle')
  
  return (
    <h2 style={titleStyles}>
      Modal Title
    </h2>
  )
}
```

### **Method 3: Tailwind Classes**
```jsx
// Import Tailwind config
// Add _fonts/tailwind.config.js to your tailwind.config.js extends

<div className="font-primary text-lg font-medium leading-normal">
  Styled with Tailwind
</div>
```

### **Method 4: CSS Classes**
```jsx
// Import fonts.css in your main CSS file
<div className="modal-title">
  Pre-styled Modal Title
</div>
```

## 🔧 Integration Guide

### **1. For Next.js Applications**
```javascript
// pages/_app.js or app/layout.js
import '../_fonts/fonts.css'
// or
import { preloadFonts } from '../_fonts/fontLoader.js'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    preloadFonts() // For performance optimization
  }, [])
  
  return <Component {...pageProps} />
}
```

### **2. For Tailwind CSS**
```javascript
// tailwind.config.js
const fontConfig = require('./_fonts/tailwind.config.js')

module.exports = {
  // Extend your existing config with font configuration
  theme: {
    extend: {
      ...fontConfig.theme.extend
    }
  },
  safelist: [
    ...fontConfig.safelist
  ]
}
```

### **3. For CSS-in-JS Libraries**
```javascript
import { createFontStyle } from '../_fonts/fontLoader.js'

const StyledComponent = styled.div`
  ${props => createFontStyle('modalTitle', { color: props.color })}
`
```

## 📋 Available Font Components

Pre-configured font styles for common UI components:

| Component | Font Family | Size | Weight | Line Height |
|-----------|-------------|------|---------|-------------|
| `modalTitle` | Open Sans | 18px | Semibold | 1.25 |
| `modalBody` | Open Sans | 16px | Normal | 1.5 |
| `buttonText` | Open Sans | 14px | Medium | 1.25 |
| `footerText` | Open Sans | 14px | Normal | 1.5 |
| `galleryItemText` | Open Sans | 12px | Normal | 1.25 |

### **Usage Examples:**
```javascript
// JavaScript
const styles = getFontStyles('modalTitle')

// CSS Classes  
<div className="modal-title">Title</div>

// Tailwind
<div className="font-primary text-lg font-semibold leading-tight">Title</div>

// CSS Variables
.custom-title {
  font-family: var(--font-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}
```

## ⚡ Performance Features

### **Font Preloading**
```javascript
import { preloadFonts } from '../_fonts/fontLoader.js'

// Call early in your app lifecycle
preloadFonts()
```

### **Font Loading Detection**
```javascript
import { checkFontsLoaded } from '../_fonts/fontLoader.js'

const isReady = await checkFontsLoaded()
if (isReady) {
  // Fonts are loaded, safe to render
}
```

### **Fallback Detection**
```javascript
import { isFontAvailable } from '../_fonts/fontLoader.js'

if (!isFontAvailable('Open Sans')) {
  // Use fallback styling
}
```

## 🎨 Customization

### **Adding New Font Sizes**
```javascript
// In fontConfig.js
sizes: {
  // ... existing sizes
  'huge': { rem: '3rem', px: '48px' }
}
```

### **Adding New Components**
```javascript
// In fontConfig.js
components: {
  // ... existing components
  heroTitle: {
    fontFamily: 'primary',
    fontSize: 'huge',
    fontWeight: 'bold',
    lineHeight: 'tight'
  }
}
```

### **Using Different Fonts**
```css
/* Update CSS custom properties */
:root {
  --font-primary: 'Your Font', fallback, sans-serif;
}
```

## 🔍 Utility Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `getFontStyles()` | Get inline CSS object | `getFontStyles('modalTitle')` |
| `getFontCSSVars()` | Get CSS custom properties | `getFontCSSVars('buttonText')` |
| `getFontTailwindClasses()` | Get Tailwind class string | `getFontTailwindClasses('footerText')` |
| `createFontStyle()` | Create React style object | `createFontStyle('modalBody', { color: 'red' })` |

## 📱 Responsive Considerations

The font system includes responsive scaling built into the CSS custom properties:

```css
/* Automatically scales on smaller devices */
@media (max-width: 768px) {
  :root {
    --font-size-base: 0.9rem;
    --font-size-lg: 1rem;
  }
}
```

## 🐛 Troubleshooting

### **Fonts Not Loading**
1. Check network requests in browser dev tools
2. Verify Google Fonts URLs are accessible
3. Use `checkFontsLoaded()` to debug loading state

### **Inconsistent Typography**
1. Ensure fonts.css is imported before component styles
2. Check CSS specificity conflicts
3. Use browser dev tools to inspect computed styles

### **Performance Issues**
1. Use `preloadFonts()` for critical fonts
2. Consider using `font-display: swap` for non-critical fonts
3. Limit font weights and styles to reduce payload

## 📄 Browser Support

- **Modern Browsers:** Full support (Chrome 60+, Firefox 60+, Safari 12+, Edge 79+)
- **Legacy Browsers:** Graceful fallback to system fonts
- **Mobile:** Full support on iOS 12+, Android 7+

---

*Font System v1.0 - Designed for Colormxr Monorepo*