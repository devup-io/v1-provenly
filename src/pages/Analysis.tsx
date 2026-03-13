import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { getDeveloperSummary } from '@/lib/api';

export default function Analysis() {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<unknown>(null);
  const { toast } = useToast();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const devId = params.get('dev');

  useEffect(() => {
    if (devId) {
      getDeveloperSummary(devId).then((data) => {
        console.log('[Analysis] developer summary', data);
        setSummary(data);
      }).catch((err) => {
        console.error('[Analysis] failed to load summary', err);
      });
    }
  }, [devId]);

  const run = async () => {
    setRunning(true);
    try {
      // placeholder for actual analysis trigger
      await new Promise((r) => setTimeout(r, 1500));
    } finally {
      setRunning(false);
      toast({ title: 'Analysis finished', description: 'Review the graphs below or on your dashboard.', });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container max-w-2xl text-center">
        <h1 className="text-display-sm mb-6">Project Analysis</h1>
        <p className="text-body mb-4">Run thorough AI evaluations across your imported repos.</p>
        <Button onClick={run} disabled={running} className="gap-2">
          {running && <Loader2 className="h-4 w-4 animate-spin" />}
          {running ? 'Analyzing...' : 'Start Analysis'}
        </Button>
        <div className="mt-8">
          <Button variant="outline" onClick={() => window.history.back()}>Back to Dashboard</Button>
        </div>
      </div>

      {/* Results area */}
      {!running && (
        <div className="container max-w-4xl mt-12">
          <h2 className="text-heading-md mb-4">Recent Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-body-sm text-muted-foreground mb-2">Evaluation score over time</p>
              <div className="h-32 bg-muted/20 flex items-center justify-center">
                {/* placeholder chart */}
                <span className="text-caption text-muted-foreground">[chart]</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-body-sm text-muted-foreground mb-2">Projects analysed (last 30 days)</p>
              <div className="h-32 bg-muted/20 flex items-center justify-center">
                <span className="text-caption text-muted-foreground">[chart]</span>
              </div>
            </div>
          </div>

          {summary && (
            <div className="mt-8 p-4 rounded-lg border border-border bg-card">
              <h3 className="text-heading-sm mb-2">Developer Summary Data</h3>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(summary, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
