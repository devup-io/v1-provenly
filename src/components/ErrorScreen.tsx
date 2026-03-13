import { Button } from "@/components/ui/button";
import { CloudOff } from "lucide-react";
import React from "react";

interface ErrorScreenProps {
  title?: string;
  subtitle?: string;
  message?: string;
  onRetry?: () => void;
  illustration?: React.ReactNode;
}

export function ErrorScreen({
  title = "Oops!",
  subtitle = "The server is currently unavailable.",
  message,
  onRetry,
  illustration,
}: ErrorScreenProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero p-4">
      <div className="text-center max-w-md space-y-6">
        <div className="mx-auto h-24 w-24 text-secondary">
          {illustration || <CloudOff className="h-full w-full" />}
        </div>
        <h1 className="text-3xl font-bold text-destructive">{title}</h1>
        <p className="text-lg font-semibold text-destructive">{subtitle}</p>
        {message && (
          <p className="mt-4 text-body text-muted-foreground">{message}</p>
        )}
        {onRetry && (
          <Button onClick={onRetry}>Retry</Button>
        )}
      </div>
    </div>
  );
}
