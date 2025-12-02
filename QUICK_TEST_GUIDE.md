# Quick Test Guide - OpenAI Integration

## ✅ Build Status
- **Build:** ✅ Successful
- **TypeScript:** ✅ No errors
- **Tests:** 31 passing, 1 skipped

## 🧪 Testing the OpenAI Integration

### Method 1: Test Page (Easiest)

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** `http://localhost:3000/test-openai`

3. **Click "Test OpenAI Analysis"** button

4. **Expected Result:**
   - If successful: You'll see scores and feedback
   - If error: Check the error message

**Note:** The test page uses a sample image. For a real test, upload a CV first.

### Method 2: Real CV Upload Test

1. **Upload a CV:**
   - Go to `http://localhost:3000/upload`
   - Fill in company name, job title, job description
   - Upload a PDF CV
   - Wait for upload to complete

2. **Check Analysis:**
   - The analysis runs automatically in the background
   - Check your Supabase database for the `feedback` field
   - Or wait a few seconds and refresh the home page

3. **View Results:**
   - The CV should appear on the home page with feedback
   - (CV detail page will be created in next task)

### Method 3: Check Server Logs

1. **Watch the terminal** where `npm run dev` is running
2. **Upload a CV** through the UI
3. **Look for:**
   - "Uploading your CV..." messages
   - "Analysing your CV..." (if analysis is triggered)
   - Any error messages

## 🔍 Troubleshooting

### "OpenAI API key is not configured"
- ✅ Your `.env.local` already has the key
- Make sure the dev server was restarted after adding it
- Check the key is valid at https://platform.openai.com/api-keys

### "Failed to analyze CV"
- Check OpenAI API quota/limits
- Verify the image URL is publicly accessible
- Check server logs for detailed error

### Analysis not running after upload
- Check `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000`
- Check server logs for fetch errors
- The background job may have failed silently

## 📊 Expected Analysis Output

When successful, you should see:
- **Overall Score:** 0-100
- **ATS Score:** 0-100
- **Category Scores:** Tone & Style, Content, Structure, Skills
- **Tips:** Detailed feedback for each category

## 🎯 Next Steps

Once testing confirms OpenAI integration works:
1. ✅ Proceed to Task 8: Usage Tracking
2. Add rate limiting
3. Implement retry logic
4. Create CV detail page to display results

