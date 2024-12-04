import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import FloatingThemeToggle from './components/FloatingThemeToggle';
import { ThemeProvider } from './providers/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Workout Tracker',
  description: 'Track your workouts and exercises',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-black text-gray-900 dark:text-white antialiased`}>
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}