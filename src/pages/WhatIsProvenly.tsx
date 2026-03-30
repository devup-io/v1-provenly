import { Link } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import SeoHead from "./seo/SeoHead";

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Provenly",
  description: "Platform for showcasing tech projects and building verified developer profiles.",
  url: "/",
};

export default function WhatIsProvenly() {
  return (
    <div className="min-h-screen bg-background font-grotesk">
      <SeoHead
        title="What is Provenly? | Verified Developer Profiles and Project Showcasing"
        description="Learn what Provenly is, who it is for, and how it helps developers showcase projects through structured, shareable profiles."
        keywords="what is provenly, developer profile platform, tech portfolio, verified developer profile"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      <Header />
      <main className="container max-w-4xl px-4 pb-12 pt-28 md:pt-32">
        <article className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-display-sm">What is Provenly?</h1>
            <p className="text-body text-muted-foreground">
              Provenly is a platform for developers, designers, students, and freelancers to showcase projects in a structured format and build a more credible professional profile.
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-heading-md">Who is it for?</h2>
            <ul className="list-disc space-y-2 pl-5 text-body text-muted-foreground">
              <li>Developers who want to present project-based proof of skills</li>
              <li>Students and early-career talent building visibility</li>
              <li>Freelancers sharing one profile with clients</li>
              <li>Hiring teams looking for faster technical screening context</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-heading-md">What does Provenly do?</h2>
            <ul className="list-disc space-y-2 pl-5 text-body text-muted-foreground">
              <li>Helps you select and feature your strongest projects</li>
              <li>Shows role alignment and contribution context</li>
              <li>Supports lightweight project organization with tags</li>
              <li>Provides one shareable profile URL for applications and outreach</li>
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-heading-md">Related Pages</h2>
            <div className="mt-3 flex flex-wrap gap-2 text-body-sm">
              <Link className="rounded-full bg-secondary px-3 py-1" to="/features">Features</Link>
              <Link className="rounded-full bg-secondary px-3 py-1" to="/use-cases">Use Cases</Link>
              <Link className="rounded-full bg-secondary px-3 py-1" to="/resources/best-platform-to-showcase-developer-projects">Resource Guide</Link>
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
