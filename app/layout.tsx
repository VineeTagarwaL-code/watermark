import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";
import { ThemeProvider } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://watermark.vineet.pro'),
  title: {
    default: 'Watermark - Add Watermarks to Your Images',
    template: '%s | Watermark'
  },
  description: 'Add professional watermarks to your images with our easy-to-use watermarking tool. Protect your digital content with customizable text and image watermarks.',
  keywords: ['watermark', 'image watermark', 'photo watermark', 'digital watermark', 'copyright protection', 'image protection'],
  authors: [{ name: 'Vineet Agarwal' }],
  creator: 'Vineet Agarwal',
  publisher: 'Vineet Agarwal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://watermark.vineet.pro',
    siteName: 'Watermark',
    title: 'Watermark - Add Watermarks to Your Images',
    description: 'Add professional watermarks to your images with our easy-to-use watermarking tool. Protect your digital content with customizable text and image watermarks.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Watermark - Add Watermarks to Your Images',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watermark - Add Watermarks to Your Images',
    description: 'Add professional watermarks to your images with our easy-to-use watermarking tool. Protect your digital content with customizable text and image watermarks.',
    images: ['/og.png'],
    creator: '@vineetagarwal',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://watermark.vineet.pro',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex-1">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
