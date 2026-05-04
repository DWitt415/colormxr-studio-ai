import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Initialize Supabase client for verification
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Load lesson content (cached at module level)
function loadLessonContent(lessonId: string): string {
  try {
    const lessonsDir = path.join(process.cwd(), '_text_content');
    const filePath = path.join(lessonsDir, `${lessonId}.md`);

    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    return '';
  } catch (error) {
    console.error('Error loading lesson content:', error);
    return '';
  }
}

// System prompt for the AI Course Guide
const SYSTEM_PROMPT = `You are the Colormxr Course Guide, teaching David's Interactive Color Composition methodology.

Colormxr is always open next to this instruction panel — the student can see and interact with it at any time. Never tell them to open it; direct them to use it.

Your goal is to get the student working in Colormxr as quickly as possible.
Keep responses brief and action-oriented.
After every explanation, direct the student to try something in Colormxr.
Do not engage in extended discussion — redirect to experiential learning.
If a student asks more than 2 follow-up questions on the same concept, suggest they try it rather than discuss it further.

Only ask questions that require the student to observe something in Colormxr or confirm readiness to proceed.
Maximum one question per response.

Always write RGB color values with dot separators: 255.0.0 not 255,0,0 or rgb(255,0,0).

Never refer to yourself as Claude or as an AI.
If asked who you are, say "I'm the Colormxr Course Guide."

Never discuss topics unrelated to color theory and Colormxr.

Color perception is subjective — never judge a student's color choices as correct or incorrect. Instead:
- Guide the process: "Adjust the cyan until you perceive visual balance"
- Ask for observations: "What did you notice about how these colors interact?"
- Connect to principles: "You're experiencing what Albers called color relativity"

Speak in David's voice using his teaching materials as your source.
Keep responses under 200 tokens.

## INTERACTIVE RESPONSES

You can provide interactive response options (pills/buttons) to guide the conversation.

To provide response options, return ONLY raw JSON with this exact format:
{
  "message": "Your message text here",
  "ui": {
    "type": "pills",
    "options": ["Option 1", "Option 2", "Option 3"]
  }
}

CRITICAL FORMATTING RULES — failure to follow these will break the UI:
- Return ONLY the raw JSON object, nothing else
- Start your response with { and end with }
- Do NOT write the message as plain text and then repeat it in JSON
- Do NOT wrap in backticks, code blocks, or markdown
- Do NOT add any text before or after the JSON object

When providing options:
- Keep option text short (2-5 words)
- Provide 2-4 options max
- Always include a path forward
- Example: ["Tell me more", "Skip to lesson", "Ask a question"]

Use pills for:
- Branching learning paths ("Continue" / "Explore more")
- Confirming understanding before continuing ("Got it" / "Explain again")
- Offering detail levels ("Tell me more" / "Skip ahead")
- Navigation choices ("Next lesson" / "Practice exercise" / "Ask a question")

DEFAULT: Use pills after most responses to keep the conversation flowing. Only skip pills if the user asks a specific question that needs a direct answer.

Examples:
- After explaining a concept: ["Try it now", "Tell me more", "Next topic"]
- After user completes something: ["What did you notice?", "Continue", "Ask a question"]
- When introducing new material: ["Let's explore", "Skip this", "Why does this matter?"]

If you don't need interactive options for a specific direct answer, respond with plain text (no JSON).`;

// Rate limiting configuration
const RATE_LIMIT = {
  MAX_MESSAGES_PER_SESSION: 200,
  MAX_INPUT_LENGTH: 500,
};

// Cost calculation (Claude Sonnet 4.5 pricing)
const PRICING = {
  INPUT_PER_MILLION: 3.0, // $3 per million input tokens
  OUTPUT_PER_MILLION: 15.0, // $15 per million output tokens
  CACHE_WRITE_PER_MILLION: 3.75, // $3.75 per million cache write tokens
  CACHE_READ_PER_MILLION: 0.3, // $0.30 per million cache read tokens
};

function calculateCost(usage: {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}): number {
  const inputCost = (usage.input_tokens / 1_000_000) * PRICING.INPUT_PER_MILLION;
  const outputCost = (usage.output_tokens / 1_000_000) * PRICING.OUTPUT_PER_MILLION;
  const cacheWriteCost = ((usage.cache_creation_input_tokens || 0) / 1_000_000) * PRICING.CACHE_WRITE_PER_MILLION;
  const cacheReadCost = ((usage.cache_read_input_tokens || 0) / 1_000_000) * PRICING.CACHE_READ_PER_MILLION;

  return inputCost + outputCost + cacheWriteCost + cacheReadCost;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      message,
      lessonId,
      exerciseId,
      conversationHistory = [],
      sessionId,
      accessToken,
    } = body;

    // Verify user authentication using access token
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    // Get user from access token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or expired session.' },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > RATE_LIMIT.MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${RATE_LIMIT.MAX_INPUT_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Check message count in session (rate limiting)
    if (conversationHistory.length >= RATE_LIMIT.MAX_MESSAGES_PER_SESSION) {
      return NextResponse.json(
        { error: 'Maximum messages per session reached. Please start a new session.' },
        { status: 429 }
      );
    }

    // Build message history for Claude API
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history
    conversationHistory.forEach((msg: any) => {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    });

    // Add current message
    messages.push({
      role: 'user',
      content: message,
    });

    // Load lesson content for context
    const lessonContent = lessonId ? loadLessonContent(lessonId) : '';

    // Build system prompt with lesson content
    const systemMessages: Array<{ type: 'text'; text: string; cache_control?: { type: 'ephemeral' } }> = [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
      },
    ];

    // Add lesson content if available (with caching)
    if (lessonContent) {
      systemMessages.push({
        type: 'text',
        text: `# Lesson Content: ${lessonId}\n\nUse this as your source material for teaching. Reference specific concepts, exercises, and instructions from this content when answering questions.\n\n${lessonContent}`,
        cache_control: { type: 'ephemeral' }, // Cache the lesson content
      });
    }

    // Add context about current exercise
    if (exerciseId) {
      systemMessages.push({
        type: 'text',
        text: `Current Exercise: ${exerciseId}\n\nThe student is currently working on this specific exercise. Guide them through it step by step.`,
        cache_control: { type: 'ephemeral' }, // Cache this too
      });
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 600, // Headroom for message + JSON wrapper; system prompt enforces brevity
      system: systemMessages,
      messages,
    });

    // Extract assistant response
    const assistantText = response.content[0]?.type === 'text'
      ? response.content[0].text
      : 'I encountered an error. Please try again.';

    // Try to parse as JSON for interactive UI elements
    let assistantMessage = assistantText;
    let uiData = null;

    // Extract JSON from the response — AI sometimes prepends plain text before JSON,
    // wraps it in a code block, appends raw JSON at the end, or gets truncated mid-JSON.
    let cleanedText = assistantText.trim();
    let textBeforeJson: string | null = null;

    // Strategy 1: Complete JSON code block — ```json {...} ```
    const codeBlockMatch = cleanedText.match(/^([\s\S]*?)```(?:json)?\s*([\s\S]*?)\s*```\s*$/);
    if (codeBlockMatch) {
      textBeforeJson = codeBlockMatch[1].trim() || null;
      cleanedText = codeBlockMatch[2].trim();
      console.log('🔧 Extracted JSON from complete code block');
    } else {
      // Strategy 1b: Truncated/unclosed code block — ```json { ... (no closing ```)
      // This happens when the AI hits the token limit mid-JSON
      const truncatedCodeBlock = cleanedText.match(/^([\s\S]*?)```(?:json)?\s*(\{[\s\S]*)$/);
      if (truncatedCodeBlock) {
        textBeforeJson = truncatedCodeBlock[1].trim() || null;
        cleanedText = ''; // JSON is truncated — skip parse, fall through to pre-text
        console.log('🔧 Detected truncated code block — using pre-text only');
      } else if (!cleanedText.startsWith('{')) {
        // Strategy 2: Complete raw JSON object on its own line at the end
        const trailingJsonMatch = cleanedText.match(/^([\s\S]*?)\n(\{[\s\S]*\})\s*$/);
        if (trailingJsonMatch) {
          textBeforeJson = trailingJsonMatch[1].trim() || null;
          cleanedText = trailingJsonMatch[2].trim();
          console.log('🔧 Extracted trailing JSON from response');
        } else {
          // Strategy 2b: Truncated raw JSON — plain text followed by \n{ but no closing }
          const truncatedTrailingJson = cleanedText.match(/^([\s\S]+?)\n(\{[\s\S]*)$/);
          if (truncatedTrailingJson && truncatedTrailingJson[1].trim()) {
            textBeforeJson = truncatedTrailingJson[1].trim();
            cleanedText = ''; // JSON is truncated — skip parse, fall through to pre-text
            console.log('🔧 Detected truncated trailing JSON — using pre-text only');
          }
        }
      }
    }

    try {
      if (cleanedText) {
        const parsed = JSON.parse(cleanedText);
        if (parsed.message && parsed.ui) {
          // If AI prepended plain text before the JSON, use that as the message
          // (it's typically the full answer); otherwise use the JSON message field
          assistantMessage = textBeforeJson || parsed.message;
          uiData = parsed.ui;
          console.log('✅ Parsed JSON response:', {
            usedPreText: !!textBeforeJson,
            messageLength: assistantMessage.length,
            pillCount: uiData.options?.length,
          });
        }
      }
    } catch (e) {
      // Not JSON — use pre-text if extracted (avoids raw JSON leaking into display)
      if (textBeforeJson) {
        assistantMessage = textBeforeJson;
      }
      console.log('📝 Plain text response (not JSON)');
    }

    // Final safety net: strip any residual ``` blocks from the message before sending
    if (assistantMessage.includes('```')) {
      assistantMessage = assistantMessage.replace(/```(?:json)?[\s\S]*?```/g, '').trim();
      assistantMessage = assistantMessage.replace(/```[\s\S]*$/g, '').trim(); // truncated block at end
      console.log('🧹 Stripped residual code block from message');
    }

    // Calculate cost
    const usageAny = response.usage as any;
    const cost = calculateCost({
      input_tokens: response.usage.input_tokens,
      output_tokens: response.usage.output_tokens,
      cache_creation_input_tokens: usageAny.cache_creation_input_tokens,
      cache_read_input_tokens: usageAny.cache_read_input_tokens,
    });

    // Store conversation in Supabase (if userId provided)
    if (userId && sessionId) {
      try {
        // Get or create conversation
        const { data: existingConversation } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('user_id', userId)
          .eq('session_id', sessionId)
          .single();

        const updatedMessages = [
          ...(existingConversation?.messages || []),
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() },
        ];

        if (existingConversation) {
          // Update existing conversation
          await supabase
            .from('ai_conversations')
            .update({
              messages: updatedMessages,
              last_message_at: new Date().toISOString(),
            })
            .eq('id', existingConversation.id);
        } else {
          // Create new conversation
          await supabase
            .from('ai_conversations')
            .insert({
              user_id: userId,
              lesson_id: lessonId || 'unknown',
              exercise_id: exerciseId,
              session_id: sessionId,
              messages: updatedMessages,
            });
        }

        // Store token usage
        await supabase
          .from('ai_token_usage')
          .insert({
            user_id: userId,
            lesson_id: lessonId || 'unknown',
            input_tokens: response.usage.input_tokens,
            output_tokens: response.usage.output_tokens,
            cache_creation_tokens: usageAny.cache_creation_input_tokens || 0,
            cache_read_tokens: usageAny.cache_read_input_tokens || 0,
            total_cost_usd: cost,
            model: 'claude-sonnet-4-5',
          });
      } catch (dbError) {
        console.error('Error storing conversation:', dbError);
        // Don't fail the request if DB storage fails
      }
    }

    // Return response
    return NextResponse.json({
      response: assistantMessage,
      ui: uiData, // Include UI data for interactive elements (pills, etc.)
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_creation_tokens: usageAny.cache_creation_input_tokens || 0,
        cache_read_tokens: usageAny.cache_read_input_tokens || 0,
        cost_usd: cost,
      },
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);

    // Handle specific Anthropic errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 500 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
