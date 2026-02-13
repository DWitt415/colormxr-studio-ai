# Database Migrations

This directory contains SQL migration scripts for the Supabase database. These files document the database schema and changes over time.

## Files Overview

- **supabase-setup.sql**: Initial setup script for creating tables and storage buckets
- **fix-rls-policies.sql**: Scripts to set up or fix Row Level Security policies
- **create-series-tables.sql**: Creates tables for managing series/collections
- **create-exec-sql-function.sql**: Creates utility SQL functions
- **fix-palette-gallery.sql**: Updates to the palette gallery table structure
- **complete-storage-fix.sql**: Fixes for storage bucket configurations
- **add-svg-content-column.sql**: Schema update to add SVG content storage

## Usage

These files are primarily for documentation and reproducibility. They've already been executed in the production Supabase instance.

If you need to recreate the database structure:

1. Log in to the Supabase dashboard
2. Navigate to the SQL Editor
3. Execute these scripts in the appropriate order (usually starting with supabase-setup.sql)

## Order of Execution

When setting up a new environment, execute scripts in this order:

1. supabase-setup.sql
2. fix-rls-policies.sql  
3. create-series-tables.sql
4. Other scripts as needed

## Notes

- Database tables use underscores in their names (e.g., `palette_gallery`)
- Storage buckets use hyphens instead (e.g., `palette-gallery`)