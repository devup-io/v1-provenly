import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero font-grotesk">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 md:px-8 md:pt-32">
        <div className="mb-8 space-y-3">
          <h1 className="text-display-sm font-bold">How Provenly Works</h1>
          <p className="max-w-2xl text-body text-muted-foreground">
            A simple guide to building your developer profile and understanding your evaluation.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>What is Provenly?</CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              Provenly helps developers turn real GitHub work into a clear, trusted profile for hiring teams.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>How to add projects</CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              Open your dashboard, click <strong>Add Project</strong>, choose repositories, and submit. Provenly imports and analyzes your selected repos.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>What L1 / L2 / L3 means</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-body-sm text-muted-foreground">
              <p><strong>L1:</strong> Foundational projects with basic structure.</p>
              <p><strong>L2:</strong> Intermediate projects with real backend logic and multiple components.</p>
              <p><strong>L3:</strong> Advanced projects with complex architecture and stronger engineering depth.</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>How evaluation works</CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              The system evaluates repository quality, confidence in the analysis, and your estimated contribution level to summarize your profile insights.
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button className="gap-2" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
