import { DOMParser } from 'xmldom';

const getCurrentTimeInEST = (): Date => {
  const estFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', // arXiv operates in Eastern Standard Time
    hour12: false,
  });
  const currentDate = new Date();
  const estDateString = estFormatter.format(currentDate);
  return new Date(estDateString);
}

const getYYYYMMDD = (date: Date): String => {
  const format = (num: number) => (num < 10 ? `0${num}` : `${num}`);
  const year = date.getFullYear();
  const month = format(date.getMonth() + 1); // Months are zero-based
  const day = format(date.getDate());
  return `${year}${month}${day}`;
}


// See https://info.arxiv.org/help/availability.html
const getSubmittedDateRange = (): string => {
  const now = getCurrentTimeInEST();
  const isMonday = now.getDay() === 1;
  let past = new Date();
  if (isMonday) {
    past.setDate(past.getDate() - 3);
  } else {
    past.setDate(past.getDate() - 1);
  }
  return `${getYYYYMMDD(past)}1400+TO+${getYYYYMMDD(now)}1400`
}

export async function fetchLatestPapers(arxivCategory: string): Promise<{ title: string; id: string; abstract: string }[]> {
  try {
    console.log(getSubmittedDateRange())

    const response = await fetch(`https://export.arxiv.org/api/query?search_query=submittedDate:[${getSubmittedDateRange()}]+AND+cat:${arxivCategory}`);
    const data = await response.text();

    const papers: { title: string; id: string; abstract: string }[] = [];

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, 'text/xml');
    const entries = xmlDoc.getElementsByTagName('entry');

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const title = entry.getElementsByTagName('title')[0]?.textContent?.trim() || '';
      const id = entry.getElementsByTagName('id')[0]?.textContent?.trim() || '';
      const abstract = entry.getElementsByTagName('summary')[0]?.textContent?.trim() || '';

      if (title && id && abstract) {
        papers.push({ title, id, abstract });
      }
    }

    return papers;
  } catch (error) {
    console.error('Error fetching arXiv data:', error);
    return [];
  }
}

