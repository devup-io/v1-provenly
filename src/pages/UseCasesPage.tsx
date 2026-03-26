import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import SeoHead from "./seo/SeoHead";

export default function UseCasesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Provenly Use Cases | Developers, Students, and Freelancers"
        description="See practical use cases for Provenly, including developer hiring visibility, student portfolios, and freelancer project proof."
        keywords="provenly use cases, developer portfolio use cases, student tech portfolio, freelancer coding profile"
      />
      <Header />
      <main className="container max-w-4xl px-4 pb-12 pt-28 md:pt-32">
        <article className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-display-sm">Provenly Use Cases</h1>
            <p className="text-body text-muted-foreground">
              Provenly is used by technical professionals who need clearer project-first visibility and one consistent profile link to share.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-heading-md">Developers applying for jobs</h2>
            <p className="text-body text-muted-foreground">
              Curate 2–5 high-signal projects, feature top work, and align project types with your target role so recruiters can assess fit quickly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading-md">Students and early-career talent</h2>
            <p className="text-body text-muted-foreground">
              Use projects to demonstrate practical ability when professional experience is limited. Focus on implementation depth and contribution clarity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading-md">Freelancers and contractors</h2>
            <p className="text-body text-muted-foreground">
              Share one profile URL with prospective clients to show relevant project examples and reduce trust friction in early conversations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading-md">What is Provenly?</h2>
            <p className="text-body text-muted-foreground">
              Provenly is a platform for showcasing technical projects through structured, role-aware developer profiles that are easy to review and share.
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-heading-md">Related resources</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-body-sm">
              <Link className="rounded-full bg-secondary px-3 py-1" to="/what-is-provenly">What is Provenly</Link>
              <Link className="rounded-full bg-secondary px-3 py-1" to="/features">Features</Link>
              <Link className="rounded-full bg-secondary px-3 py-1" to="/resources/get-noticed-by-tech-recruiters">Recruiter Guide</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
