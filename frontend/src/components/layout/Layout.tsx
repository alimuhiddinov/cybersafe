import React, { ReactNode } from 'react';
import Head from 'next/head';
import MainNavbar from './MainNavbar';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'CyberSafe Platform', 
  description = 'Learn cybersecurity skills with interactive modules' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen flex flex-col bg-navy-900 text-white">
        <MainNavbar />
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-navy-900 border-t border-navy-700 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} CyberSafe Platform. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout;
