import cheerio from 'cheerio';

export async function scrapeLatestPapers(arxivCategory: string): Promise<{ title: string; id: string; abstract: string }[]> {
  try {

    const response = await fetch(`https://arxiv.org/list/${arxivCategory}/new`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const papers: { title: string; id: string; abstract: string }[] = [];

    // Find the <h3> tag that includes the string "Cross-lists":
    const crossListsHeading = $('h3:contains("Cross-lists")');

    // Traverse the DOM to get the HTML content before the <h3> tag:
    const relevantContent = crossListsHeading.prevAll();

    const dtElements = relevantContent.find('dt');

    // Loop through each <dt> element to extract the desired information:
    dtElements.each((index, dtElement) => {
        const idElement = $(dtElement).find('.list-identifier a');
        const id = idElement.text().trim().match(/\d+\.\d+/)?.[0] || '';
        const titleElement = $(dtElement).next().find('.list-title');
        const title = titleElement.text().replace('Title:', '').trim();
        const abstractElement = $(dtElement).next().find('p.mathjax');
        const abstract = abstractElement.text().trim();
        papers.push({
            title: title,
            id: id,
            abstract: abstract,
	});
    });

    return papers;

  } catch (error) {

    console.error('Error sraping arXiv data:', error);

    return [];

  }
}

