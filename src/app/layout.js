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

  DARK MODE:
  Theme is managed client-side via useTheme hook which adds 'dark' class to <html>.
  We use suppressHydrationWarning to prevent SSR/client mismatch warnings.

  ACCESSIBILITY:
  Skip link allows keyboard users to jump directly to main content.
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
    <html lang="de" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme by checking preference before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme-preference');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Skip link for keyboard users - invisible until focused */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Zum Hauptinhalt springen
        </a>

        {/* Header appears on all pages */}
        <Header />

        {/* Main content area - grows to fill available space */}
        <main id="main-content" className="flex-1">
          {children}
        </main>

        {/* Footer appears on all pages */}
        <Footer />
      </body>
    </html>
  );
}
