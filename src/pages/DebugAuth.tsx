import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';

export default function DebugAuth() {
  const [cookies, setCookies] = useState<{ [key: string]: string }>({});
  const [localStorageData, setLocalStorageData] = useState<{ [key: string]: string }>({});
  const [apiUrl, setApiUrl] = useState<string>('');
  const [testResults, setTestResults] = useState<{
    authorize?: { ok: boolean; msg: string };
    cors?: { ok: boolean; msg: string };
    status?: { ok: boolean; msg: string };
  }>({});

  useEffect(() => {
    // Extract cookies
    const cookieObj: { [key: string]: string } = {};
    document.cookie.split(';').forEach((cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key) cookieObj[key] = value || '';
    });
    setCookies(cookieObj);

    // Extract localStorage
    const lsObj: { [key: string]: string } = {};
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key) lsObj[key] = window.localStorage.getItem(key) || '';
    }
    setLocalStorageData(lsObj);

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    setApiUrl(baseUrl);
  }, []);

  const testEndpoints = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const results = { ...testResults };

    // Test authorize endpoint
    try {
      const res = await fetch(`${baseUrl}/api/v1/auth/github/authorize`, {
        method: 'GET',
        credentials: 'include',
        mode: 'cors',
      });
      results.authorize = {
        ok: res.ok,
        msg: `${res.status} - ${res.statusText}`,
      };
    } catch (e) {
      results.authorize = { ok: false, msg: (e as Error).message };
    }

    // Test CORS with a simple POST
    try {
      const res = await fetch(`${baseUrl}/api/v1/projects/import-all?evaluate_ai=true`, {
        method: 'POST',
        credentials: 'include',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
      });
      results.cors = {
        ok: res.ok || res.status === 401, // 401 is OK for CORS test
        msg: `${res.status} - Headers present: Access-Control-Allow-Credentials=${res.headers.get(
          'access-control-allow-credentials'
        )}`,
      };
    } catch (e) {
      results.cors = { ok: false, msg: (e as Error).message };
    }

    setTestResults(results);
  };

  const devProfile = localStorageData['v1_developer']
    ? JSON.parse(localStorageData['v1_developer'] as string)
    : null;

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold">OAuth Flow Debug</h1>
          <p className="text-muted-foreground">Check authentication state and test API connectivity</p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>This page is for debugging only. Check the browser console for detailed logs.</AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Current API URL and environment settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium">API Base URL</p>
              <p className="font-mono text-sm">{apiUrl}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Frontend URL</p>
              <p className="font-mono text-sm">{window.location.origin}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Cross-Origin?</p>
              <p className="font-mono text-sm">{window.location.origin !== apiUrl ? '✅ Yes' : '❌ No (same origin)'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
            <CardDescription>
              Cookies stored for {new URL(apiUrl).hostname || 'unknown'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(cookies).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(cookies).map(([key, value]) => (
                  <div key={key} className="border-b pb-2 last:border-0">
                    <p className="text-sm font-mono font-semibold">{key}</p>
                    <p className="text-xs text-muted-foreground break-all">
                      {value.substring(0, 50)}
                      {value.length > 50 ? '...' : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No cookies found. After OAuth, check for v1_access_token.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session State</CardTitle>
            <CardDescription>Developer profile and authentication state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {devProfile ? (
              <>
                <div className="flex items-center gap-2 rounded bg-green-50 p-3 dark:bg-green-950">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="font-semibold">Developer Logged In</p>
                    <p className="text-sm">{devProfile.name}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-mono break-all">ID: {devProfile.id}</p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 rounded bg-red-50 p-3 dark:bg-red-950">
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="font-semibold">No Developer Session</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Connectivity Test</CardTitle>
            <CardDescription>Test CORS and authentication endpoints</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testEndpoints}>Run Tests</Button>

            {testResults.authorize && (
              <div
                className={`rounded border p-3 ${
                  testResults.authorize.ok
                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                    : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                }`}
              >
                <p className="font-semibold">GET /api/v1/auth/github/authorize</p>
                <p className="text-sm">{testResults.authorize.msg}</p>
              </div>
            )}

            {testResults.cors && (
              <div
                className={`rounded border p-3 ${
                  testResults.cors.ok
                    ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                    : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                }`}
              >
                <p className="font-semibold">POST /api/v1/projects/import-all (CORS test)</p>
                <p className="text-sm">{testResults.cors.msg}</p>
                {!testResults.cors.ok && (
                  <p className="mt-2 text-xs text-red-700 dark:text-red-300">
                    If CORS headers are missing, the backend needs to set:
                    <br />
                    Access-Control-Allow-Credentials: true
                    <br />
                    Access-Control-Allow-Origin: {window.location.origin}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Browser Console</CardTitle>
            <CardDescription>For detailed request/response logging</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Open DevTools (F12) → Console to see detailed logs prefixed with [API]. Also check Network tab for
              request/response headers during OAuth flow.
            </p>
            <div className="mt-4 grid gap-2 text-xs">
              <p>
                <span className="font-mono bg-muted px-2 py-1 rounded">Cookies sent:</span> Check Network tab, Request Headers for "Cookie: v1_access_token=..."
              </p>
              <p>
                <span className="font-mono bg-muted px-2 py-1 rounded">Cookie set:</span> OAuth callback should show Set-Cookie header in Response Headers (may be hidden)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-semibold">❌ No v1_access_token cookie after OAuth</p>
              <p className="text-muted-foreground">
                Backend OAuth callback is not setting the Set-Cookie header. Check backend logs for the callback endpoint.
              </p>
            </div>
            <div>
              <p className="font-semibold">❌ 401 Unauthorized on import-all</p>
              <p className="text-muted-foreground">
                Either cookie is not being sent (missing Access-Control-Allow-Credentials header) or backend is not validating the cookie.
              </p>
            </div>
            <div>
              <p className="font-semibold">❌ CORS error</p>
              <p className="text-muted-foreground">
                Backend not sending correct Access-Control-Allow-Origin header. Must match frontend origin exactly.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
