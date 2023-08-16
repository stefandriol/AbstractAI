import { ChatCompletionRequestMessageRoleEnum } from 'openai-edge';
import { fetchLatestPapers } from './fetchLatestPapers';

interface Message {
    role: ChatCompletionRequestMessageRoleEnum;
    content: string;
}

interface Paper {
    title: string;
    abstract: string;
    id: string;
}

const getMessages = async (arxivCategory: string, interest: string): Promise<Message[]> => {

    const papers: Paper[] = await fetchLatestPapers(arxivCategory);

    const messages: Message[] = [];

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: "You are an assistant to a researcher who wants to stay up to date with the latest papers in their field."
    });

    messages.push({
    role: ChatCompletionRequestMessageRoleEnum.User,
    content: "Paper titles and abstracts to summarize: " + JSON.stringify(papers)
});

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Only summarize the papers that are strictly relevant for my interests: ${interest}${
          interest.slice(-1) === '.' ? '' : '.'} Use less than 200 characters for each summary and include the title. Make a double linebreak after each summary.`,
    });
    
    return messages; 
}

export default getMessages;
