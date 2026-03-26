import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { seoArticleBySlug } from "./seoArticles";

type Props = {
  slug: string;
};

export default function SeoArticlePage({ slug }: Props) {
  const article = seoArticleBySlug[slug];

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container max-w-4xl px-4 pb-12 pt-28 md:pt-32">
          <h1 className="text-display-sm">Content not found</h1>
          <p className="mt-3 text-body text-muted-foreground">This resource is unavailable.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-4xl px-4 pb-12 pt-28 md:pt-32">
        <article className="space-y-8">
          <header className="space-y-3">
            <h1 className="text-display-sm">{article.title}</h1>
            <p className="text-body text-muted-foreground">{article.snippet}</p>
          </header>

          <section className="space-y-8">
            {article.sections.map((section) => (
              <div key={section.heading} className="space-y-3">
                <h2 className="text-heading-md">{section.heading}</h2>

                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="text-body text-muted-foreground">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="list-disc space-y-2 pl-5 text-body text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}

                {section.steps && section.steps.length > 0 && (
                  <div className="space-y-4">
                    {section.steps.map((step) => (
                      <div key={step.heading} className="rounded-xl border border-border/70 bg-card p-4">
                        <h3 className="text-heading-sm">{step.heading}</h3>
                        <p className="mt-1 text-body-sm text-muted-foreground">{step.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-heading-md">Summary</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-body text-muted-foreground">
              {article.summary.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-heading-md">FAQ</h2>
            {article.faqs.map((faq) => (
              <div key={faq.question} className="rounded-xl border border-border/70 bg-card p-4">
                <h3 className="text-heading-sm">{faq.question}</h3>
                <p className="mt-1 text-body-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
