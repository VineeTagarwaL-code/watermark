import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";

import type { Metadata } from "next";
import Script from "next/script";
import { ThemeProvider } from "./providers";
import { Toaster } from "@/components/ui/sonner";

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
    default: 'Watermark - Remove Watermarks from Your Images',
    template: '%s | Watermark'
  },
  description: 'Remove watermarks from your images with our easy-to-use watermark removal tool. Protect your digital content with customizable text and image watermarks.',
  keywords: ['watermark', 'image watermark', 'photo watermark', 'digital watermark', 'copyright protection', 'image protection', 'remove watermark', 'remove image watermark', 'remove photo watermark', 'remove digital watermark', 'remove copyright protection', 'remove image protection'],
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
    title: 'Watermark - Remove Watermarks from Your Images',
    description: 'Remove watermarks from your images with our easy-to-use watermark removal tool. Protect your digital content with customizable text and image watermarks.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Watermark - Remove Watermarks from Your Images',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Watermark - Remove Watermarks from Your Images',
    description: 'Remove watermarks from your images with our easy-to-use watermark removal tool. Protect your digital content with customizable text and image watermarks.',
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
          <Toaster position="bottom-right" />
        </ThemeProvider>
        <Script  defer src="https://stats.vineet.pro/script.js" data-website-id="72b7493e-a4d9-426c-b3ae-f6ae198568b3"></Script  >
      </body>
    </html>
  );
}
