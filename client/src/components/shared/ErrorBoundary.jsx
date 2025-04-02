import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // You can customize the fallback UI here
      return (
        <div className="bg-neutral-800 text-white p-6 rounded-lg shadow-lg max-w-lg mx-auto my-8">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="mb-4 text-neutral-300">
            The application encountered an error. Try refreshing the page.
          </p>
          <details className="bg-neutral-900 p-4 rounded-md text-sm">
            <summary className="cursor-pointer mb-2 text-blue-400">Technical Details</summary>
            <p className="mb-2 text-red-400">{this.state.error && this.state.error.toString()}</p>
            <div className="text-neutral-400 overflow-auto max-h-40">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>
          </details>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
