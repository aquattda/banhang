-- Fix games table: Add display_order column if not exists
-- Run this script if you get error: "Unknown column 'display_order' in 'field list'"

ALTER TABLE games 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 AFTER is_active;

-- Add index for better performance
ALTER TABLE games 
ADD INDEX IF NOT EXISTS idx_display_order (display_order);

-- Verify the table structure
DESCRIBE games;
