import { Button } from "@/components/ui/button";
import { ArrowRight, CloudOff, RefreshCw } from "lucide-react";
import React from "react";

interface ErrorScreenProps {
  statusCode?: string;
  title?: string;
  subtitle?: string;
  message?: string;
  onRetry?: () => void;
  illustration?: React.ReactNode;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function ErrorScreen({
  statusCode = '503',
  title = "Service temporarily unavailable",
  subtitle = "We are reconnecting things behind the scenes.",
  message,
  onRetry,
  illustration,
  primaryActionLabel = 'Try again',
  secondaryActionLabel,
  onSecondaryAction,
}: ErrorScreenProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-hero px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.16),_transparent_40%),radial-gradient(circle_at_bottom_right,_hsl(var(--accent)/0.14),_transparent_32%)]" />
      <div className="absolute left-10 top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-border/60 bg-background/70 text-primary shadow-lg backdrop-blur">
          {illustration || <CloudOff className="h-11 w-11" />}
        </div>

        <p className="mb-3 text-caption font-semibold uppercase tracking-[0.3em] text-primary/80">
          {statusCode}
        </p>
        <h1 className="max-w-3xl text-display-sm font-bold sm:text-display">{title}</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-muted-foreground">{subtitle}</p>
        {message && (
          <p className="mt-5 max-w-2xl text-body text-muted-foreground">{message}</p>
        )}

        {(onRetry || onSecondaryAction) && (
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {onRetry && (
              <Button onClick={onRetry} size="lg" className="gap-2 px-6">
                <RefreshCw className="h-4 w-4" />
                {primaryActionLabel}
              </Button>
            )}
            {onSecondaryAction && secondaryActionLabel && (
              <Button onClick={onSecondaryAction} size="lg" variant="outline" className="gap-2 px-6">
                {secondaryActionLabel}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
