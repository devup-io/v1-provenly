import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import type { DeveloperProfile } from '@/types/api';
import { saveDeveloper, getCurrentDeveloper } from '@/lib/api';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        // Extract developer data from URL
        const params = new URLSearchParams(window.location.search);
        const encodedData = params.get('data');
        const errorParam = params.get('error');

        // Debug logging

        // Check for error from backend
        if (errorParam) {
          const errorMessage = params.get('error_description') || 'Authentication failed. Please try again.';
          setError(errorMessage);
          setTimeout(() => {
            navigate('/signup?error=auth_failed');
          }, 2000);
          return;
        }

        if (!encodedData) {
          setError('No authentication data received.');
          setTimeout(() => {
            navigate('/signup?error=no_token');
          }, 2000);
          return;
        }

        // Decode from base64
        const decoded = atob(decodeURIComponent(encodedData));

        const parsedData = JSON.parse(decoded);

        // Immediately remove the token/data from the URL so it isn't stored in history
        // and keep it out of accidental logs, while still allowing router navigation.
        window.history.replaceState({}, document.title, '/dashboard');

        // Handle different backend response structures
        let developer: DeveloperProfile;
        
        if (parsedData.developer) {
          // Expected structure: { developer: {...} }
          developer = parsedData.developer;
        } else if (parsedData.id || parsedData.github_username) {
          // Alternative structure: developer fields at root level
          developer = parsedData;
        } else {
          throw new Error('Invalid developer data structure from backend');
        }
        
        // Validate required fields
        if (!developer.id) {
          throw new Error('Developer ID missing from backend response');
        }
        if (!developer.github_username) {
          throw new Error('GitHub username missing from backend response');
        }
        
        // Set defaults for optional fields
        if (developer.profile_complete === undefined || developer.profile_complete === null) {
          developer.profile_complete = false;
        }
        

        // Store developer in localStorage (initial data from OAuth callback)
        saveDeveloper(developer);

        // Note: Repository import is now manual only via profile setup step 2
        // Users will select their organization and repos to import

        // Clear OAuth state after successful completion
        try {
          localStorage.removeItem('v1_oauth_state');
        } catch (e) {
          // ignore
        }

        // IMPORTANT: Fetch accurate developer data from server
        // This validates the JWT token and gets the correct profile_complete status
        let accurateDeveloper: DeveloperProfile;
        try {
          accurateDeveloper = await getCurrentDeveloper();
        } catch (err) {
          // Fall back to OAuth callback data if server call fails
          accurateDeveloper = developer;
        }

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
