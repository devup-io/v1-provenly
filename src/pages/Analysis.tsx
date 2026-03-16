import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
import { getDeveloperAnalyzer, getDeveloperAnalyzerCharts, getDeveloperSummary, subscribeToAnalyzerStream } from '@/lib/api';

export default function Analysis() {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<unknown>(null);
  const [charts, setCharts] = useState<unknown>(null);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const eventSourceRef = useRef<EventSource | null>(null);

  const params = new URLSearchParams(location.search);
  const devId = params.get('dev');

  useEffect(() => {
    if (devId) {
      getDeveloperSummary(devId)
        .then((data) => {
          console.log('[Analysis] developer summary', data);
          setSummary(data);
        })
        .catch((err) => {
          console.error('[Analysis] failed to load summary', err);
        });

      getDeveloperAnalyzerCharts(devId)
        .then((data) => {
          console.log('[Analysis] analyzer charts data', data);
          setCharts(data);
        })
        .catch((err) => {
          console.error('[Analysis] failed to load charts', err);
        });
    }
  }, [devId]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const appendLog = (line: string) => {
    setLogLines((prev) => [...prev, line].slice(-50));
  };

  const startStream = (id: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    eventSourceRef.current = subscribeToAnalyzerStream(id, {
      onLog: (data) => {
        const text = `${data.step} - ${data.status}${data.detail ? `: ${data.detail}` : ''}`;
        appendLog(text);
        setAnalysisStatus(data.status);
      },
      onComplete: async () => {
        appendLog('Analysis complete — refreshing charts...');
        setAnalysisStatus('complete');
        if (devId) {
          const freshCharts = await getDeveloperAnalyzerCharts(devId);
          setCharts(freshCharts);
        }
        setRunning(false);
        toast({ title: 'Analysis complete', description: 'Charts and summary are refreshed.', });
      },
      onError: (err) => {
        console.error('[Analysis] SSE error', err);
        appendLog('Analysis stream error — please try again.');
        setRunning(false);
        toast({ title: 'Analysis stream error', description: 'Unable to receive live updates.', variant: 'destructive' });
      },
    });
  };

  const run = async () => {
    if (!devId) return;
    setRunning(true);
    setLogLines([]);
    setAnalysisStatus('starting');

    try {
      await getDeveloperAnalyzer(devId);
      appendLog('Analysis triggered. Waiting for updates...');
      startStream(devId);
    } catch (err) {
      console.error('[Analysis] failed to run analysis', err);
      toast({ title: 'Analysis failed', description: 'Unable to run analysis, please try again.', variant: 'destructive' });
      setRunning(false);
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
          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-body-sm text-muted-foreground mb-2">Live analyzer status</p>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-body-sm">Status: <span className="font-medium">{analysisStatus || 'idle'}</span></span>
                {running && <span className="text-body-sm text-muted-foreground">Updating in real-time...</span>}
              </div>
              <div className="mt-4 max-h-40 overflow-y-auto rounded-lg bg-muted/10 p-3 text-xs">
                {logLines.length === 0 ? (
                  <p className="text-muted-foreground">No log output yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {logLines.map((line, idx) => (
                      <li key={idx} className="break-words">{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
              <div className="mt-2 p-4 rounded-lg border border-border bg-card">
                <h3 className="text-heading-sm mb-2">Developer Summary Data</h3>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
