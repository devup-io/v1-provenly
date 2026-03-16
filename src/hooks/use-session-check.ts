import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeveloper, clearAuth, apiRequest, isAuthError } from '@/lib/api';

/**
 * Get JWT token from cookie (non-HttpOnly tokens only)
 * Note: If token is HttpOnly, JavaScript cannot access it
 * In that case, we rely on the browser to send it automatically
 * with credentials: 'include' in fetch requests
 */
function getJWTToken(): string | null {
  try {
    const cookies = document.cookie.split(';');
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'v1_access_token') {
        return decodeURIComponent(value);
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Hook to validate JWT session on app load
 * CRITICAL: Checks if JWT token is still valid before allowing access
 * 
 * How it works:
 * 1. Checks if developer data exists in localStorage
 * 2. Attempts to read JWT from v1_access_token cookie (may not be accessible if HttpOnly)
 * 3. If token is readable and expired: Clear session + redirect to login immediately
 * 4. If token is not readable (HttpOnly): Skip to backend validation
 * 5. Call backend /api/v1/me to validate token (browser sends cookie automatically)
 * 6. If backend returns 401: Clear session + redirect
 * 
 * Security: This prevents users from accessing protected routes with expired JWTs
 * Backend validation happens regardless of whether we can read the cookie
 */
export function useSessionCheck() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  const redirectToSignIn = () => {
    clearAuth();
    navigate('/signup?error=session_expired', { replace: true });
  };

  useEffect(() => {
    const validateSession = async () => {
      try {
        const developer = getDeveloper();

        // If no developer in localStorage, nothing to validate
        if (!developer || !developer.id) {
          setIsChecking(false);
          return;
        }

        // STEP 1: Try to read JWT token from cookie (may not be accessible if HttpOnly)
        const jwtToken = getJWTToken();

        // If we CAN read the token, validate it client-side first
        if (jwtToken) {
          try {
            const parts = jwtToken.split('.');
            if (parts.length === 3) {
              const payloadStr = atob(parts[1]);
              const payload = JSON.parse(payloadStr);

              if (payload.exp) {
                const expirationTime = payload.exp * 1000;
                const currentTime = Date.now();
                const isExpired = currentTime > expirationTime;

                if (isExpired) {
                  redirectToSignIn();
                  return;
                }
              }
            }
          } catch {
            // If decoding fails, rely on backend validation.
          }
        }

        // STEP 2: Always verify with backend (even if token is HttpOnly)
        // Use apiRequest so it can include the access token header (if stored)
        try {
          await apiRequest('/api/v1/me', { method: 'GET' });
          setIsChecking(false);
          return;
        } catch (err) {
          if (isAuthError(err)) {
            redirectToSignIn();
            return;
          }

          const message = err instanceof Error ? err.message : String(err);
          if (message.includes('404')) {
            clearAuth();
            setIsChecking(false);
            return;
          }

          setIsChecking(false);
          return;
        }

      } catch {
        setIsChecking(false);
      }
    };

    validateSession();
  }, [navigate]);

  return { isChecking };
}
