'use client'
import { useEffect } from 'react'
import { getLastViewedGallery, getStoredGalleryPath, storePreviousExercisePath, GALLERY_TYPES } from '@/utils/navigation'

// This is a redirect page that sends the user to their last viewed gallery page
// This can be the main gallery, palette gallery, or a specific series page
export default function GalleryEntryPage() {
  useEffect(() => {
    // Store the current path as the previous path before navigating to gallery
    // This allows the user to return to this page later
    storePreviousExercisePath();

    // Try to get the stored gallery path first (includes series pages)
    const storedPath = getStoredGalleryPath();

    console.log(`🔄 Redirecting to last viewed gallery path: ${storedPath}`);

    // Set a flag that we're entering the gallery from an exercise
    sessionStorage.setItem('galleryEnteredFrom', window.location.pathname);
    sessionStorage.setItem('galleryEnteredAt', new Date().toISOString());

    // Redirect to the stored gallery path
    window.location.href = storedPath;
  }, []);
  
  // Show a simple loading message while redirecting (no spinner needed for quick redirect)
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#2A2A2A]">
      <div className="text-[#AEAEAE]">Loading Gallery...</div>
    </div>
  );
}
