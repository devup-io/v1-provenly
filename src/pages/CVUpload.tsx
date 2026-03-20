import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileUp, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Header } from '@/components/landing/Header';
import { Button } from '@/components/ui/button';
import { uploadDeveloperCv, getCurrentDeveloper } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const MAX_SIZE_MB = 10;
const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function CVUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ savedToProfile: boolean; savedFields: string[] } | null>(null);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      sizeMb: (file.size / (1024 * 1024)).toFixed(2),
      type: file.type || 'unknown',
    };
  }, [file]);

  const validateFile = (selected: File): string | null => {
    if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
      return `File is too large. Max allowed size is ${MAX_SIZE_MB}MB.`;
    }

    if (selected.type && !ACCEPTED_TYPES.includes(selected.type)) {
      return 'Unsupported file format. Please upload PDF, DOC, DOCX, or TXT.';
    }

    return null;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    setSuccess(null);
    setError(null);

    if (!selected) {
      setFile(null);
      return;
    }

    const validationError = validateFile(selected);
    if (validationError) {
      setFile(null);
      setError(validationError);
      return;
    }

    setFile(selected);
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Please select a CV file first.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await uploadDeveloperCv(file, true);
      await getCurrentDeveloper();

      const savedToProfile = response.saved_to_profile !== false;
      const savedFields = Array.isArray(response.saved_fields) ? response.saved_fields : [];

      setSuccess({ savedToProfile, savedFields });
      toast({
        title: 'CV uploaded',
        description: savedToProfile
          ? 'Your CV was uploaded and profile fields were synced.'
          : 'Your CV was uploaded successfully.',
      });
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Failed to upload CV. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="container max-w-2xl px-4 pb-8 pt-24 sm:px-6 md:pt-28">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="mb-6">
            <h1 className="text-display-sm">Upload CV</h1>
            <p className="mt-2 text-body text-muted-foreground">
              Upload your latest CV. We save it to your profile and sync available fields automatically.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <div className="space-y-3">
              <label htmlFor="cv-file" className="block text-body-sm font-medium">
                CV file
              </label>
              <input
                id="cv-file"
                type="file"
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={handleFileChange}
                className="block w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              <p className="text-caption text-muted-foreground">Accepted: PDF, DOC, DOCX, TXT • Max {MAX_SIZE_MB}MB</p>
            </div>

            {fileInfo && (
              <div className="rounded-xl border border-border/60 bg-background/60 px-4 py-3 text-sm">
                <p className="font-medium text-foreground">{fileInfo.name}</p>
                <p className="text-muted-foreground">{fileInfo.sizeMb} MB • {fileInfo.type}</p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-3 text-sm text-emerald-700 dark:text-emerald-300">
                <div className="mb-1 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  CV uploaded successfully
                </div>
                <p>
                  Saved to profile: {success.savedToProfile ? 'Yes' : 'No'}
                  {success.savedFields.length > 0 ? ` • Updated fields: ${success.savedFields.join(', ')}` : ''}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={submitting || !file} className="w-full gap-2 sm:w-auto">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                {submitting ? 'Uploading...' : 'Upload CV'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} className="w-full sm:w-auto">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
