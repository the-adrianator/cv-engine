/**
 * OpenAI CV Analysis
 * 
 * Analyzes CVs using OpenAI's API with vision capabilities
 */

import OpenAI from 'openai';

// Define Feedback type locally to avoid import issues
interface Feedback {
  overallScore: number;
  ATS: {
    score: number;
    tips: { type: "good" | "improve"; tip: string }[];
  };
  toneAndStyle: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  content: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  structure: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
  skills: {
    score: number;
    tips: { type: "good" | "improve"; tip: string; explanation: string }[];
  };
}

// Initialize OpenAI client - will be created per request
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({
    apiKey,
  });
};

const AI_RESPONSE_FORMAT = `
      interface Feedback {
      overallScore: number; //max 100
      ATS: {
        score: number; //rate based on ATS suitability
        tips: {
          type: "good" | "improve";
          tip: string; //give 3-4 tips
        }[];
      };
      toneAndStyle: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      content: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      structure: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
      skills: {
        score: number; //max 100
        tips: {
          type: "good" | "improve";
          tip: string; //make it a short "title" for the actual explanation
          explanation: string; //explain in detail here
        }[]; //give 3-4 tips
      };
    }`;

export function prepareInstructions({
  jobTitle,
  jobDescription,
}: {
  jobTitle: string;
  jobDescription: string;
}) {
  return `You are an expert in ATS (Applicant Tracking System) and CV analysis.
  Please analyse and rate this CV and suggest how to improve it.
  The rating can be low if the CV is bad.
  Be thorough and detailed. Don't be afraid to point out any mistakes or areas for improvement.
  If there is a lot to improve, don't hesitate to give low scores. This is to help the user to improve their CV.
  If available, use the job description for the job user is applying to to give more detailed feedback.
  If provided, take the job description into consideration.
  The job title is: ${jobTitle}
  The job description is: ${jobDescription}
  Provide the feedback using the following format: ${AI_RESPONSE_FORMAT}
  Return the analysis as a JSON object, without any other text and without the backticks.
  Do not include any other text or comments. 
  Make sure to strictly adhere to British English spelling and grammar conventions. For instance, use "colour" instead of "color", "analyse" instead of "analyze" and "CV" instead of "resume".`;
}

/**
 * Analyze a CV using OpenAI Vision API
 * 
 * @param imageUrl - URL to the CV image (must be publicly accessible)
 * @param instructions - Analysis instructions including job title and description
 * @returns Parsed feedback object
 */
export async function analyzeCV(
  imageUrl: string,
  instructions: string
): Promise<{ feedback: Feedback | null; error: string | null }> {
  try {
    console.log('analyzeCV called with imageUrl:', imageUrl.substring(0, 100) + '...');
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key not configured');
      return {
        feedback: null,
        error: 'OpenAI API key is not configured',
      };
    }

    const openaiClient = getOpenAIClient();
    console.log('Calling OpenAI API...');
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4o', // Use vision-capable model
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: 'high', // High detail for better CV analysis
              },
            },
            {
              type: 'text',
              text: instructions,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in OpenAI response');
      return {
        feedback: null,
        error: 'No response from OpenAI',
      };
    }

    console.log('OpenAI response received, parsing JSON...');
    // Parse the JSON response
    let feedback: Feedback;
    try {
      feedback = JSON.parse(content) as Feedback;
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Response content:', content.substring(0, 500));
      return {
        feedback: null,
        error: 'Failed to parse OpenAI response',
      };
    }

    // Validate feedback structure
    if (typeof feedback.overallScore !== 'number' || !feedback.ATS || !feedback.toneAndStyle) {
      console.error('Invalid feedback structure:', {
        hasOverallScore: !!feedback.overallScore,
        hasATS: !!feedback.ATS,
        hasToneAndStyle: !!feedback.toneAndStyle,
      });
      return {
        feedback: null,
        error: 'Invalid feedback format from OpenAI',
      };
    }

    console.log('Analysis successful, returning feedback');
    return { feedback, error: null };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      feedback: null,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to analyze CV with OpenAI',
    };
  }
}

