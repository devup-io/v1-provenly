import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Github, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { 
  postGitHubCallback, 
  getDeveloper, 
  getGitHubStatus, 
  getOAuthState, 
  clearOAuthState,
} from "@/lib/api";
import type { DeveloperProfile, GitHubOAuthStatus } from "@/types/api";

const POLL_INTERVAL = 1500; // 1.5 seconds
const POLL_TIMEOUT = 60000; // 60 seconds

const STATUS_MESSAGES: Record<GitHubOAuthStatus, string> = {
  connecting: "Connecting to GitHub...",
  verifying: "Verifying your account...",
  fetching_repositories: "Fetching repositories...",
  finalizing: "Finalizing setup...",
  completed: "Setup completed",
  error: "An error occurred",
};

const STATUS_ORDER: GitHubOAuthStatus[] = [
  "connecting",
  "verifying",
  "fetching_repositories",
  "finalizing",
  "completed",
];

export default function OAuthLoading() {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState<GitHubOAuthStatus>("connecting");
  const [statusMessage, setStatusMessage] = useState(STATUS_MESSAGES.connecting);
  const [progress, setProgress] = useState(0);
  const [developer, setDeveloper] = useState<DeveloperProfile | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Calculate progress based on current status
  const calculateProgress = (status: GitHubOAuthStatus): number => {
    const index = STATUS_ORDER.indexOf(status);
    if (index === -1) return 0;
    return ((index + 1) / STATUS_ORDER.length) * 100;
  };

  // Cleanup function for polling
  const cleanup = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  };

  // Start polling for status updates
  const startPolling = async (state: string) => {
    cleanup();

    const poll = async () => {
      try {
        const statusResponse = await getGitHubStatus(state);
        
        setCurrentStatus(statusResponse.status);
        const msg = statusResponse.status_message || STATUS_MESSAGES[statusResponse.status];
        setStatusMessage(msg);
        setProgress(calculateProgress(statusResponse.status));
        // append new logs if provided
        if (statusResponse.status_logs && statusResponse.status_logs.length > 0) {
          setLogs((prev) => [...prev, ...statusResponse.status_logs]);
        } else {
          // if no explicit logs, at least record the status message once per status change
          setLogs((prev) => {
            const last = prev[prev.length - 1];
            if (msg && msg !== last) {
              return [...prev, msg];
            }
            return prev;
          });
        }

        if (statusResponse.status === "completed") {
          cleanup();
          clearOAuthState();
          // Short delay so user sees the success state
          setTimeout(() => navigate("/welcome"), 1000);
        } else if (statusResponse.status === "error") {
          cleanup();
          const msg = statusResponse.error || "Failed to connect with GitHub. Please try again.";
          setError(msg);
          toast({ title: 'OAuth Error', description: msg, variant: 'destructive' });
        }
      } catch (err) {
        console.error("Error polling status:", err);
        toast({ title: 'Network error', description: 'Unable to poll status. Retrying...', variant: 'destructive' });
        // Don't stop polling on network errors, might be temporary
      }
    };

    // Poll immediately
    await poll();

    // Set up interval polling
    pollIntervalRef.current = setInterval(poll, POLL_INTERVAL);

    // Set up timeout
    pollTimeoutRef.current = setTimeout(() => {
      cleanup();
      setError("Connection timeout. Please try again.");
    }, POLL_TIMEOUT);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const urlState = urlParams.get("state");

    const handleOAuthFlow = async () => {
      // Case 1: OAuth callback (code and state in URL)
      if (code && urlState) {
        try {
          // Start polling with the state from URL
          await startPolling(urlState);

          // Call the callback endpoint
          const token = await postGitHubCallback(code, urlState);
          if (token && token.developer) {
            setDeveloper(token.developer as DeveloperProfile);
          }

          // Note: Repository import is now manual only via profile setup step 2
          // Users will select their organization and repos to import
        } catch (err) {
          cleanup();
          console.error("Error during OAuth callback:", err);
          const msg = err instanceof Error ? err.message : String(err);
          setError(msg || "Failed to connect with GitHub. Please try again.");
          toast({ title: 'OAuth Callback Error', description: msg || 'Failed to connect with GitHub.', variant: 'destructive' });
        }
        return;
      }

      // Case 2: Returning to check status (state in localStorage)
      const storedState = getOAuthState();
      if (storedState) {
        try {
          await startPolling(storedState);
        } catch (err) {
          cleanup();
          console.error("Error polling status:", err);
          setError("Failed to check connection status. Please try again.");
        }
        return;
      }

      // Case 3: No OAuth params - check if already logged in
      const local = getDeveloper();
      if (local) {
        setDeveloper(local);
        setCurrentStatus("completed");
        setStatusMessage("Already connected");
        setProgress(100);
        setTimeout(() => navigate("/welcome"), 800);
        return;
      }

      // Case 4: No OAuth params and not logged in
      // Show error after a brief delay so UI doesn't flash
      setTimeout(() => {
        setError("No authentication detected. Please connect your GitHub account.");
      }, 500);
    };

    void handleOAuthFlow();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md text-center"
      >
        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          {/* Avatar / Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary"
          >
            {error ? (
              <XCircle className="h-10 w-10 text-destructive" />
            ) : developer ? (
              <img 
                src={developer.github_avatar || "/default-avatar.png"} 
                alt={developer.name || developer.github_username} 
                className="h-20 w-20 rounded-full object-cover" 
              />
            ) : (
              <Github className="h-10 w-10 text-primary-foreground" />
            )}
          </motion.div>

          {/* Status Text */}
          <h2 className="mb-2 text-heading-sm">
            {error 
              ? "Connection Failed" 
              : developer 
                ? `Welcome, ${developer.name || developer.github_username}!` 
                : "Connecting your GitHub account"}
          </h2>
          <p className="mb-4 text-body text-muted-foreground">
            {error 
              ? "We couldn't complete the connection." 
              : developer 
                ? "You're all set!" 
                : "This helps keep Provenly profiles real and trustworthy."}
          </p>

          {/* Progress Bar */}
          {!error && (
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Steps or Error */}
          <div className="space-y-3">
            {error ? (
              <div className="text-center">
                <p className="mb-4 text-body-sm text-destructive">{error}</p>
                <button 
                  onClick={() => navigate('/signup')} 
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {STATUS_ORDER.map((status, index) => {
                const currentIndex = STATUS_ORDER.indexOf(currentStatus);
                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;
                const isPending = index > currentIndex;

                return (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: isCompleted || isActive ? 1 : 0.3,
                      x: 0,
                    }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="flex items-center gap-3"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-border flex-shrink-0" />
                    )}
                    <span 
                      className={`text-body-sm text-left ${
                        isCompleted || isActive ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {isActive ? statusMessage : STATUS_MESSAGES[status]}
                    </span>
                  </motion.div>
                );
              })}

                {/* Log timeline */}
                {logs.length > 0 && (
                  <div className="mt-6 text-left text-body-sm text-muted-foreground space-y-1">
                    {logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-mono">{idx + 1}.</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
