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
        <div className="p-8 max-w-2xl mx-auto panel">
          <h1 className="text-xl font-bold text-red-600 mb-4">页面加载出错</h1>
          <pre className="text-sm text-muted code-block whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4 text-sm">
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
