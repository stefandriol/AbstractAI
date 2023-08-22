import { NextResponse } from 'next/server'
import { scrapeLatestPapers } from '../scrapeLatestPapers';

interface Paper {
    id: string;
    title: string;
    authors: string;
    abstract: string;
}

export async function POST(req: Request) {
  const { arxivCategory } = await req.json();
  const papers: Paper[] = await scrapeLatestPapers(arxivCategory);
  return NextResponse.json({ papers });
}
