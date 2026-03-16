import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl px-4 pb-12 pt-28 md:pt-32">
        <h1 className="mb-4 text-display-sm">About Provenly</h1>
        <p className="mb-6 text-body text-muted-foreground">
          Provenly helps developers show verified skills through real project history and engineering signals.
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 text-heading-sm">What we do</h2>
            <p className="text-body-sm text-muted-foreground">
              We turn repository activity, quality metrics, and project complexity into a clearer professional profile.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <h2 className="mb-2 text-heading-sm">Why it matters</h2>
            <p className="text-body-sm text-muted-foreground">
              Teams can evaluate developers with stronger signal quality than resume-only screening.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 md:col-span-2">
            <h2 className="mb-2 text-heading-sm">Our mission</h2>
            <p className="text-body-sm text-muted-foreground">
              Build a transparent hiring ecosystem where verified contributions and engineering depth are visible and trusted.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
