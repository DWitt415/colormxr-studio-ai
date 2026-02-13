# ColorMXR Pro - Project Summary

## Project Overview
ColorMXR Pro is a Next.js web application for creating, managing, and viewing color compositions and palettes. The app features a shapeset creator, gallery system, and series management functionality.

## Tech Stack
- **Framework**: Next.js (React)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI (@headlessui/react)
- **Authentication**: Supabase Auth

## Project Structure
```
/app
  /gallery
    page.jsx - Main gallery page (compositions & series)
    /series/[id]/page.jsx - Series detail page
  /shapeset-creator - Shapeset creation tool
  /welcome - Landing/welcome page
/components
  /Modals
    ImportSVGModal.jsx - SVG import functionality
    SeriesGalleryAddModal.jsx - Add items to series
    NewShapesetModal.jsx - Create new shapeset configurations
    LightboxModal.jsx - Full-screen image viewer
  Header.tsx - Main navigation header
  GalleryFooter.jsx - Gallery footer
  ColorControllerUI.js - RGB color controller with sliders
/utils
  supabase.js - Supabase client configuration
  navigation.js - Navigation utilities
```

## Database Schema

### Tables

#### `series_gallery`
- `id` (primary key)
- `name` (text) - Series name
- `type` (text) - 'composition' or 'palette'
- `thumbnail_id` (foreign key) - References item to use as thumbnail
- `created_at` (timestamp)

#### `shapeset_gallery` (compositions)
- `id` (primary key)
- `filename` (text) - Storage filename
- `svg_content` (text) - Optional inline SVG
- `shape_colors` (jsonb) - Array of color values
- `background_color` (text) - Background color
- `series_id` (foreign key, nullable) - References series_gallery
- `created_at` (timestamp)

#### `palette_gallery`
- Similar structure to `shapeset_gallery`
- For color palette items

### Row Level Security (RLS) Policies

**Required policies for each table:**
- SELECT: `Anyone can view [table] items` - Target: `public`
- INSERT: `Authenticated users can insert [table] items` - Target: `authenticated`
- DELETE: `Authenticated users can delete [table] items` - Target: `authenticated`
- UPDATE: `Authenticated users can update [table] items` - Target: `authenticated` (if needed)

**Important**: Without DELETE policies, deletions will silently fail even though they appear successful in the UI.

## Key Features

### Gallery System
- **Main Gallery** (`/app/gallery/page.jsx`)
  - Displays series (grouped compositions) and individual compositions
  - Grid layout with thumbnails
  - Delete functionality for both series and individual items
  - Lightbox modal for viewing full-size images
  - Navigation between items in lightbox (circular)

- **Series Detail View** (`/app/gallery/series/[id]/page.jsx`)
  - Shows all items within a series
  - Set series thumbnail
  - Delete items from series
  - Back navigation to main gallery

### Shapeset Creator
- Multiple layout modes: Grid, Cosmic, Radiant
- URL parameter-based configuration
- Color mixing and manipulation
- Export to SVG
- Save to gallery with series assignment

### Import/Export
- **Import SVG**: Parse ColorMXR SVG files and reconstruct shapesets
- **Export**: Save compositions to Supabase storage and database

### Modal Components
- **ImportSVGModal**: File upload, SVG parsing, shape/color extraction
- **SeriesGalleryAddModal**: Auto-generates sequential series names (MM-DD-YYYY format)
- **NewShapesetModal**: Configure layout parameters before creation
- **LightboxModal**: Full-screen viewing with navigation

## Recent Bug Fixes & Improvements (This Session)

### 1. Delete Button Visibility (Series Detail)
- **Issue**: Delete buttons not visible in 80px tall thumbnails
- **Fix**: Reduced icon sizes from h-6 w-6 to h-4 w-4, padding from p-2 to p-1.5, gap from gap-4 to gap-2
- **Files**: `/app/gallery/series/[id]/page.jsx` (lines 456-500)

### 2. Modal Cancel Button Styling
- **Issue**: Cancel buttons had visible borders
- **Fix**: Removed borders from cancel/back buttons across all modals
- **Files**:
  - `NewShapesetModal.jsx` (line 114-126)
  - `SeriesGalleryAddModal.jsx` (lines 237, 257)
  - `ImportSVGModal.jsx` (line 254)

### 3. Database Deletion Issue (CRITICAL FIX)
- **Issue**: Deleted items reappeared after page reload
- **Root Cause**: Missing DELETE policies in Supabase RLS
- **Fix**:
  1. Simplified deletion logic to prioritize database deletion
  2. Added verification step to confirm deletion
  3. Removed localStorage workaround (was masking the real issue)
  4. Added detailed console logging with emojis (🗑️, ✅, ❌)
  5. **Required SQL policies** (see Database Schema section above)
- **Files**:
  - `/app/gallery/page.jsx` (lines 109-171, 210-295)
  - `/app/gallery/series/[id]/page.jsx` (lines 195-281)

### 4. Item Count & Labels
- **Issue**: Item count badges didn't update after deletions, always plural
- **Fix**:
  - Filter deleted items before counting
  - Conditional singular/plural text: `{count} {count === 1 ? 'item' : 'items'}`
- **Files**: `/app/gallery/page.jsx` (line 558)

### 5. Series Deletion Enhancement
- **Issue**: Deleting series didn't delete items inside
- **Fix**: Cascade delete - when series is deleted, all items in series are also deleted
- **Files**: `/app/gallery/page.jsx` (lines 210-295)

### 6. Delete Button Standardization
- **Issue**: Inconsistent delete button styling between views
- **Fix**: Made all delete buttons use same sizing (h-4 w-4, p-1.5, gap-2) and red background
- **Files**: `/app/gallery/page.jsx` (lines 671-679)

## Deletion Flow (Current Implementation)

### Individual Item Deletion
1. User confirms deletion
2. **Database record deleted** (with `.select()` to verify)
3. Verification query checks item no longer exists
4. Storage file deleted (if exists)
5. UI state updated
6. Console logs each step with emojis

### Series Deletion (with cascade)
1. User confirms deletion
2. Fetch all items in series
3. Delete all storage files for items
4. **Delete all database records** for items in series
5. **Delete series record** from series_gallery
6. UI state updated
7. Refresh individual items list

## Important Code Patterns

### Supabase Deletion Pattern
```javascript
const { error: dbError, data: deleteResult } = await supabase
    .from('table_name')
    .delete()
    .eq('id', itemId)
    .select(); // Important: returns deleted rows for verification

if (dbError) {
    throw new Error(`Database deletion failed: ${dbError.message}`);
}
```

### Series Name Generation
```javascript
// Format: MM-DD-YYYY series N
const now = new Date();
const dateString = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
}).replace(/\//g, '-');

// Find highest N for this date and increment
const nextNumber = Math.max(0, ...existingNumbers) + 1;
return `${dateString} series ${nextNumber}`;
```

### Fetch with Visibility Refresh
```javascript
useEffect(() => {
    fetchAllGalleryData();

    // Refetch when page becomes visible (returning from other pages)
    const handleVisibilityChange = () => {
        if (!document.hidden) {
            fetchAllGalleryData();
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [])
```

## Common Issues & Solutions

### Issue: Deleted items reappear after reload
**Solution**: Check Supabase RLS policies - ensure DELETE policy exists for authenticated users

### Issue: Silent deletion failures
**Solution**: Always use `.select()` after delete and check for errors explicitly

### Issue: localStorage workarounds
**Solution**: Avoid - fix the actual database/permission issue instead

### Issue: Race conditions with state updates
**Solution**: Read directly from database/localStorage when filtering, don't rely on async state

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Development Notes
- Use emojis in console logs for easy debugging (🗑️ delete, ✅ success, ❌ error, ⚠️ warning)
- Always verify database operations complete successfully
- Delete operations should happen in order: Database → Storage → UI
- Use confirmation dialogs for destructive actions
- Circular navigation in lightbox (first ↔ last)
- Auto-generated series names use MM-DD-YYYY format with sequential numbering

## TODO / Future Improvements
- Add UPDATE policies if users need to edit items
- Consider soft deletes (deleted_at column) for data recovery
- Add batch delete functionality
- Implement search/filter in gallery
- Add pagination for large galleries
- Consider adding user ownership (user_id column) for multi-user support
