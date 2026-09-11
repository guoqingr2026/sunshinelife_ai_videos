import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-8 max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-red-400 mb-4">页面加载出错</h1>
          <pre className="text-sm text-gray-300 bg-darker p-4 rounded overflow-auto whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary rounded-lg text-sm"
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
