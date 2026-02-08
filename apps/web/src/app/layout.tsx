import { Providers } from '@/app/providers';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NitroLink | High-Speed Payments',
  description: 'Instant crypto streaming and cross-chain settlements.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* We wrap the whole body in Providers so every page has wallet access */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}