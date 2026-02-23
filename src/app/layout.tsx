import type { Metadata } from 'next';

import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'React Flow + Deck.gl Demo',
  description:
    'A simple React Flow diagram editor with a MapLibre + Deck.gl map overlay, built with Next.js and MUI.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={``}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
