import { ChatCompletionRequestMessageRoleEnum } from 'openai-edge';
import { scrapeLatestPapers } from '../scrapeLatestPapers';

interface Message {
    role: ChatCompletionRequestMessageRoleEnum;
    content: string;
}

interface Paper {
    id: string;
    title: string;
    authors: string;
    abstract: string;
}

interface PaperForPrompt {
    title: string;
    authors: string;
    abstract: string;
}

const getMessages = async (
    arxivCategory: string,
    interest: string,
): Promise<Message[]> => {
    // Restrict to first X papers because of token size. Don't feed id to GPT.
    const papers = await scrapeLatestPapers(arxivCategory);
    // debugging order:
    // console.log("Original papers order:", papers);
    const papersForPrompt: PaperForPrompt[] = papers
        .slice(0, 20)
        .map(({ id, ...rest }) => rest);
    // debugging order again:
    // console.log("Modified papers order:", papersForPrompt);

    const messages: Message[] = [];

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.System,
        content:
            'Join the academic community in summarizing the new findings in high energy physics.',
    });

    // probably superfluous
    /*
    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content:
            "\n\ntitle: Deeply-virtual and photoproduction of mesons at higher-order and  higher-twist\nauthors: K. Passek-Kumericki\nabstract: Both deeply-virtual and photoproduction of mesons offer promising access to\ngeneralized parton distributions and complementary description of different\nkinematical regions. The higher-order contributions offer stabilizing effect\nwith respect to the dependence on renormalization scales, while higher-twist\neffects have been identified as especially important in the case of the\nproduction of pseudo-scalar mesons. This was confirmed by recent evaluation of\nthe complete twist-3 contribution to $\\pi$ and $\\eta$/$\\eta'$ photoproduction\nand its confrontation with experimental data.\n",
    });

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content:
            '"Deeply-virtual and photoproduction of mesons at higher-order and  higher-twist"\nSummary: Deeply-virtual and photoproduction of mesons provide access to generalized parton distributions. Higher-order contributions stabilize renormalization scales, while higher-twist effects are important for pseudo-scalar meson production.\nkeywords: deeply-virtual, photoproduction, mesons.',
    });
    */

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: 'Summarize these papers by following the instructions below:' + JSON.stringify(papersForPrompt),
    });

    const interestPrompt: string = interest
        ? `Only consider the papers that are strictly relevant for my interests: ${interest}${
            interest.slice(-1) === '.' ? ' ' : '. '
        }`
        : '';

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
            content: `${interestPrompt}For each paper, extract its core result in 200 characters AND NOT MORE!!! Also, identify the 3 most relevant technical keywords. Each paper must yield 4 paragraphs separated by a single line break: title, authors, summary, keywords. Split papers by a double line break.`,
    });

    return messages;
};

export default getMessages;
