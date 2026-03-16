import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeveloper, clearAuth, apiRequest } from '@/lib/api';

/**
 * Get JWT token from cookie (non-HttpOnly tokens only)
 * Note: If token is HttpOnly, JavaScript cannot access it
 * In that case, we rely on the browser to send it automatically
 * with credentials: 'include' in fetch requests
 */
function getJWTToken(): string | null {
  try {
    console.log('[Session Check] Reading cookies from document.cookie...');
    const cookies = document.cookie.split(';');
    const cookieNames = cookies.map(c => c.trim().split('=')[0]).filter(Boolean);
    console.log('[Session Check] All accessible cookies:', cookieNames);
    
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'v1_access_token') {
        console.log('[Session Check] ✅ Found v1_access_token in document.cookie');
        return decodeURIComponent(value);
      }
    }
    
    console.warn('[Session Check] ⚠️ v1_access_token not found in document.cookie');
    console.warn('[Session Check] NOTE: If token is HttpOnly, it will NOT appear here');
    console.warn('[Session Check] But browser will STILL send it automatically in requests');
    return null;
  } catch (err) {
    console.error('[Session Check] Error reading cookies:', err);
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

  useEffect(() => {
    const validateSession = async () => {
      try {
        console.log('\n╔════════════════════════════════════════╗');
        console.log('║ SESSION VALIDATION STARTING            ║');
        console.log('╚════════════════════════════════════════╝\n');

        const developer = getDeveloper();

        // If no developer in localStorage, nothing to validate
        if (!developer || !developer.id) {
          console.log('[Session Check] ✅ No developer in localStorage');
          console.log('[Session Check] User is not logged in\n');
          setIsChecking(false);
          return;
        }

        console.log('[Session Check] Found developer in localStorage:', developer.id);

        // STEP 1: Try to read JWT token from cookie (may not be accessible if HttpOnly)
        console.log('\n[Session Check] STEP 1️⃣: Checking for accessible JWT token...');
        const jwtToken = getJWTToken();

        // If we CAN read the token, validate it client-side first
        if (jwtToken) {
          console.log('[Session Check] Token is readable - checking expiration client-side...');
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
                  const expiredAt = new Date(expirationTime);
                  const now = new Date(currentTime);
                  console.warn('[Session Check] ❌ Token EXPIRED (CLIENT-SIDE CHECK)');
                  console.warn('[Session Check] Expired at:', expiredAt.toISOString());
                  console.warn('[Session Check] Current time:', now.toISOString());
                  clearAuth();
                  console.log('[Session Check] 🔄 Redirecting to login...\n');
                  navigate('/signup?error=session_expired', { replace: true });
                  return;
                }

                const expiresIn = Math.round((expirationTime - currentTime) / 1000);
                console.log('[Session Check] ✅ Token valid (CLIENT-SIDE)');
                console.log('[Session Check] Expires in:', expiresIn, 'seconds');
              }
            }
          } catch (err) {
            console.error('[Session Check] Error decoding token:', err);
          }
        } else {
          console.log('[Session Check] Token NOT readable from document.cookie');
          console.log('[Session Check] Likely reason: Cookie is HttpOnly (secure)');
          console.log('[Session Check] Browser will send it automatically in requests');
        }

        // STEP 2: Always verify with backend (even if token is HttpOnly)
        console.log('\n[Session Check] STEP 2️⃣: Verifying token with backend...');
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const url = `${API_BASE_URL}/api/v1/me`;
        
        console.log('[Session Check] Calling: /api/v1/me (authenticated endpoint)');
        console.log('[Session Check] Credentials: include (browser will send cookie)');

        // Use apiRequest so it can include the access token header (if stored)
        try {
          await apiRequest('/api/v1/me', { method: 'GET' });
          console.log('[Session Check] ✅ Backend confirmed: Session valid');
          setIsChecking(false);
          return;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.warn('[Session Check] ❌ Session validation failed', message);

          if (message.includes('401') || message.includes('403') || message.toLowerCase().includes('unauthorized')) {
            clearAuth();
            console.log('[Session Check] 🔄 Redirecting to login...\n');
            navigate('/signup?error=session_expired', { replace: true });
            return;
          }

          if (message.includes('404')) {
            console.warn('[Session Check] ⚠️ Backend returned 404 - clearing session');
            clearAuth();
            setIsChecking(false);
            return;
          }

          console.warn('[Session Check] ⚠️ Session check completed with non-fatal error');
          setIsChecking(false);
          return;
        }

      } catch (err) {
        console.error('[Session Check] 💥 Error during validation:', err);
        console.error('[Session Check] Error type:', err instanceof Error ? err.name : typeof err);
        console.error('[Session Check] Will NOT invalidate session (user might be offline)\n');
        setIsChecking(false);
      }
    };

    validateSession();
  }, [navigate]);

  return { isChecking };
}
