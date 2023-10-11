'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import DropDown, { ArxivCategoryType } from '../components/DropDown';
import { useChat } from 'ai/react';
import Footer from '../components/Footer';

interface Paper {
    id: string;
    title: string;
    authors: string;
    abstract: string;
}

export default function Page() {
    const [interest, setInterest] = useState('');
    const [interestSubmitted, setInterestSubmitted] = useState('');
    const [arxivCategory, setArxivCategory] =
        useState<ArxivCategoryType>('hep-th');
    const [papers, setPapers] = useState<Paper[]>([]);
    const summaryRef = useRef<null | HTMLDivElement>(null);

    const scrollToSummary = () => {
        if (summaryRef.current !== null) {
            summaryRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Set initial input so user can click on submit button without specifying
    // interests. If initialInput is empty string API call won't be triggered
    // without changing the input textarea.
    const { input, handleInputChange, handleSubmit, isLoading, messages } =
        useChat({
            initialInput: 'input not set',
            body: {
                arxivCategory,
                interest,
            },
            onResponse() {
                scrollToSummary();
            },
        });

    const handleTextChange = (e: any) => {
        handleInputChange(e);
        setInterest(e.target.value);
    };

    const onSubmit = async (e: any) => {
        e.preventDefault();

        setInterestSubmitted(interest);
        handleSubmit(e);

        // Get submitted papers:
        const response: Response = await fetch('/api/papers', {
            method: 'POST',
            body: JSON.stringify({ arxivCategory }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const responseJson = await response.json();
        const papersScraped: Paper[] = responseJson.papers;
        setPapers(papersScraped);
    };

    const onSummaryClick = (e: any) => {
        if (!Array.isArray(papers)) {
            return;
        }

        // Get the closest parent div of the clicked element
        const summaryDiv = e.target.closest('div');

        if (!summaryDiv) {
            return;
        }

        // Get all the text content from the summary div
        const summaryText = summaryDiv.textContent || '';

        // Find the paper based on the summary div's text content
        const index = papers.findIndex((item) =>
            summaryText.includes(item.title),
        );

        // Step 2: If the index is not found, try comparing trimmed versions of
        // summary text and paper titles to avoid issues due to extra spaces or
        // line breaks.
        if (index === -1) {
            const indexTrimmed = papers.findIndex((paper) =>
                summaryText.trim().includes(paper.title.trim()),
            );
        }

        const paper = papers[index];
        if (!paper || !paper.id || !paper.title) {
            return;
        }

        const url = `https://arxiv.org/abs/${paper.id}`;
        window.open(url, '_blank');
    };

    const lastMessage = messages[messages.length - 1];
    const generatedSummaries =
        lastMessage?.role === 'assistant' ? lastMessage.content : null;

    return (
        <div className="flex max-w-5xl mx-auto flex-col items-center justify-center py-2 min-h-screen">
            <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
                <h1 className="sm:text-5xl text-3xl max-w-[708px] font-bold text-slate-900 mb-10">
                    Tired of scrolling arXiv? Get an AI summary of today&apos;s
                    papers.
                </h1>
                <form className="max-w-xl w-full" onSubmit={onSubmit}>
                    <div className="flex mb-5 items-center space-x-3">
                        <Image
                            src="/1-black.png"
                            width={30}
                            height={30}
                            alt="1 icon"
                        />
                        <p className="text-left font-medium">Select arXiv.</p>
                    </div>
                    <div className="block">
                        <DropDown
                            arxivCategory={arxivCategory}
                            setArxivCategory={(newArxivCategory) =>
                                setArxivCategory(newArxivCategory)
                            }
                        />
                    </div>
                    <div className="flex mt-10 items-center space-x-3">
                        <Image
                            src="/2-black.png"
                            width={30}
                            height={30}
                            alt="2 icon"
                        />
                        <p className="text-left font-medium">
                            Research topics you&apos;re intersted in.
                        </p>
                    </div>
                    <textarea
                        value={input === 'input not set' ? '' : input}
                        onChange={handleTextChange}
                        rows={4}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black my-5"
                        placeholder={
                            'e.g. String Phenomenology, Axions, Collider physics.'
                        }
                    />

                    {!isLoading && (
                        <button
                            className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
                            type="submit"
                        >
                            Generate summaries &rarr;
                        </button>
                    )}
                    {isLoading && (
                        <button
                            className="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-10 mt-8 hover:bg-black/80 w-full"
                            disabled
                        >
                            <span className="loading">
                                <span style={{ backgroundColor: 'white' }} />
                                <span style={{ backgroundColor: 'white' }} />
                                <span style={{ backgroundColor: 'white' }} />
                            </span>
                        </button>
                    )}
                </form>
                <hr className="h-px bg-gray-700 border-1 dark:bg-gray-700" />
                <output className="space-y-10 my-10">
                    {generatedSummaries && (
                        <>
                            <div>
                                <h2
                                    className="sm:text-4xl text-3xl font-bold text-slate-900 mx-auto"
                                    ref={summaryRef}
                                >
                                    Your generated summaries
                                </h2>
                            </div>
                            <div className="space-y-8 flex flex-col items-center justify-center max-w-xl mx-auto">
                                {interestSubmitted && (
                                    <p>{`Research topics you're interested in: ${interestSubmitted}`}</p>
                                )}
                                {generatedSummaries
                                    .split(/\n\n/)
                                    .map((generatedSummary) => {
                                        return (
                                            <div
                                                className="bg-white rounded-xl shadow-md p-4 hover:bg-gray-100 transition cursor-pointer border"
                                                onClick={onSummaryClick}
                                                key={generatedSummary}
                                            >
                                                {generatedSummary
                                                    .split(/\n/)
                                                    .map((paragraph, index) => {
                                                        let paragraphClass =
                                                            'whitespace-pre-line';
                                                        if (index === 0)
                                                            paragraphClass +=
                                                                ' font-bold';
                                                        if (index === 1)
                                                            paragraphClass +=
                                                                ' italic';

                                                        return (
                                                            <>
                                                                <p
                                                                    className={
                                                                        paragraphClass
                                                                    }
                                                                >
                                                                    {paragraph}
                                                                </p>
                                                                <br className="mb-10" />
                                                            </>
                                                        );
                                                    })}
                                            </div>
                                        );
                                    })}
                            </div>
                        </>
                    )}
                </output>
            </main>
            <Footer />
        </div>
    );
}
