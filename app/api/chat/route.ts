import { Configuration, OpenAIApi } from 'openai-edge';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import getMessages from './getMessages';

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
    const { arxivCategory, interest } = await req.json();
    const messages = await getMessages(arxivCategory, interest);

    // Ask OpenAI for a streaming completion given the prompt
    const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo-16k-0613',
        stream: true,
        temperature: 1,
        max_tokens: 12124,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        messages: messages.map((message) => ({
            role: message.role,
            content: message.content,
        })),
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    // Respond with the stream
    return new StreamingTextResponse(stream);
}
