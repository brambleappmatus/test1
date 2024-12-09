import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import FloatingThemeToggle from './components/FloatingThemeToggle';
import { ThemeProvider } from './providers/ThemeProvider';
import { WorkoutProvider } from './providers/WorkoutProvider';
import UnsavedWorkoutBar from './components/UnsavedWorkoutBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Workout Tracker',
  description: 'Track your workouts and exercises',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Workout Tracker',
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#10b981" />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-black text-gray-900 dark:text-white antialiased`}>
        <ThemeProvider>
          <WorkoutProvider>
            <FloatingThemeToggle />
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 transition-all duration-300 ease-in-out">
                <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-10 mb-20 lg:mb-0">
                  {children}
                </div>
              </main>
              <MobileNav />
            </div>
            <UnsavedWorkoutBar />
          </WorkoutProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}