-- Migration: Add analysis_status field to cvs table
-- This field tracks the status of CV analysis: 'pending', 'succeeded', or 'failed'
ALTER TABLE cvs
ADD COLUMN IF NOT EXISTS analysis_status TEXT DEFAULT 'pending' CHECK (
	analysis_status IN ('pending', 'succeeded', 'failed')
);

-- Add analysis_error field to store error details when analysis fails
ALTER TABLE cvs
ADD COLUMN IF NOT EXISTS analysis_error TEXT;

-- Create index for faster queries by analysis status
CREATE INDEX IF NOT EXISTS idx_cvs_analysis_status ON cvs (analysis_status);

-- Update existing records to have 'succeeded' status if they have feedback
UPDATE cvs
SET
	analysis_status = 'succeeded'
WHERE
	feedback IS NOT NULL
	AND analysis_status = 'pending';