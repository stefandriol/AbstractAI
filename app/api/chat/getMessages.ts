import { ChatCompletionRequestMessageRoleEnum } from 'openai-edge';
import { scrapeLatestPapers, Paper, ScrapeResult } from '../scrapeLatestPapers';

interface Message {
    role: ChatCompletionRequestMessageRoleEnum;
    content: string;
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
    const scrapeResult: ScrapeResult = await scrapeLatestPapers(arxivCategory);
    const papers: Paper[] = scrapeResult.papers;
    const nPapers: number = scrapeResult.nPapersGptFed;
    const papersForPrompt: PaperForPrompt[] = papers
        .slice(0, nPapers)
        .map(({ id, ...rest }) => rest);

    const messages: Message[] = [];

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.System,
        content:
            'Join the academic community in summarizing new findings in high energy physics.',
    });

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content:
            'Summarize these papers by following the instructions below:' +
            JSON.stringify(papersForPrompt),
    });

    // const interestPrompt: string = interest
    //    ? `Only consider the papers that are strictly relevant for my interests: ${interest}${
    //          interest.slice(-1) === '.' ? ' ' : '. '
    //      }`
    //    : '';

    messages.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        // content: `$Instructions: {interestPrompt}For each paper:
        content: `$Instructions: For each paper:
        1. Summary: extract its core result within 250 characters and NO MORE (use LaTeX math mode where necessary);
        2. Keywords: identify its 3 most relevant technical keywords;
        3. Output format #1: format the output using 4 paragraphs separated by a single line break: title, authors, summary, keywords. Split papers by a double line break.
        Namely: insert_title_here\ninsert_authors_here\ninsert_summary_here\nkeywords:insert_keywords_here\n\n ;
        4. Output format #2: do not modify any character in the titles provided.
        `,
    });

    // messages.push({
    //   role: ChatCompletionRequestMessageRoleEnum.User,
    //   content: `For each paper, format the output using 4 paragraphs separated by a single line break: title, authors, summary, keywords. Split papers by a double line break.
    //   Namely: insert_title_here\ninsert_authors_here\ninsert_summary_here\nkeywords:insert_keywords_here\n\n`,
    // });

    // When implementing Mathjax, need to keep LaTex structure in title and summary
    // messages.push({
    //    role: ChatCompletionRequestMessageRoleEnum.User,
    //    content: `Do not change any character in the titles provided.`,
    // });

    /*
        messages.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `For example, given the paper: 
        {"title":"Higher Derivative Sigma Models","authors":"John F. Donoghue, Gabriel Menezes","abstract":"We explore the nature of running couplings in the higher derivative linear and nonlinear sigma models and show that the results in dimensional regularization for the physical running couplings do not always match the values quoted in the literature. Heat kernel methods identify divergences correctly, but not all of these divergences are related to physical running couplings. Likewise the running found using the Functional Renormalization Group does not always appear as running couplings in physical processes, even for the case of logarithmic running. The basic coupling of the higher derivative SU(N) nonlinear sigma model does not run at all at one loop, in contrast to published claims for asymptotic freedom. At one loop we describe how to properly identify the physical running couplings in these theories, and provide revised numbers for the higher derivative nonlinear sigma model."},
        the output format must be:
        Higher Derivative Sigma Models\nJohn F. Donoghue, Gabriel Menezes\nDimensional regularization for the physical running couplings in higher derivative sigma models does not always agree with existing literature. At one loop, we describe how to correctly identify the physical running couplings, and provide a revised result.\nKeywords: higher derivative sigma models, running couplings, asymptotic freedom.\n\n`,
    });
         */

    return messages;
};

export default getMessages;
