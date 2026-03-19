import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "next-themes";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useBackendReadiness } from "./hooks/use-backend-readiness";
import { useSessionCheck } from "./hooks/use-session-check";
import { ErrorScreen } from "@/components/ErrorScreen";
import { GuidedTour } from "@/components/GuidedTour";
import Index from "./pages/Index";
import SignUp from "./pages/SignUp";
import OAuthLoading from "./pages/OAuthLoading";
import AuthCallback from "./pages/AuthCallback";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Welcome from "./pages/Welcome";
import ProfileSetup from "./pages/ProfileSetup";
import EditProfile from "./pages/EditProfile";
import ProjectDetails from "./pages/ProjectDetails";
import Developers from "./pages/Developers";
import DeveloperProfile from "./pages/DeveloperProfile";
import CompareDevelopers from "./pages/CompareDevelopers";
import Settings from "./pages/Settings";
import Analysis from "./pages/Analysis";
import DebugAuth from "./pages/DebugAuth";
import MockDashboard from "./pages/MockDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isChecking: isCheckingBackend, isReady, error, retry } = useBackendReadiness();
  const { isChecking } = useSessionCheck();
  const [bypassBackendCheck, setBypassBackendCheck] = useState(false);

  if (isCheckingBackend) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isReady && !bypassBackendCheck) {
    return (
      <ErrorScreen
        statusCode="503"
        title="Service temporarily unavailable"
        subtitle="We are reconnecting things behind the scenes."
        message="Our servers are temporarily unavailable. Please try again in a few moments."
        onRetry={() => void retry()}
        primaryActionLabel="Try again"
        onSecondaryAction={import.meta.env.DEV ? () => setBypassBackendCheck(true) : undefined}
        secondaryActionLabel={import.meta.env.DEV ? "Continue in dev mode" : undefined}
      />
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
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/oauth-loading" element={<OAuthLoading />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/mock-dashboard" element={<MockDashboard />} />
        <Route path="/dashboard/projects/:projectId" element={<ProjectDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dev/:username" element={<DeveloperProfile />} />
        <Route path="/compare" element={<CompareDevelopers />} />
        <Route path="/debug/auth" element={<DebugAuth />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <GuidedTour />
    </>
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
