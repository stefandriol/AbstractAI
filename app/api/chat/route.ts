import { kv } from '@vercel/kv';
import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import getMessages from './getMessages';
import { NextResponse } from 'next/server';

const { DateTime } = require('luxon');

interface HashMessagesType {
    content: string;
    role: string;
}

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// arXiv publishes at 8 pm East coast time (not necessarily EST depending on
// daylight saving). If before 8 pm East coast time use current day, otherwise
// next day.
const nowEastern = DateTime.now().setZone("America/New_York");
let today = nowEastern.toFormat("yyyy-MM-dd");
if (nowEastern.hour >= 20) {
    today = nowEastern.plus({ days: 1 }).toFormat("yyyy-MM-dd");
}

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
    const { arxivCategory, interest } = await req.json();

    let messages = await getMessages(arxivCategory, interest);

    // Create StreamingTextResponse from database hash if existent:
    const hash = `${today}${arxivCategory}${interest}`;
    let hashMessages: HashMessagesType | null = null;
    hashMessages = await kv.hget(hash, 'messages');
    // hashMessages = null // to check summaries without saving them in database
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
    let response = await openai.createChatCompletion({
        // model: 'gpt-3.5-turbo-16k-0613',
        model: 'gpt-4', // or gpt-4-32k
        stream: true,
        temperature: 0.8, // Randomness [0-2]: 0 = deterministic, 2 = insane
        max_tokens: 4000, // Output tokens: 4/5000 for 8k model, 20-25k for 32k model
        top_p: 0.5, // Diversity [0-1]: Narrow down token probabilities a bit.
        frequency_penalty: 0, // [0-2]: Preference for new (less common) words/phrases.
        presence_penalty: 0.5, // [0-2]: Penalty for new tokens that do not appear in text.
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
