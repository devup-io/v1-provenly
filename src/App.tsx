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
import MockDashboard from "./pages/MockDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Help from "./pages/Help";
import HowItWorks from "./pages/HowItWorks";
import Status from "./pages/Status";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import SeoArticlePage from "./pages/seo/SeoArticlePage";

const queryClient = new QueryClient();

function AppContent() {
  const { isChecking: isCheckingBackend, isReady, error, retry } = useBackendReadiness();
  const { isChecking } = useSessionCheck();
  const [bypassBackendCheck, setBypassBackendCheck] = useState(false);
  const location = useLocation();

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
      <Routes location={location} key={location.key}>
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
        <Route path="/profile/cv-upload" element={<CVUpload />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<Help />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/status" element={<Status />} />
        <Route path="/notifications" element={<Notifications />} />
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
