import type { Metadata } from 'next'
import { Geist, Geist_Mono } from "next/font/google"
// Use standard global stylesheet (CSS Modules are not allowed in root layout)
// TEMP: use minimal globals while diagnosing dev server binding
import './globals.css'
import { SessionProvider } from './providers'
import Header from '@/components/Header'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'My Styled Wardrobe - Personal Color & Fit Analysis',
  description: 'Get instant outfit inspiration with AI-powered personal color and body shape analysis. Discover your perfect style with personalized recommendations.',
  keywords: 'wardrobe, styling, fashion, body shape, color analysis, outfit recommendations, personal style',
  authors: [{ name: 'My Styled Wardrobe' }],
  creator: 'My Styled Wardrobe',
  publisher: 'My Styled Wardrobe',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://mystyledwardrobe.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'My Styled Wardrobe - Personal Color & Fit Analysis',
    description: 'Get instant outfit inspiration with AI-powered personal color and body shape analysis.',
    url: 'https://mystyledwardrobe.com',
    siteName: 'My Styled Wardrobe',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'My Styled Wardrobe - Personal Styling App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Styled Wardrobe - Personal Color & Fit Analysis',
    description: 'Get instant outfit inspiration with AI-powered personal color and body shape analysis.',
    images: ['/og-image.jpg'],
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
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/ks-favicon.svg" type="image/svg+xml" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//api.openai.com" />
        
        {/* Performance optimization meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Using media query for theme-color to support all browsers */}
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#007aff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0056d6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="My Styled Wardrobe" />
        
        {/* Security headers */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "My Styled Wardrobe",
              "description": "Personal color and body shape analysis for instant outfit inspiration",
              "url": "https://mystyledwardrobe.com",
              "applicationCategory": "LifestyleApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
