import { lazy, Suspense } from "react";
import { Route, Router as WouterRouter, Switch } from "wouter";
import { AstraMark } from "./components/AstraMark";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// The 3D scene is the heaviest thing in the project, so it only loads when
// someone actually opens the simulation.
const Simulation = lazy(() => import("./pages/Simulation"));

function LoadingSimulation() {
  return (
    <div className="page failure">
      <div className="failure-card is-quiet">
        <AstraMark size={30} />
        <h1>Loading the model…</h1>
        <p>
          Fetching the renderer and the orbital records. On a slow connection
          that takes a moment; nothing is downloaded per visit beyond this.
        </p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Suspense fallback={<LoadingSimulation />}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/simulate" component={Simulation} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </WouterRouter>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}


