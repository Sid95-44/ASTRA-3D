import { Toaster } from "sonner";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import Landing from "./pages/Landing";
import Simulation from "./pages/Simulation";
import { ThemeProvider } from "./state/ThemeContext";

function Router() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/simulate" component={Simulation} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <Toaster theme="dark" richColors position="bottom-right" />
        <Router />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
