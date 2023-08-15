import { Analytics } from '@vercel/analytics/react';
import { Metadata } from 'next';
import '../styles/globals.css';

const title = 'arXiv Summary';
const description = 'Summarize your arXiv interests.';

export const metadata: Metadata = {
  metadataBase: new URL('https://arxiv-summary-2.vercel.app/'),
  title,
  description,
  openGraph: {
    title,
    description,
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
