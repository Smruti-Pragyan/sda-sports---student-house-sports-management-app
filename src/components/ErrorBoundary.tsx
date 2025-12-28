import React, { Component, ErrorInfo, PropsWithChildren } from 'react';

// Standard interface for state
interface State {
    hasError: boolean;
    error: Error | null;
}

// Use PropsWithChildren<{}> to automatically handle the 'children' prop type definition
class ErrorBoundary extends Component<PropsWithChildren<{}>, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-red-50 dark:bg-gray-900 p-4">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-2xl w-full border border-red-200 dark:border-red-900">
                        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Something went wrong</h1>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">The application encountered an unexpected error.</p>
                        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-60 mb-6 border border-gray-300 dark:border-gray-700">
                            <code className="text-sm font-mono text-red-800 dark:text-red-300 whitespace-pre-wrap">
                                {this.state.error?.toString()}
                            </code>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            );
        }

        // Fix: Wrap in a Fragment. This is the safest way to return children in TS.
        return <React.Fragment>{(this as any).props.children}</React.Fragment>;
    }
}

export default ErrorBoundary;