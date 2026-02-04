import type { Metadata } from 'next';
import { Outfit, Sora } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Mini Gantt',
  description: 'Mini Gantt POC - task management with Gantt chart',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${sora.variable} scroll-smooth`}
    >
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
