import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/shared/Sidebar';
import Topbar from '@/components/shared/Topbar';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'SAMIKSHA · CCMS — Karnataka High Court',
  description:
    'AI-assisted, human-verified decision support for Karnataka\'s Court Case Monitoring System. Court judgments → verified, citation-grounded action plans.',
  keywords: [
    'SAMIKSHA',
    'CCMS',
    'Karnataka High Court',
    'court compliance',
    'judgment extraction',
    'human-in-the-loop',
    'legal tech',
  ],
  openGraph: {
    title: 'SAMIKSHA · CCMS',
    description:
      'Smart AI for Monitoring, Interpretation & Knowledge from Court orders — Karnataka HC + CCMS.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <Providers>
          <Sidebar />
          <div className="main-content">
            <Topbar />
            <main className="p-6 max-w-[1280px] mx-auto page-enter">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
