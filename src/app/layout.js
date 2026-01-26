import '@/styles/globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { APP_CONFIG } from '@/lib/constants';

/*
  Root Layout

  This file wraps EVERY page in your app. It's required by Next.js App Router.

  WHY A ROOT LAYOUT?
  1. Provides consistent structure (header, footer) across all pages
  2. Loads global CSS once
  3. Sets HTML metadata (title, description)
  4. Can include providers (auth, themes) that wrap the entire app

  The {children} prop is the actual page content that changes between routes.
*/

// Metadata for SEO - Next.js uses this to set <title>, <meta> tags
export const metadata = {
  title: {
    default: APP_CONFIG.appName,
    template: `%s | ${APP_CONFIG.appName}`, // "Page Title | Review Bot"
  },
  description: 'Generate professional reviews for businesses with ease',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {/* Header appears on all pages */}
        <Header />

        {/* Main content area - grows to fill available space */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer appears on all pages */}
        <Footer />
      </body>
    </html>
  );
}
