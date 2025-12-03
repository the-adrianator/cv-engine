# Testing OpenAI Integration

## Quick Test Guide

### Option 1: Use the Test Page (Recommended)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:3000/test-openai`

3. **Click "Test OpenAI Analysis"** button

4. **Check results:**
   - Should see scores and feedback if successful
   - Check error message if something is wrong

### Option 2: Test with Real CV Upload

1. **Upload a CV:**
   - Go to `/upload`
   - Fill in the form and upload a PDF CV
   - Wait for upload to complete

2. **Check the database:**
   - The CV record should have `feedback` field populated
   - Check Supabase dashboard or use the CV detail page

3. **View results:**
   - Navigate to `/cv/{cv-id}` (will be created in next task)
   - Or check the database directly

### Option 3: Test API Directly

```bash
# Replace with actual values
curl -X POST http://localhost:3000/api/cvs/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "cvId": "test-id",
    "imageUrl": "https://public-image-url.com/cv.png",
    "jobTitle": "Software Engineer",
    "jobDescription": "Job description here..."
  }'
```

## Common Issues

### 1. "OpenAI API key is not configured"
- **Solution:** Add `OPENAI_API_KEY=sk-...` to `.env.local`
- Restart the dev server after adding

### 2. "Failed to analyze CV"
- Check OpenAI API key is valid
- Check image URL is publicly accessible
- Check OpenAI API quota/limits
- Check server logs for detailed error

### 3. "Invalid feedback format"
- OpenAI returned unexpected format
- Check server logs for the actual response
- May need to adjust prompt or model

### 4. Analysis not triggering after upload
- Check `NEXT_PUBLIC_APP_URL` is set correctly
- Check server logs for fetch errors
- Background job may have failed silently

## Expected Response Format

```json
{
  "success": true,
  "feedback": {
    "overallScore": 85,
    "ATS": {
      "score": 90,
      "tips": [
        { "type": "good", "tip": "Well-structured format" },
        { "type": "improve", "tip": "Add more keywords" }
      ]
    },
    "toneAndStyle": {
      "score": 80,
      "tips": [
        {
          "type": "good",
          "tip": "Professional tone",
          "explanation": "Your CV maintains a professional tone..."
        }
      ]
    },
    "content": { ... },
    "structure": { ... },
    "skills": { ... }
  }
}
```

## Cost Monitoring

- Each analysis costs ~$0.01-0.03
- Monitor usage at https://platform.openai.com/usage
- Set up usage alerts if needed

## Next Steps After Testing

Once testing is successful:
1. ✅ OpenAI integration is working
2. Proceed to Task 8: Usage Tracking
3. Add rate limiting for production
4. Implement retry logic for failed analyses

