import cheerio from 'cheerio';

export interface Paper {
    id: string;
    title: string;
    authors: string;
    abstract: string;
}

export interface ScrapeResult {
    papers: Paper[];
    nPapersGptFed: number;
    nPapersTotal: number;
}

export async function scrapeLatestPapers(
    arxivCategory: string,
): Promise<ScrapeResult> {
    try {
        const response = await fetch(
            `https://arxiv.org/list/${arxivCategory}/new`,
        );
        const html = await response.text();
        const $ = cheerio.load(html);

        const papers: {
            id: string;
            title: string;
            authors: string;
            abstract: string;
        }[] = [];
        let nPapersGptFed: number = 0;
        let nPapersTotal: number = 0;

        // Find the <h3> tag that includes the string "Cross-lists":
        const crossListsHeading = $('h3:contains("Cross-lists")');

        // Traverse the DOM to get the HTML content before the <h3> tag:
        const relevantContent = crossListsHeading.prevAll();

        const dtElements = relevantContent.find('dt');

        // Loop through each <dt> element to extract the desired information:
        dtElements.each((index, dtElement) => {
            const idElement = $(dtElement).find('.list-identifier a');
            const id =
                idElement
                    .text()
                    .trim()
                    .match(/\d+\.\d+/)?.[0] || '';
            const titleElement = $(dtElement).next().find('.list-title');
            const title = titleElement
                .text()
                .replace('Title:', '')
                .replace(/\s*\n\s*/g, ' ')
                .replace(/  +/g, ' ')
                .trim();
            const authorsElement = $(dtElement).next().find('.list-authors');
            const authors = authorsElement
                .text()
                .replace('Authors:', '')
                .replace(/\s*\n\s*/g, ' ')
                .replace(/  +/g, ' ')
                .trim();
            const abstractElement = $(dtElement).next().find('p.mathjax');
            const abstract = abstractElement
                .text()
                .replace(/\s*\n\s*/g, ' ')
                .replace(/  +/g, ' ')
                .trim();
            papers.push({
                id: id,
                title: title,
                authors: authors,
                abstract: abstract,
            });

            // Use character count / 4 as rough estimate for token count for
            // GPT-4. Once we're using more than 4k token for the prompt we're
            // likely going to exceed GPT-4's 8k token limit, hence cut off
            // paper count here.
            nPapersTotal = nPapersTotal + 1;
            if (JSON.stringify(papers).length / 4 < 4000) {
                nPapersGptFed = nPapersGptFed + 1;
            }
        });

        return {
            papers: papers,
            nPapersGptFed: nPapersGptFed,
            nPapersTotal: nPapersTotal,
        };
    } catch (error) {
        console.error('Error scraping arXiv data:', error);

        return { papers: [], nPapersGptFed: 0, nPapersTotal: 0 };
    }
}
