import React, { Component, ErrorInfo, ReactNode } from 'react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#010B2C] to-[#0A1437] text-white p-4">
          <div className="max-w-md w-full space-y-8 text-center">
            <div>
              <h1 className="text-4xl font-bold">Something went wrong</h1>
              <p className="mt-3 text-lg text-gray-300">
                We apologize for the inconvenience. An unexpected error has occurred.
              </p>
              {this.state.error && (
                <div className="mt-4 p-4 bg-red-900/30 rounded-lg text-left overflow-auto">
                  <p className="text-red-300 font-mono text-sm">{this.state.error.toString()}</p>
                </div>
              )}
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

    return this.props.children;
  }
}

export default ErrorBoundary;
