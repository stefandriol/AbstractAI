import { kv } from '@vercel/kv';
import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import getMessages from './getMessages';
import { NextResponse } from 'next/server';

interface HashMessagesType {
    content: string;
    role: string;
}

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);
const todayUTC = new Date().toISOString().slice(0, 10);

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
    const { arxivCategory, interest } = await req.json();
    const messages = await getMessages(arxivCategory, interest);

    // Create StreamingTextResponse from database hash if existent:
    const hash = `${todayUTC}${arxivCategory}${interest}`;
    let hashMessages: HashMessagesType | null = null;
    hashMessages = await kv.hget(hash, 'messages');
    if (hashMessages && hashMessages.hasOwnProperty('content')) {
        const mockStream = new ReadableStream({
            start(controller) {
                const utf8Encoder = new TextEncoder();
                const encoded = utf8Encoder.encode(hashMessages?.content);
                controller.enqueue(encoded);
                controller.close();
            },
        });
        return new StreamingTextResponse(mockStream);
    }

    // Ask OpenAI for a streaming completion given the prompt
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-16k-0613',
        stream: true,
        temperature: 1,
        max_tokens: 6000,
        top_p: 0.5, // Narrow down token probabilities a bit.
        frequency_penalty: 0, // Prefer less common words/phrases.
        presence_penalty: 0.5, // Encourage the use of diverse vocabulary.
        messages: messages.map((message) => ({
            role: message.role,
            content: message.content,
        })),
    });

    // Store response in kv database so call has to be executed only once:
    const stream = OpenAIStream(response, {
        async onCompletion(completion) {
            const payload = {
                messages: {
                    content: completion,
                    role: 'assistant',
                },
            };
            await kv.hmset(hash, payload);
        },
    });

    // Respond with the stream
    return new StreamingTextResponse(stream);
}
