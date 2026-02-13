// Function to store the current path in session storage before navigating to gallery
// This should be called before navigating to gallery to remember where we came from

// Default exercise paths to try if there's no stored path
const DEFAULT_EXERCISE_PATHS = [
  '/exercise/section4/ex-5-4',   // First choice
  '/exercise/section4/spectrum', // Second choice
  '/exercise/section1/ex-3-1'    // Third choice
];

// Constants for gallery types
export const GALLERY_TYPES = {
  PALETTES: 'palettes',
  COMPOSITIONS: 'compositions'
};

// Functions for gallery state management
export const storeLastViewedGallery = (galleryType) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('lastViewedGallery', galleryType);
      console.log('🖼️ Stored last viewed gallery:', galleryType);
    } catch (error) {
      console.error('Error storing last viewed gallery:', error);
    }
  }
};

export const getLastViewedGallery = () => {
  if (typeof window !== 'undefined') {
    try {
      const lastGallery = localStorage.getItem('lastViewedGallery');
      return lastGallery || GALLERY_TYPES.PALETTES; // Default to palettes if none stored
    } catch (error) {
      console.error('Error getting last viewed gallery:', error);
      return GALLERY_TYPES.PALETTES; // Default to palettes on error
    }
  }
  return GALLERY_TYPES.PALETTES; // Default if not in browser context
};

export const storePreviousExercisePath = () => {
  if (typeof window !== 'undefined') {
    try {
      // Store the current path as the previous exercise path
      const currentPath = window.location.pathname;
      
      // Only store if it's an exercise path (not login, gallery, etc.)
      if (currentPath.includes('/exercise/')) {
        // Store in both sessionStorage (primary) and localStorage (backup)
        sessionStorage.setItem('prevExercisePath', currentPath);
        localStorage.setItem('lastExercisePath', currentPath);
        console.log('📝 Stored exercise path in both storages:', currentPath);
      }
    } catch (error) {
      console.error('Error storing previous exercise path:', error);
    }
  }
};

// Function to clean up old color persistence data
export const cleanupOldColorData = () => {
  if (typeof window !== 'undefined') {
    try {
      // Get all localStorage keys that start with our color prefix
      const colorKeys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('colormxr_colors_/exercise/')) {
          colorKeys.push(key);
        }
      }
      
      // Clean up color data older than 24 hours
      const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
      
      colorKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.timestamp && parsed.timestamp < oneDayAgo) {
              localStorage.removeItem(key);
              console.log('🧹 Cleaned up old color data:', key);
            }
          }
        } catch (e) {
          // If parsing fails, remove the corrupted data
          localStorage.removeItem(key);
          console.log('🧹 Removed corrupted color data:', key);
        }
      });
    } catch (error) {
      console.error('Error cleaning up old color data:', error);
    }
  }
};

// Helper to verify if a path is a valid exercise path
const isValidExercisePath = (path) => {
  if (!path || typeof path !== 'string') return false;
  
  // Check if it's an exercise path
  if (!path.includes('/exercise/')) return false;
  
  // Additional validation - should have a section and exercise ID
  const parts = path.split('/').filter(Boolean);
  return parts.length >= 3 && parts[0] === 'exercise';
};

// Function to get the stored previous exercise path
export const getPreviousExercisePath = () => {
  if (typeof window !== 'undefined') {
    try {
      // First check sessionStorage
      const storedPath = sessionStorage.getItem('prevExercisePath');
      
      // Check if the storedPath exists and is a valid exercise path
      if (storedPath && isValidExercisePath(storedPath)) {
        console.log('✅ Using stored path:', storedPath);
        return storedPath;
      } 
      
      // If not found in sessionStorage, check localStorage as fallback
      const localStoragePath = localStorage.getItem('lastExercisePath');
      if (localStoragePath && isValidExercisePath(localStoragePath)) {
        console.log('📌 Using fallback path from localStorage:', localStoragePath);
        return localStoragePath;
      }
      
      // Try to get history from localStorage
      try {
        const history = JSON.parse(localStorage.getItem('exerciseHistory') || '[]');
        if (history.length > 0) {
          const lastPath = history[history.length - 1];
          if (isValidExercisePath(lastPath)) {
            console.log('📚 Using path from history:', lastPath);
            return lastPath;
          }
        }
      } catch (e) {
        console.error('Error parsing exercise history:', e);
      }
      
      // Try to get the referrer URL if available
      const referrer = document.referrer;
      if (referrer && referrer.includes('/exercise/')) {
        try {
          const referrerPath = new URL(referrer).pathname;
          if (isValidExercisePath(referrerPath)) {
            console.log('🔍 Using referrer path:', referrerPath);
            return referrerPath;
          }
        } catch (e) {
          console.error('Error parsing referrer URL:', e);
        }
      }
      
      // If all else fails, use the first available default path
      console.log('⚠️ No valid stored exercise path found, using default');
      return DEFAULT_EXERCISE_PATHS[0];
    } catch (error) {
      console.error('Error getting previous exercise path:', error);
      return DEFAULT_EXERCISE_PATHS[0];
    }
  }
  return DEFAULT_EXERCISE_PATHS[0];
};

// Debug utility to check all session storage 
export const debugSessionStorage = () => {
  if (typeof window !== 'undefined') {
    try {
      console.log('🔍 --- Navigation Debug ---');
      console.log('Session Storage - prevExercisePath:', sessionStorage.getItem('prevExercisePath'));
      console.log('Session Storage - returningFromGallery:', sessionStorage.getItem('returningFromGallery'));
      console.log('Session Storage - galleryEnteredFrom:', sessionStorage.getItem('galleryEnteredFrom'));
      console.log('Session Storage - galleryEnteredAt:', sessionStorage.getItem('galleryEnteredAt'));
      console.log('Local Storage - lastExercisePath:', localStorage.getItem('lastExercisePath'));
      console.log('Local Storage - lastViewedGallery:', localStorage.getItem('lastViewedGallery'));
      try {
        console.log('Local Storage - exerciseHistory:', JSON.parse(localStorage.getItem('exerciseHistory') || '[]'));
      } catch (e) {
        console.log('Local Storage - exerciseHistory: [error parsing]');
      }
      console.log('Current path:', window.location.pathname);
      console.log('Document referrer:', document.referrer);
      console.log('--------------------------');
    } catch (error) {
      console.error('Error debugging storage:', error);
    }
  }
};