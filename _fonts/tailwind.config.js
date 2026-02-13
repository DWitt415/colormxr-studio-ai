/* Tailwind CSS Font Configuration */

module.exports = {
  theme: {
    extend: {
      fontFamily: {
        'primary': ['Open Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'secondary': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', 'monospace'],
        // Legacy support - maps to primary
        'sans': ['Open Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.25' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.375' }],    // 14px  
        'base': ['1rem', { lineHeight: '1.5' }],        // 16px
        'lg': ['1.125rem', { lineHeight: '1.5' }],      // 18px
        'xl': ['1.25rem', { lineHeight: '1.5' }],       // 20px
        '2xl': ['1.5rem', { lineHeight: '1.375' }],     // 24px
        '3xl': ['1.875rem', { lineHeight: '1.25' }],    // 30px
        '4xl': ['2.25rem', { lineHeight: '1.25' }]      // 36px
      },
      fontWeight: {
        'light': '300',
        'normal': '400', 
        'medium': '500',
        'semibold': '600',
        'bold': '700',
        'extrabold': '800'
      },
      lineHeight: {
        'tight': '1.25',
        'snug': '1.375', 
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2'
      }
    }
  },
  
  // Safelist important font classes to prevent purging
  safelist: [
    // Font families
    'font-primary',
    'font-secondary', 
    'font-mono',
    'font-sans',
    
    // Font sizes
    'text-xs',
    'text-sm',
    'text-base', 
    'text-lg',
    'text-xl',
    'text-2xl',
    'text-3xl',
    'text-4xl',
    
    // Font weights
    'font-light',
    'font-normal',
    'font-medium',
    'font-semibold', 
    'font-bold',
    'font-extrabold',
    
    // Line heights
    'leading-tight',
    'leading-snug',
    'leading-normal',
    'leading-relaxed', 
    'leading-loose',

    // Component combinations
    {
      pattern: /(font|text|leading)-(primary|secondary|mono|xs|sm|base|lg|xl|2xl|3xl|4xl|light|normal|medium|semibold|bold|extrabold|tight|snug|relaxed|loose)/
    }
  ]
}