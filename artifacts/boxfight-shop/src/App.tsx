import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Disclaimer from "@/pages/disclaimer";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Admin from "@/pages/admin";
import Info from "@/pages/info";
import TokenSettings from "@/pages/token-settings";
import AccessDenied from "@/pages/access-denied";
import { AuthGuard } from "@/components/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Disclaimer} />
      <Route path="/login" component={Login} />
      <Route path="/access-denied" component={AccessDenied} />

      <Route path="/dashboard">
        <AuthGuard>
          <AppShell>
            <Dashboard />
          </AppShell>
        </AuthGuard>
      </Route>

      <Route path="/token-settings">
        <AuthGuard>
          <AppShell>
            <TokenSettings />
          </AppShell>
        </AuthGuard>
      </Route>

      <Route path="/admin">
        <AuthGuard requireAdmin>
          <AppShell>
            <Admin />
          </AppShell>
        </AuthGuard>
      </Route>

      <Route path="/info">
        <AuthGuard requireAdmin>
          <AppShell>
            <Info />
          </AppShell>
        </AuthGuard>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
