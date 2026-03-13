import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useBackendReadiness } from "./hooks/use-backend-readiness";
import { useSessionCheck } from "./hooks/use-session-check";
// enhanced error components
import ServerIllustration from "@/components/error-components/ServerIllustration";
import StatusPill from "@/components/error-components/StatusPill";
import LoadingDots from "@/components/error-components/LoadingDots";
import CountdownTimer from "@/components/error-components/CountdownTimer";
import ActionButtons from "@/components/error-components/ActionButtons";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import OAuthLoading from "./pages/OAuthLoading";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import ProfileSetup from "./pages/ProfileSetup";
import ProjectDetails from "./pages/ProjectDetails";
import Developers from "./pages/Developers";
import DeveloperProfile from "./pages/DeveloperProfile";
import CompareDevelopers from "./pages/CompareDevelopers";
import Settings from "./pages/Settings";
import Analysis from "./pages/Analysis";
import DebugAuth from "./pages/DebugAuth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isChecking: isCheckingBackend, isReady, error, retry } = useBackendReadiness();
  const { isChecking } = useSessionCheck();

  if (isCheckingBackend) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isReady) {
    // enhanced 503 page using custom illustrations and components
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <div className="relative z-10 w-full max-w-md text-center rounded-3xl bg-card p-8 shadow-card">
          <div className="mb-8">
            <ServerIllustration />
          </div>
          <div className="mb-5 flex justify-center">
            <StatusPill status="offline" />
          </div>
          <div className="gradient-text font-display font-extrabold leading-none mb-2 text-[clamp(3rem,10vw,4rem)] tracking-tight">
            503
          </div>
          <h1 className="font-display font-bold text-xl leading-snug mb-4">
            Service Temporarily Unavailable
          </h1>
          <p className="text-sm font-light leading-relaxed mb-7">
            We're performing quick maintenance or our server is currently under heavy load. Everything will be back online shortly — thanks for your patience.
          </p>
          <div className="mb-6">
            <LoadingDots />
          </div>
          <div className="mb-6">
            <CountdownTimer />
          </div>
          <div className="mb-6">
            <ActionButtons onRetry={() => void retry()} />
          </div>
          <p className="mt-6 text-xs">
            Need urgent help?{' '}
            <a href="mailto:support@yourapp.com" className="hover:underline">
              Contact support →
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Don't render routes while session is being validated
  // This prevents flash of protected content for expired sessions
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/oauth-loading" element={<OAuthLoading />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/projects/:projectId" element={<ProjectDetails />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/profile-setup" element={<ProfileSetup />} />
      <Route path="/developers" element={<Developers />} />
      <Route path="/dev/:username" element={<DeveloperProfile />} />
      <Route path="/compare" element={<CompareDevelopers />} />
      <Route path="/debug/auth" element={<DebugAuth />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class">
      <SettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
