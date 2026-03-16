import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { DeveloperProfile } from '@/types/api';
import { saveDeveloper, getCurrentDeveloper, clearOAuthState, refreshAuthSession, isAuthError } from '@/lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const currentPath = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');

        // Remove query/hash from URL immediately to avoid leaking callback params
        window.history.replaceState({}, document.title, currentPath);

        if (errorParam) {
          const errorMessage = errorDescription || 'Authentication failed. Please try again.';
          setError(errorMessage);
          setTimeout(() => {
            navigate('/signup?error=auth_failed');
          }, 2000);
          return;
        }

        clearOAuthState();

        // IMPORTANT: Fetch accurate developer data from server.
        // With cookie-based auth, allow a few retries while cookies/session settle.
        let accurateDeveloper: DeveloperProfile | null = null;
        const delays = [250, 600, 1200];

        for (let attempt = 0; attempt < delays.length; attempt++) {
          try {
            accurateDeveloper = await getCurrentDeveloper();
            break;
          } catch (err) {
            if (isAuthError(err)) {
              try {
                await refreshAuthSession();
              } catch {
                // Refresh may fail if no refresh cookie yet; retry /me after delay.
              }
            }
            await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
          }
        }

        if (!accurateDeveloper) {
          throw new Error('Sign-in session could not be established. Please try again.');
        }

        saveDeveloper(accurateDeveloper);

        // Route based on profile completion
        if (accurateDeveloper.profile_complete) {
          // Returning user - go to dashboard instead of preview
          navigate('/dashboard');
        } else {
          // New user - show onboarding
          navigate('/onboarding');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to complete sign-in.';
        setError(message);
        
        // Show error for a bit longer so user can read it
        setTimeout(() => {
          navigate('/signup?error=auth_failed');
        }, 3000);
      }
    };

    processCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="text-center max-w-md">
        {!error && <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <p className="font-semibold text-red-800 dark:text-red-200">Authentication Error</p>
          </div>
        )}
        <p className="text-body text-muted-foreground">
          {error ? error : 'Completing authentication...'}
        </p>
        {error && (
          <p className="mt-2 text-caption text-muted-foreground">
            Redirecting to sign-in page...
          </p>
        )}
        {!error && (
          <p className="mt-2 text-caption text-muted-foreground">
            This may take a few seconds
          </p>
        )}
      </div>
    </div>
  );
}
