import './globals.css'
import { Inter } from 'next/font/google'
import Header from './components/Header'
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Giving Back Studio',
  description: 'Transform Ideas into Impactful Realities',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Header />
            <main className="flex-1 pt-16">
              {children}
            </main>
            <footer className="bg-gray-100 dark:bg-gray-800 py-6">
              <div className="container text-center text-sm text-gray-600 dark:text-gray-400">
                Built open source with love - <a href="https://github.com/sponsors/Giving-Back-Studio" className="underline hover:text-blue-500" target="_blank" rel="noopener noreferrer">become a sponsor</a>.
              </div>
            </footer>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

