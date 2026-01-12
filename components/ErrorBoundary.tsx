
import React, { Component, ReactNode } from 'react';

// Defining interfaces for Props and State to ensure correct type inheritance
interface ErrorBoundaryProps {
  // Making children optional to fix "Property 'children' is missing" errors in parent components (e.g., App.tsx)
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

// Ensure the class correctly extends Component with the specified Props and State types
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare state and props to satisfy the compiler if it fails to infer them from the base class
  state: ErrorBoundaryState;
  props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Initialize state directly
    this.state = { hasError: false, error: undefined };
    // Assigning props as well for environments with strict property checking
    this.props = props;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    // Access state through this.state which is now explicitly declared
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background-primary)] p-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-bold mb-4 text-[var(--color-text-primary)] font-black">
              عذراً، حدث خطأ غير متوقع
            </h1>
            <p className="text-[var(--color-text-secondary)] mb-6 font-bold">
              {this.state.error?.message || 'خطأ غير معروف في النظام'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[var(--color-accent-emerald)] hover:opacity-90 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all active:scale-95"
            >
              إعادة تحميل التطبيق
            </button>
          </div>
        </div>
      );
    }

    // Explicitly return children from this.props which is now explicitly declared
    return this.props.children;
  }
}

export default ErrorBoundary;