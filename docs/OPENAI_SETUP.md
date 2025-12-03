# OpenAI Integration Setup

## Overview

The CV Engine now uses OpenAI's GPT-4 Vision API to analyze CVs and provide detailed feedback.

## Setup Steps

1. **Get OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Add to Environment Variables**
   - Add `OPENAI_API_KEY=sk-your-key-here` to your `.env.local` file
   - The key is already in `.env.local.example` as a template

3. **Set App URL** (for background analysis)
   - Add `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local development
   - For production, set to your production URL (e.g., `https://yourdomain.com`)

## How It Works

1. **Upload Flow:**
   - User uploads CV → PDF and image stored in Supabase
   - Upload API triggers background analysis
   - Analysis API processes CV using OpenAI Vision
   - Feedback saved to database

2. **Analysis Process:**
   - Uses GPT-4 Vision model (`gpt-4o`)
   - Analyzes CV image (converted from PDF)
   - Returns structured feedback in JSON format
   - Includes ATS score, tone/style, content, structure, and skills analysis

3. **Feedback Format:**
   - Overall score (0-100)
   - ATS compatibility score
   - Category scores (Tone & Style, Content, Structure, Skills)
   - Detailed tips with explanations

## API Endpoints

### POST `/api/cvs/analyze`
Analyzes a CV using OpenAI.

**Request Body:**
```json
{
  "cvId": "uuid",
  "imageUrl": "https://...",
  "jobTitle": "Software Engineer",
  "jobDescription": "Job description text..."
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "overallScore": 85,
    "ATS": { "score": 90, "tips": [...] },
    "toneAndStyle": { "score": 80, "tips": [...] },
    ...
  }
}
```

## Cost Considerations

- GPT-4 Vision API pricing: ~$0.01-0.03 per CV analysis
- Consider implementing usage limits for free tier users
- Monitor API usage in OpenAI dashboard

## Error Handling

- Missing API key: Returns error message
- API failures: Logged and returned to client
- Invalid responses: Validated before saving

## Testing

The analysis runs automatically after CV upload. To test manually:

1. Upload a CV through the UI
2. Check the database for updated `feedback` field
3. View the CV detail page to see analysis results

## Next Steps

- [ ] Add usage tracking (Task 8)
- [ ] Implement rate limiting
- [ ] Add retry logic for failed analyses
- [ ] Cache analysis results

