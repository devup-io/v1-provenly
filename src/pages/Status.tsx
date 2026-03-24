import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const updates = [
  {
    title: 'Clear first action on dashboard',
    detail: 'Added a prominent Add Project call-to-action and onboarding guidance for new/existing users.',
    date: 'Mar 24, 2026',
    status: 'Live',
  },
  {
    title: 'Empty state guidance',
    detail: 'Replaced blank project area with clear copy and Add Project button.',
    date: 'Mar 24, 2026',
    status: 'Live',
  },
  {
    title: 'Tooltips for key terms',
    detail: 'Added inline help for Project Complexity, Contribution Level, and Confidence Score.',
    date: 'Mar 24, 2026',
    status: 'Live',
  },
  {
    title: 'Human-friendly labels',
    detail: 'Renamed key sections to Your Profile Insights and Project Breakdown.',
    date: 'Mar 24, 2026',
    status: 'Live',
  },
  {
    title: 'How It Works page',
    detail: 'Added a concise guide page explaining Provenly, project levels, and evaluation flow.',
    date: 'Mar 24, 2026',
    status: 'Live',
  },
  {
    title: 'Action feedback and clarity',
    detail: 'Added submitted/completed feedback and clearer repo analysis error messaging.',
    date: 'Mar 24, 2026',
    status: 'Live',
  },
];

export default function Status() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28 sm:px-6 md:px-8 md:pt-32">
        <div className="mb-8 space-y-2">
          <h1 className="text-display-sm font-bold">Status & Updates</h1>
          <p className="text-body text-muted-foreground">
            Recent product updates shipped in the app.
          </p>
        </div>

        <div className="space-y-4">
          {updates.map((item) => (
            <Card key={item.title} className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-heading-sm">{item.title}</CardTitle>
                  <p className="mt-1 text-caption text-muted-foreground">{item.date}</p>
                </div>
                <Badge variant="secondary">{item.status}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-body-sm text-muted-foreground">{item.detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
