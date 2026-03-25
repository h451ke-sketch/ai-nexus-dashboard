import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const zhipu = new OpenAI({
  apiKey: process.env.ZHIPU_API_KEY,
  baseURL: "https://open.bigmodel.cn/api/paas/v4/",
});

export async function POST(req: Request) {
  try {
    const { messages, type } = await req.json();

    if (!process.env.ZHIPU_API_KEY) {
       return NextResponse.json({ 
         message: "Hello! Please configure your ZHIPU_API_KEY in .env.local to get real AI responses." 
       });
    }

    if (type === 'image') {
      const lastMessage = messages[messages.length - 1].content;
      const response = await zhipu.images.generate({
        model: 'cogview-3',
        prompt: lastMessage,
      });
      return NextResponse.json({ message: response.data[0].url });
    }

    const response = await zhipu.chat.completions.create({
      model: 'glm-4',
      messages: messages,
    });

    return NextResponse.json({ message: response.choices[0].message.content });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
