import { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Marginalia caught error in ErrorBoundary:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[320px] w-full flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl shadow-purple-100/30 border-b-4 border-rose-200 text-center">
            <div className="w-16 h-16 bg-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-5 text-rose-500 shadow-md transform -rotate-3">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-[#4a4458] mb-2">
              {this.props.fallbackTitle || "Something went wrong here"}
            </h3>

            <p className="text-sm text-[#9b8fad] mb-6 leading-relaxed">
              An unexpected error occurred in this view. Don't worry, your saved notes are secure on the server.
            </p>

            {this.state.error?.message && (
              <div className="p-3 bg-[#faf8fc] rounded-2xl text-xs text-rose-600 font-mono mb-6 text-left break-words border border-rose-100 max-h-24 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] text-white rounded-2xl shadow-md hover:shadow-lg transition-all font-semibold text-sm hover:scale-102"
              >
                <RotateCcw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-purple-200 text-[#4a4458] rounded-2xl hover:bg-purple-50 transition-all font-semibold text-sm"
              >
                <Home className="w-4 h-4 text-[#a78bfa]" />
                Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
