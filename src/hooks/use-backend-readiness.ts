import { useCallback, useEffect, useState } from 'react';
import { checkBackendReadiness } from '@/lib/api';

type BackendReadinessState = {
  isChecking: boolean;
  isReady: boolean;
  error: string | null;
  retry: () => Promise<void>;
};

export function useBackendReadiness(): BackendReadinessState {
  const [isChecking, setIsChecking] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runReadinessCheck = useCallback(async () => {
    setIsChecking(true);

    const status = await checkBackendReadiness();
    if (status.ready) {
      setIsReady(true);
      setError(null);
      setIsChecking(false);
      return;
    }

    setIsReady(false);
    setError(status.error || 'Backend is not ready.');
    setIsChecking(false);
  }, []);

  useEffect(() => {
    // Only run health check once on app startup
    runReadinessCheck();
  }, [runReadinessCheck]);

  return {
    isChecking,
    isReady,
    error,
    retry: runReadinessCheck,
  };
}
