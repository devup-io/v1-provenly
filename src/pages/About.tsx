import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, GitBranch, Cpu, SearchCheck, Users, Target } from 'lucide-react';

const principles = [
  {
    title: 'Real work over keywords',
    description: 'Profiles reflect repositories, contributions, and engineering outcomes instead of resume-only claims.',
    icon: GitBranch,
  },
  {
    title: 'Transparent evaluation',
    description: 'Scoring is tied to visible quality and activity signals so developers understand how results are produced.',
    icon: SearchCheck,
  },
  {
    title: 'Trust and quality',
    description: 'Hiring teams get clearer confidence signals and project context before they make decisions.',
    icon: ShieldCheck,
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-5xl px-4 pb-12 pt-28 md:pt-32">
        <div className="mb-8 space-y-3">
          <h1 className="text-display-sm">About Provenly</h1>
          <p className="max-w-3xl text-body text-muted-foreground">
            Provenly helps developers present verified skills through real project history, engineering depth, and contribution signals.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">GitHub-based signals</Badge>
            <Badge variant="secondary">Role-aware evaluation</Badge>
            <Badge variant="secondary">Hiring clarity</Badge>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-heading-sm">
                <Target className="h-4 w-4 text-primary" />
                What we do
              </CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              We convert project activity, architecture quality, and contribution patterns into a developer profile with meaningful signal.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-heading-sm">
                <Users className="h-4 w-4 text-primary" />
                Who it serves
              </CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              Developers use it to showcase real capability, and hiring teams use it to evaluate talent with better context.
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-heading-sm">
                <Cpu className="h-4 w-4 text-primary" />
                Why it matters
              </CardTitle>
            </CardHeader>
            <CardContent className="text-body-sm text-muted-foreground">
              Better signal quality reduces noise in screening and makes technical hiring faster and more trustworthy.
            </CardContent>
          </Card>
        </div>

        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-heading-sm">How we think</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {principles.map((item) => (
              <div key={item.title} className="rounded-xl border border-border/70 bg-background/50 p-4">
                <p className="mb-2 flex items-center gap-2 text-body-sm font-semibold text-foreground">
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.title}
                </p>
                <p className="text-caption text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
