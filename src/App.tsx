import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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
import CVUpload from "./pages/CVUpload";
import ProjectDetails from "./pages/ProjectDetails";
import Developers from "./pages/Developers";
import DeveloperProfile from "./pages/DeveloperProfile";
import CompareDevelopers from "./pages/CompareDevelopers";
import Settings from "./pages/Settings";
import Analysis from "./pages/Analysis";
import DebugAuth from "./pages/DebugAuth";
import MockAnalyzer from "./pages/MockAnalyzer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import HowItWorks from "./pages/HowItWorks";
import Status from "./pages/Status";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import SeoArticlePage from "./pages/seo/SeoArticlePage";
import WhatIsProvenly from "./pages/WhatIsProvenly";
import FeaturesPage from "./pages/FeaturesPage";
import UseCasesPage from "./pages/UseCasesPage";

const queryClient = new QueryClient();

function AppContent() {
  const { isChecking: isCheckingBackend, isReady, error, retry } = useBackendReadiness();
  const { isChecking } = useSessionCheck();
  const [bypassBackendCheck, setBypassBackendCheck] = useState(false);
  const location = useLocation();

  if (isCheckingBackend) {
    // Show a full-page skeleton while checking backend
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero w-full">
        <div className="w-full max-w-2xl space-y-6">
          <div className="h-8 w-1/3 mb-4 rounded bg-muted animate-pulse" />
          <div className="h-12 w-full mb-2 rounded bg-muted animate-pulse" />
          <div className="h-64 w-full rounded bg-muted animate-pulse" />
          <div className="h-8 w-1/2 mt-8 rounded bg-muted animate-pulse" />
        </div>
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
    // Show a full-page skeleton while checking session
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-hero w-full">
        <div className="w-full max-w-2xl space-y-6">
          <div className="h-8 w-1/3 mb-4 rounded bg-muted animate-pulse" />
          <div className="h-12 w-full mb-2 rounded bg-muted animate-pulse" />
          <div className="h-64 w-full rounded bg-muted animate-pulse" />
          <div className="h-8 w-1/2 mt-8 rounded bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Routes location={location} key={location.key}>
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
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/cv-upload" element={<CVUpload />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/status" element={<Status />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/what-is-provenly" element={<WhatIsProvenly />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/use-cases" element={<UseCasesPage />} />
        <Route
          path="/resources/best-platform-to-showcase-developer-projects"
          element={<SeoArticlePage slug="best-platform-to-showcase-developer-projects" />}
        />
        <Route
          path="/resources/developer-portfolio-no-experience"
          element={<SeoArticlePage slug="developer-portfolio-no-experience" />}
        />
        <Route
          path="/resources/where-to-showcase-programming-projects"
          element={<SeoArticlePage slug="where-to-showcase-programming-projects" />}
        />
        <Route
          path="/resources/get-noticed-by-tech-recruiters"
          element={<SeoArticlePage slug="get-noticed-by-tech-recruiters" />}
        />
        <Route
          path="/resources/provenly-vs-github-portfolio"
          element={<SeoArticlePage slug="provenly-vs-github-portfolio" />}
        />
        <Route
          path="/resources/how-many-projects-in-coding-portfolio"
          element={<SeoArticlePage slug="how-many-projects-in-coding-portfolio" />}
        />
        <Route
          path="/resources/present-backend-projects-for-recruiters"
          element={<SeoArticlePage slug="present-backend-projects-for-recruiters" />}
        />
        <Route
          path="/resources/present-frontend-projects-for-recruiters"
          element={<SeoArticlePage slug="present-frontend-projects-for-recruiters" />}
        />
        <Route
          path="/resources/student-developer-portfolio-internships"
          element={<SeoArticlePage slug="student-developer-portfolio-internships" />}
        />
        <Route
          path="/resources/choose-featured-projects-developer-portfolio"
          element={<SeoArticlePage slug="choose-featured-projects-developer-portfolio" />}
        />
        <Route path="/dev/:username" element={<DeveloperProfile />} />
        <Route path="/compare" element={<CompareDevelopers />} />
        <Route path="/debug/auth" element={<DebugAuth />} />
        <Route path="/mock-analyzer" element={<MockAnalyzer />} />
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
