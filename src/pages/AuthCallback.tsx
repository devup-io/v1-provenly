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
        const callbackState = params.get('state');
        const errorParam = params.get('error');

        // Debug logging
        console.log('=== OAuth Callback Debug ===');
        console.log('Full URL:', window.location.href);
        console.log('Search params:', window.location.search);
        console.log('Parsed params:', {
          data: encodedData ? `${encodedData.substring(0, 30)}...` : null,
          state: callbackState,
          error: errorParam,
          allParams: Array.from(params.entries())
        });

        // Check for error from backend
        if (errorParam) {
          const errorMessage = params.get('error_description') || 'Authentication failed. Please try again.';
          console.error('OAuth error from backend:', errorParam, errorMessage);
          setError(errorMessage);
          setTimeout(() => {
            navigate('/signup?error=auth_failed');
          }, 2000);
          return;
        }

        if (!encodedData) {
          console.error('No data parameter in callback URL. Backend should redirect to /auth/callback?data=BASE64_ENCODED_DEVELOPER');
          console.error(`
❌ Backend OAuth Callback Issue:

The backend successfully completed OAuth but didn't redirect properly.

Expected flow:
1. User redirected to GitHub ✅
2. GitHub redirects to backend /api/v1/auth/github/callback ✅
3. Backend creates developer and token ✅
4. Backend sets cookie ✅
5. Backend redirects to frontend: ❌ MISSING
   
   Should be: http://localhost:8080/auth/callback?data=BASE64_ENCODED_DEVELOPER_JSON&state=OAUTH_STATE
   
Backend code should look like:
   
   import base64
   import json
   from fastapi.responses import RedirectResponse
   
   # After creating developer
   developer_data = {
     "developer": {
       "id": developer.id,
       "github_username": developer.github_username,
       "name": developer.name,
       "avatar_url": developer.avatar_url,
       "profile_complete": developer.profile_complete,
       # ... other fields
     }
   }
   
   encoded = base64.b64encode(json.dumps(developer_data).encode()).decode()
   redirect_url = f"http://localhost:8080/auth/callback?data={encoded}&state={state}"
   
   response = RedirectResponse(url=redirect_url, status_code=302)
   response.set_cookie("v1_access_token", token, httponly=True, ...)
   return response
          `.trim());
          setError('No authentication data received.');
          setTimeout(() => {
            navigate('/signup?error=no_token');
          }, 2000);
          return;
        }

        // Decode from base64
        const decoded = atob(decodeURIComponent(encodedData));
        console.log('Decoded data:', decoded);

        const parsedData = JSON.parse(decoded);
        console.log('Parsed data structure:', parsedData);

        // Immediately remove the token/data from the URL so it isn't stored in history
        // and keep it out of accidental logs, while still allowing router navigation.
        window.history.replaceState({}, document.title, '/dashboard');

        // If we received an access token, store it in sessionStorage (not localStorage)
        // so it is cleared when the tab closes.
        if (parsedData.access_token) {
          sessionStorage.setItem('v1_access_token', parsedData.access_token);
        }

        // Handle different backend response structures
        let developer: DeveloperProfile;
        
        if (parsedData.developer) {
          // Expected structure: { developer: {...} }
          developer = parsedData.developer;
          console.log('Using nested developer object');
        } else if (parsedData.id || parsedData.github_username) {
          // Alternative structure: developer fields at root level
          developer = parsedData;
          console.log('Using root-level developer data');
        } else {
          console.error('Unknown data structure:', parsedData);
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
          console.warn('profile_complete not set, defaulting to false');
          developer.profile_complete = false;
        }
        
        console.log('Developer data:', {
          id: developer.id,
          name: developer.name,
          username: developer.github_username,
          profile_complete: developer.profile_complete
        });

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
        console.log('Fetching accurate developer data from server...');
        let accurateDeveloper: DeveloperProfile;
        try {
          accurateDeveloper = await getCurrentDeveloper();
          console.log('Updated developer data from server:', {
            id: accurateDeveloper.id,
            profile_complete: accurateDeveloper.profile_complete,
            username: accurateDeveloper.github_username,
          });
        } catch (err) {
          console.warn(
            'Failed to fetch accurate developer data from server:',
            err instanceof Error ? err.message : String(err)
          );
          // Fall back to OAuth callback data if server call fails
          console.warn('Using developer data from OAuth callback');
          accurateDeveloper = developer;
        }

        // Route based on profile completion
        console.log('Routing decision - profile_complete:', accurateDeveloper.profile_complete);
        if (accurateDeveloper.profile_complete) {
          // Returning user - go to dashboard instead of preview
          console.log('Redirecting to dashboard (returning user)');
          navigate('/dashboard');
        } else {
          // New user - show onboarding
          console.log('Redirecting to onboarding (new user)');
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Failed to process auth callback:', error);
        
        // More detailed error logging
        if (error instanceof SyntaxError) {
          console.error('JSON parsing failed - backend sent invalid JSON');
        } else if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack
          });
        }
        
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
