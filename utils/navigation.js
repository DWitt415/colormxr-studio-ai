// Function to store the current path in session storage before navigating to gallery
// This should be called before navigating to gallery to remember where we came from

// Default path to use if there's no stored path
const DEFAULT_PATH = '/welcome';

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

// Store the exact gallery path (including series pages)
export const storeGalleryPath = (path) => {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('lastGalleryPath', path);
      localStorage.setItem('lastGalleryPath', path);
      console.log('📍 Stored gallery path:', path);
    } catch (error) {
      console.error('Error storing gallery path:', error);
    }
  }
};

// Get the stored gallery path
export const getStoredGalleryPath = () => {
  if (typeof window !== 'undefined') {
    try {
      // Try sessionStorage first
      const sessionPath = sessionStorage.getItem('lastGalleryPath');
      if (sessionPath) {
        console.log('✅ Retrieved gallery path from session:', sessionPath);
        return sessionPath;
      }

      // Fallback to localStorage
      const localPath = localStorage.getItem('lastGalleryPath');
      if (localPath) {
        console.log('✅ Retrieved gallery path from local storage:', localPath);
        return localPath;
      }

      // Default to main compositions gallery
      console.log('⚠️ No stored gallery path, using default');
      return '/gallery';
    } catch (error) {
      console.error('Error getting gallery path:', error);
      return '/gallery';
    }
  }
  return '/gallery';
};

export const storePreviousExercisePath = () => {
  if (typeof window !== 'undefined') {
    try {
      // Store the current path as the previous path
      const currentPath = window.location.pathname;
      const currentSearch = window.location.search;
      const fullPath = currentPath + currentSearch;

      // Store if it's an exercise path, shapeset-creator, or welcome page (not login, gallery, etc.)
      if (currentPath.includes('/exercise/') ||
          currentPath.includes('/shapeset-creator') ||
          currentPath === '/welcome') {
        // Store in both sessionStorage (primary) and localStorage (backup)
        sessionStorage.setItem('prevExercisePath', fullPath);
        localStorage.setItem('lastExercisePath', fullPath);
        console.log('📝 Stored path in both storages:', fullPath);
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

// Helper to verify if a path is a valid return path
const isValidExercisePath = (path) => {
  if (!path || typeof path !== 'string') return false;

  // Check if it's a shapeset-creator path
  if (path.includes('/shapeset-creator')) return true;

  // Check if it's the welcome page
  if (path === '/welcome') return true;

  // Check if it's an exercise path
  if (!path.includes('/exercise/')) return false;

  // Additional validation - should have a section and exercise ID
  const parts = path.split('?')[0].split('/').filter(Boolean);
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
      
      // If all else fails, use the default path (welcome page)
      console.log('⚠️ No valid stored path found, using default (welcome)');
      return DEFAULT_PATH;
    } catch (error) {
      console.error('Error getting previous exercise path:', error);
      return DEFAULT_PATH;
    }
  }
  return DEFAULT_PATH;
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
