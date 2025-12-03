# Debugging CV Analysis Issues

## Problem
CV analysis is not completing - stuck on "Analyzing Your CV" screen.

## Debugging Steps

### 1. Check Server Logs
When you upload a CV, check the terminal where `npm run dev` is running. You should see:
- "Triggering CV analysis: ..."
- "CV Analysis API called"
- "Calling OpenAI API..."
- "Analysis successful, returning feedback"
- "CV analysis complete and saved successfully"

### 2. Check Browser Console
Open browser DevTools (F12) and check:
- Network tab: Look for `/api/cvs/analyze` request
- Console tab: Check for any errors

### 3. Common Issues

#### Issue: Analysis not triggered
**Symptoms:** No logs about "Triggering CV analysis"
**Check:**
- Is `NEXT_PUBLIC_APP_URL` set correctly in `.env.local`?
- Check upload route logs for errors

#### Issue: Analysis triggered but fails
**Symptoms:** See "CV Analysis API called" but then errors
**Check:**
- Is `OPENAI_API_KEY` set in `.env.local`?
- Check if signed URL is being generated correctly
- Check OpenAI API quota/limits

#### Issue: OpenAI returns error
**Symptoms:** See "OpenAI analysis error" in logs
**Check:**
- OpenAI API key is valid
- Signed URL is accessible (test in browser)
- OpenAI API quota not exceeded

#### Issue: Database update fails
**Symptoms:** Analysis completes but feedback not saved
**Check:**
- Database connection working
- CV record exists
- User ID matches

### 4. Manual Testing

Test the analyze endpoint directly:
```bash
curl -X POST http://localhost:3000/api/cvs/analyze \
  -H "Content-Type: application/json" \
  -H "Cookie: __clerk_db_jwt=..." \
  -d '{
    "cvId": "your-cv-id",
    "imagePath": "user-id/cv-id.png",
    "jobTitle": "Software Engineer",
    "jobDescription": "Test description"
  }'
```

### 5. Check Signed URL Access
The signed URL needs to be accessible by OpenAI. Test it:
1. Get the signed URL from logs
2. Open it in a browser (should show the image)
3. If it doesn't work, the URL might have expired or be invalid

## Added Logging

I've added extensive logging to help debug:
- Upload route: Logs when analysis is triggered
- Analyze route: Logs each step of the process
- OpenAI function: Logs API calls and responses
- Database updates: Logs when feedback is saved

Check your server console for these logs to identify where the process is failing.

