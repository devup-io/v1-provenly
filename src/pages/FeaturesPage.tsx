import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import SeoHead from "./seo/SeoHead";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Provenly Features | Project Showcasing and Developer Profile Tools"
        description="Explore Provenly features for selecting, featuring, and organizing projects with role-aware visibility for technical hiring."
        keywords="provenly features, developer portfolio features, featured projects, role alignment"
      />
      <Header />
      <main className="container max-w-4xl px-4 pb-12 pt-28 md:pt-32">
        <article className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-display-sm">Provenly Features</h1>
            <p className="text-body text-muted-foreground">
              Provenly focuses on practical profile clarity: fewer distractions, stronger project presentation, and better role-fit signaling.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-heading-md">Core capabilities</h2>
            <ul className="list-disc space-y-2 pl-5 text-body text-muted-foreground">
              <li>Project recommendations based on activity, complexity, and commit signals</li>
              <li>Featured project prioritization to control first impressions</li>
              <li>Lightweight project tags (Backend, Frontend, API, Mobile)</li>
              <li>Role-alignment warning when project type conflicts with declared role</li>
              <li>Shareable profile link for hiring and outreach</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading-md">What is Provenly?</h2>
            <p className="text-body text-muted-foreground">
              Provenly is a structured developer profile platform that helps users present project-based proof of skills for faster, clearer technical evaluation.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-heading-md">Continue exploring</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-body-sm">
              <Link className="rounded-full bg-secondary px-3 py-1" to="/what-is-provenly">What is Provenly</Link>
              <Link className="rounded-full bg-secondary px-3 py-1" to="/use-cases">Use Cases</Link>
              <Link className="rounded-full bg-secondary px-3 py-1" to="/resources/provenly-vs-github-portfolio">Provenly vs GitHub</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
