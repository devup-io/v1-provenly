import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { DeveloperProfile } from '@/types/api';
import { saveDeveloper, getCurrentDeveloper, clearOAuthState, refreshAuthSession, isAuthError, clearLegacyAuthStorageKeysOnce, postGitHubCallback, getGitHubStatus, getOAuthState } from '@/lib/api';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const resolveCurrentDeveloper = useCallback(async (): Promise<DeveloperProfile | null> => {
    const delays = [250, 500, 800, 1200, 1600, 2000, 2500, 3000];

    for (let attempt = 0; attempt < delays.length; attempt++) {
      try {
        return await getCurrentDeveloper();
      } catch (err) {
        if (isAuthError(err)) {
          try {
            await refreshAuthSession();
            return await getCurrentDeveloper();
          } catch {
            // Continue retry loop
          }
        }
        await sleep(delays[attempt]);
      }
    }

    return null;
  }, []);

  const processCallback = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentPath = window.location.pathname;
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      const errorDescription = params.get('error_description');
      const code = params.get('code');
      const state = params.get('state');

      // Remove query/hash from URL immediately to avoid leaking callback params
      window.history.replaceState({}, document.title, currentPath);

      if (errorParam) {
        setError(errorDescription || 'Authentication failed. Please try again.');
        setLoading(false);
        return;
      }

      const callbackState = state || getOAuthState();

      // If provider redirected with code/state, finalize exchange on backend to set auth cookies.
      if (code && state) {
        try {
          await postGitHubCallback(code, state);
        } catch {
          // Some deployments finalize callback server-side and only redirect here.
          // Continue with /me checks to support both modes.
        }
      }

      let accurateDeveloper: DeveloperProfile | null = await resolveCurrentDeveloper();

      // Fallback for async OAuth processing on backend: wait for status=completed, then retry /me.
      if (!accurateDeveloper && callbackState) {
        const pollStart = Date.now();
        const timeoutMs = 45000;
        const intervalMs = 1500;

        while (Date.now() - pollStart < timeoutMs) {
          try {
            const status = await getGitHubStatus(callbackState);

            if (status.status === 'completed') {
              accurateDeveloper = await resolveCurrentDeveloper();
              if (accurateDeveloper) {
                break;
              }
            }

            if (status.status === 'error') {
              throw new Error(status.error || status.status_message || 'Authentication failed.');
            }
          } catch {
            // Continue polling in case of transient errors
          }

          await sleep(intervalMs);
        }
      }

      if (!accurateDeveloper) {
        throw new Error('Sign-in session could not be established. Please try again.');
      }

      clearOAuthState();

      saveDeveloper(accurateDeveloper);

      if (accurateDeveloper.profile_complete) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch (err) {
      const message = isAuthError(err)
        ? 'We could not confirm your new session yet. Please try again.'
        : err instanceof Error
        ? err.message
        : 'Failed to complete sign-in.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [navigate, resolveCurrentDeveloper]);

  useEffect(() => {
    clearLegacyAuthStorageKeysOnce();
    void processCallback();
  }, [processCallback]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="text-center max-w-md">
        {loading && <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
            <p className="font-semibold text-red-800 dark:text-red-200">Authentication Error</p>
          </div>
        )}
        <p className="text-body text-muted-foreground">
          {error ? error : 'Completing authentication...'}
        </p>
        {error && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <Button size="sm" onClick={() => void processCallback()}>
              Try again
            </Button>
            <Button size="sm" variant="outline" onClick={() => navigate('/signup')}>
              Back to sign in
            </Button>
          </div>
        )}
        {!error && loading && (
          <p className="mt-2 text-caption text-muted-foreground">
            This may take a few seconds
          </p>
        )}
      </div>
    </div>
  );
}
