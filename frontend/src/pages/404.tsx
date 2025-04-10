import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#010B2C] to-[#0A1437] text-white p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
          <p className="mt-3 text-lg text-gray-300">
            The page you are looking for does not exist or has been moved.
          </p>
        </div>
        <div>
          <Link 
            href="/" 
            className="inline-block py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
