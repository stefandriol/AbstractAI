import cheerio from 'cheerio';

export async function scrapeLatestPapers(
    arxivCategory: string,
): Promise<{ id: string; title: string; authors: string; abstract: string }[]> {
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
        });

        return papers;
    } catch (error) {
        console.error('Error scraping arXiv data:', error);

        return [];
    }
}
