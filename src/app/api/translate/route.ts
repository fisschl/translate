import { NextRequest } from 'next/server';
import { deepseek } from '@ai-sdk/deepseek';

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'deepseek-chat' } = await req.json();
    
    // Extract system messages from the last message's data
    const lastMessage = messages[messages.length - 1];
    const systemMessages = lastMessage.data?.systemMessages || [];
    
    const allMessages = [
      ...systemMessages,
      ...messages.map(({ role, content }: { role: string; content: string }) => ({
        role,
        content
      }))
    ];

    const response = await deepseek('deepseek-chat').generateText({
      messages: allMessages,
    });

    return new Response(response.text, {
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Translation error:', error);
    return new Response(JSON.stringify({ error: 'Translation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}