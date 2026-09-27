import { Component, type ReactNode } from "react";
import { AstraMark } from "@/components/AstraMark";

type Props = { children: ReactNode };
type State = { error: Error | null };

/**
 * Failures get shown, not smoothed over: the real message is on screen because
 * hiding it would make this harder to fix, not easier to look at.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="page failure">
        <div className="failure-card">
          <AstraMark size={30} />
          <h1>Something broke while drawing the model.</h1>
          <p>
            This is a bug, not a designed state. Nothing you have saved is lost
            — the notebook and saved runs live in this browser, not in memory.
            Reloading usually clears it.
          </p>
          <pre>{error.stack ?? error.message}</pre>
          <div className="failure-actions">
            <button
              type="button"
              className="btn is-primary"
              onClick={() => window.location.reload()}
            >
              Reload ASTRA
            </button>
            <a className="btn" href="./">
              Back to the story
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
