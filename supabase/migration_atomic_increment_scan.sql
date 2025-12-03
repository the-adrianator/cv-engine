-- Migration: Atomic increment scan count function
-- This replaces the read-modify-write pattern with a database-level atomic operation
-- to prevent race conditions when multiple requests increment the count simultaneously

CREATE OR REPLACE FUNCTION increment_scan_count(p_user_id TEXT)
RETURNS usage_tracking AS $$
DECLARE
  result usage_tracking;
BEGIN
  -- First, ensure the row exists (INSERT ON CONFLICT)
  INSERT INTO usage_tracking (user_id, scans_this_month, total_scans, last_reset_date)
  VALUES (p_user_id, 0, 0, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  -- Now perform atomic increment with monthly reset logic
  UPDATE usage_tracking
  SET 
    scans_this_month = CASE 
      WHEN EXTRACT(MONTH FROM last_reset_date) != EXTRACT(MONTH FROM CURRENT_DATE)
           OR EXTRACT(YEAR FROM last_reset_date) != EXTRACT(YEAR FROM CURRENT_DATE)
      THEN 1
      ELSE scans_this_month + 1
    END,
    total_scans = total_scans + 1,
    last_reset_date = CASE 
      WHEN EXTRACT(MONTH FROM last_reset_date) != EXTRACT(MONTH FROM CURRENT_DATE)
           OR EXTRACT(YEAR FROM last_reset_date) != EXTRACT(YEAR FROM CURRENT_DATE)
      THEN CURRENT_DATE
      ELSE last_reset_date
    END,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO result;

  -- If no row was updated (shouldn't happen after INSERT, but safety check)
  IF result IS NULL THEN
    -- Try to get the row that was just inserted
    SELECT * INTO result FROM usage_tracking WHERE user_id = p_user_id;
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users (or service role)
-- Note: Since we're using Clerk, this will be called via service role key
GRANT EXECUTE ON FUNCTION increment_scan_count(TEXT) TO service_role;

