import { NextResponse } from 'next/server';
import { scrapeLatestPapers, ScrapeResult } from '../scrapeLatestPapers';

export async function POST(req: Request) {
    const { arxivCategory } = await req.json();
    const scrapeResult: ScrapeResult = await scrapeLatestPapers(arxivCategory);
    return NextResponse.json({ scrapeResult });
}
