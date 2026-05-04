import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PRISM',
  description: 'Plateforme PRISM',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'PRISM',
    description: 'Plateforme PRISM',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
