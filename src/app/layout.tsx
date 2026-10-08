import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/store/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'Fin2u Academy – Social Learning Platform',
    template: '%s | Fin2u Academy',
  },
  description:
    'Learn all sorts of skills from subject matter experts and join like-minded peers to hone them! Fin2u Academy offers free, complimentary, and premium courses.',
  keywords: 'online learning, courses, Malaysia, finance, business, social learning, LMS',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  openGraph: {
    title: 'Fin2u Academy – Social Learning Platform',
    description: 'Learn from subject matter experts and join a vibrant community of learners.',
    type: 'website',
    siteName: 'Fin2u Academy',
    images: [
      {
        url: '/fin2u.png',
        width: 512,
        height: 512,
        alt: 'Fin2u Academy Logo',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

