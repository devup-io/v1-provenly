import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { DeveloperProfile } from '@/types/api';
import { saveDeveloper, getCurrentDeveloper, clearOAuthState } from '@/lib/api';

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

        // IMPORTANT: Fetch accurate developer data from server
        // This validates the JWT token and gets the correct profile_complete status
        const accurateDeveloper: DeveloperProfile = await getCurrentDeveloper();

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
        const message = error instanceof Error ? error.message : 'Failed to process authentication';
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
