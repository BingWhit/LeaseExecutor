import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Lease Executor - Confidential Lease & Subscription Platform",
  description: "Privacy-preserving lease and subscription execution using FHEVM",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-white min-h-screen">
        {/* Header with gradient accent */}
        <header className="bg-black border-b-4 border-yellow-400 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-yellow-400">Lease Executor</h1>
                  <p className="text-xs text-gray-400">Privacy-Preserving Lease Platform</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">FHEVM Protected</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Providers>{children}</Providers>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-black border-t-2 border-yellow-400 py-6 mt-20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-gray-400 text-sm">
              Powered by FHEVM • Confidential Computing • Zama Technology
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
