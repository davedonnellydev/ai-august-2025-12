import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { MODEL } from '@/app/config/constants';
import { ServerRateLimiter } from '@/app/lib/utils/api-helpers';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Server-side rate limiting
    if (!ServerRateLimiter.checkLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { code, language } = await request.json();

    // Environment validation
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'Translation service temporarily unavailable' },
        { status: 500 }
      );
    }

    const client = new OpenAI({
      apiKey,
    });

    const LineSummary = z.object({
      lineStart: z.number(),
      lineEnd: z.number(),
      lineText: z.string(),
      lineExplanation: z.string(),
    });

    const FurtherReadingArticle = z.object({
      title: z.string(),
      url: z.string(),
      description: z.string(),
    });

    const CodeFeedback = z.object({
      analyzedLanguage: z.string(),
      summary: z.string(),
      context: z.string(),
      lineByLine: z.array(LineSummary),
      furtherReading: z.array(FurtherReadingArticle),
    });

    const instructions: string = `You are an expert in all programming languages. You will be given some code by the user and your role is to provide a summary of what the purpose of the code is, as well as what each line of code does. If it's possible to provide context around where this code is most often used, or industry standard ways of making the code better, please also do that. Provide feedback within the format supplied.`;

    const input: string = `I've provided some code between the '###' characters below:
    ###
    ${code}
    ###
    I believe it is written in ${language}, so please explain the code with that context, but if I'm incorrect, please explain the code based on what context you think it's written within.`;

    const response = await client.responses.parse({
      model: MODEL,
      instructions,
      input,
      text: {
        format: zodTextFormat(CodeFeedback, 'code_feedback'),
      },
    });

    if (response.status !== 'completed') {
      throw new Error(`Responses API error: ${response.status}`);
    }

    return NextResponse.json({
      response: response.output_parsed,
      originalLanguage: language,
      originalCode: code,
      remainingRequests: ServerRateLimiter.getRemaining(ip),
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'OpenAI failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
