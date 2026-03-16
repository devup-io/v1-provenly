import { motion } from "framer-motion";
import { Github, Shield, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getDeveloper, getGitHubAuthorize, saveOAuthState, getCurrentDeveloper } from "@/lib/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [isConnecting, setIsConnecting] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');

    // If we were explicitly redirected here due to session expiration, show the expired state.
    if (errorParam === 'session_expired') {
      setSessionExpired(true);
      return;
    }

    const checkSession = async () => {
      try {
        const dev = getDeveloper();
        if (!dev) return;

        // Verify the session is actually valid using /me endpoint
        try {
          await getCurrentDeveloper();
          // Session valid - redirect to welcome
          navigate('/welcome');
        } catch (err) {
          // Session invalid - stay on login/signup and mark expired
          console.warn('Session expired, showing login');
          setSessionExpired(true);
        }
      } catch (e) {
        // ignore
      }
    };

    checkSession();
  }, [navigate]);

  const handleGitHubSignUp = async () => {
    try {
      setIsConnecting(true);
      
      // Get authorization URL and state from backend
      const { authorization_url, state } = await getGitHubAuthorize();
      
      // Save state to localStorage for verification after redirect
      // Clear any existing developer data to ensure clean slate
      localStorage.removeItem('v1_developer');
      saveOAuthState(state);
      
      console.log('[OAuth] Starting GitHub OAuth flow with state:', state);
      
      // Redirect to GitHub authorization page
      window.location.href = authorization_url;
    } catch (err) {
      console.error("Error initiating GitHub OAuth:", err);
      setIsConnecting(false);
      
      // Show error in alert
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to backend";
      alert(`Error: ${errorMessage}\n\nPlease make sure:\n1. Backend is running at http://localhost:8000\n2. CORS is configured to allow requests from this origin`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="text-heading font-bold tracking-tight">Provenly</span>
          </div>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="mb-3 text-display-sm">
              {sessionExpired ? 'Log in to your Provenly profile' : 'Create your Provenly developer profile'}
            </h1>
            <p className="text-body text-muted-foreground">
              {sessionExpired
                ? 'Your session expired or you previously signed in. Please log in again.'
                : 'Let companies evaluate your real work, not just your CV.'}
            </p>
          </div>

          {/* GitHub Sign Up Button */}
          <Button
            onClick={handleGitHubSignUp}
            size="xl"
            className="w-full gap-3"
            disabled={isConnecting}
          >
            <Github className="h-5 w-5" />
            {isConnecting ? "Connecting..." : sessionExpired ? "Log in with GitHub" : "Continue with GitHub"}
          </Button>

          {/* Helper text */}
          <div className="mt-6 flex items-start gap-3 rounded-xl bg-muted/50 p-4">
            <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
            <p className="text-body-sm text-muted-foreground">
              We only access public profile and repositories. No emails. No passwords.
            </p>
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-caption text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Secondary Link */}
          <Button
            variant="outline"
            onClick={() => navigate("/developers")}
            className="w-full gap-2"
          >
            <Eye className="h-4 w-4" />
            View example profiles
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-body-sm text-muted-foreground">
          By signing up, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </motion.div>
    </div>
  );
}
