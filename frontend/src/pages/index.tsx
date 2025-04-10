import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background with navy color and slight gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#010B2C] to-[#0A1437] -z-10"></div>
      
      {/* Blue background behind image with smooth gradient transition, preserving border colors */}
      <div className="absolute inset-0 bg-[#0055A4] opacity-0 md:opacity-50 blur-[100px] -z-5"></div>
      <div className="absolute right-0 top-0 bottom-0 w-full md:w-2/3 bg-gradient-to-l from-[#0055A4] via-[#0055A4]/60 to-transparent -z-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#010B2C] via-transparent to-[#0A1437] opacity-80 -z-5"></div>
      
      {/* Border preservation layer */}
      <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#010B2C] to-transparent opacity-90 -z-5"></div>
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0A1437] to-transparent opacity-90 -z-5"></div>
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#010B2C] to-transparent opacity-90 -z-5"></div>
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A1437] to-transparent opacity-90 -z-5"></div>
      
      {/* Simplified binary code background overlay */}
      <div className="absolute inset-0 opacity-5 z-0 overflow-hidden pointer-events-none select-none">
        {Array(10).fill(0).map((_, i) => (
          <div key={i} className="text-xs font-mono text-white whitespace-nowrap">
            {Array(30).fill(0).map((_, j) => Math.round(Math.random())).join(' ')}
          </div>
        ))}
      </div>
      
      {/* Navigation Bar */}
      <header className="relative z-10">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="text-white text-2xl font-bold no-underline">
                CyberSafe
              </Link>
            </div>
            
            {!isMobile ? (
              <div className="flex space-x-8">
                <Link href="/profile-creation" className="text-white hover:text-blue-300 transition-colors no-underline font-medium">
                  Profile Creation
                </Link>
                <Link href="/skills-assessment" className="text-white hover:text-blue-300 transition-colors no-underline font-medium">
                  Skills Assessment
                </Link>
                <Link href="/dashboard" className="text-white hover:text-blue-300 transition-colors no-underline font-medium">
                  Dashboard
                </Link>
              </div>
            ) : (
              <button className="text-white focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}
            
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/login" className="text-white hover:text-blue-300 transition-colors no-underline font-medium">
                Log In
              </Link>
              <Link 
                href="/signup" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors no-underline font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
      </header>
      
      {/* Hero Section with text centered on the left */}
      <main className="flex-grow flex items-center overflow-hidden">
        <div className="w-full flex flex-col md:flex-row relative min-h-screen">
          {/* Left side with centered text */}
          <div className="absolute md:w-1/2 w-full h-full flex items-center justify-center z-10">
            <div className="px-8 md:px-12 lg:px-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                Level Up Your Digital Defense
              </h1>
              
              <p className="text-lg text-gray-300 mb-10">
                Embark on a cybersecurity adventure with CyberSafe's expert team. 
                Learn, practice, and master essential skills to protect yourself and respond to digital threats.
              </p>
              
              <Link 
                href="/signup" 
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors no-underline"
              >
                Get Started
              </Link>
            </div>
          </div>
          
          {/* Full-screen hero area */}
          <div className="w-full relative overflow-hidden min-h-screen">
            {/* The hero image positioned to show on the right side */}
            <div className="relative h-full w-full">
              <Image
                src="/images/new-landing.png"
                alt="CyberSafe Team"
                fill
                style={{ objectFit: 'contain', objectPosition: 'right center' }}
                className="z-0"
                priority
                loading="eager"
                sizes="100vw"
                quality={85}
                unoptimized={true}
              />
            </div>
          </div>
        </div>
      </main>
      
      {/* Features Section */}
      <section className="bg-navy-900/50 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Why Choose CyberSafe?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-navy-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="bg-blue-600/20 p-3 inline-block rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M17 20H7m10 0v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M7 20H2v-2a3 3 0 015.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Interactive Learning</h3>
              <p className="text-gray-300">Engage with interactive modules, quizzes, and simulations designed to make learning cybersecurity fun and effective.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-navy-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="bg-green-600/20 p-3 inline-block rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Real-World Applications</h3>
              <p className="text-gray-300">Learn practical skills that apply to real-world scenarios, empowering you to protect yourself and others online.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-navy-800/50 p-6 rounded-xl backdrop-blur-sm">
              <div className="bg-purple-600/20 p-3 inline-block rounded-lg mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Community Support</h3>
              <p className="text-gray-300">Join a community of like-minded individuals learning and growing together in the field of cybersecurity.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white mb-8">Ready to Secure Your Digital Future?</h2>
          <Link 
            href="/dashboard" 
            className="inline-block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 no-underline"
          >
            Start Learning Now
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-navy-950 text-gray-400 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">CyberSafe</h3>
              <p className="mb-4">Empowering individuals with the knowledge and skills to navigate the digital world securely.</p>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors no-underline">About Us</Link></li>
                <li><Link href="/modules" className="hover:text-white transition-colors no-underline">Learning Modules</Link></li>
                <li><Link href="/community" className="hover:text-white transition-colors no-underline">Community</Link></li>
                <li><Link href="/resources" className="hover:text-white transition-colors no-underline">Resources</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:text-white transition-colors no-underline">Help Center</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors no-underline">FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors no-underline">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors no-underline">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium text-white mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} CyberSafe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
