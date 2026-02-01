import { motion } from "framer-motion";
import { Github, FolderGit2, FileText, Globe, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Github,
    title: "Sign up with GitHub",
    description: "One-click OAuth. We fetch your profile and public repositories automatically.",
    color: "lavender" as const,
  },
  {
    number: "02",
    icon: FolderGit2,
    title: "Select your best projects",
    description: "Choose 2-5 projects you're proud of. We show repo stats, languages, and commits.",
    color: "mint" as const,
  },
  {
    number: "03",
    icon: FileText,
    title: "Add project breakdowns",
    description: "Explain the problem, your contribution, and rate the technical complexity.",
    color: "yellow" as const,
  },
  {
    number: "04",
    icon: Globe,
    title: "Publish your profile",
    description: "Get a public URL at provenly.live/dev/username. Founders discover you instantly.",
    color: "peach" as const,
  },
];

const colorClasses = {
  lavender: {
    bg: "bg-pastel-lavender",
    text: "text-pastel-lavender-foreground",
    ring: "ring-pastel-lavender/50",
  },
  mint: {
    bg: "bg-pastel-mint",
    text: "text-pastel-mint-foreground",
    ring: "ring-pastel-mint/50",
  },
  yellow: {
    bg: "bg-pastel-yellow",
    text: "text-pastel-yellow-foreground",
    ring: "ring-pastel-yellow/50",
  },
  peach: {
    bg: "bg-pastel-peach",
    text: "text-pastel-peach-foreground",
    ring: "ring-pastel-peach/50",
  },
};

export function HowItWorksNew() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-background py-20 md:py-30">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-pastel-lavender/20 blur-3xl" />
        <div className="absolute right-1/4 bottom-20 h-72 w-72 rounded-full bg-pastel-mint/20 blur-3xl" />
      </div>

      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <span className="mb-4 inline-block rounded-full bg-pastel-lavender px-4 py-1.5 text-body-sm font-medium text-pastel-lavender-foreground">
            How it works
          </span>
          <h2 className="mb-4 text-display-sm md:text-display">
            Create your profile in minutes
          </h2>
          <p className="text-body-lg text-muted-foreground">
            No resume needed. Just your GitHub and real project experience.
          </p>
        </motion.div>

        {/* Interactive Steps - Vertical Timeline Design */}
        <div className="mx-auto max-w-3xl">
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-pastel-lavender via-pastel-mint via-50% to-pastel-peach md:left-1/2 md:block md:-translate-x-1/2" />

            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className={`relative mb-8 last:mb-0 md:mb-12 ${
                  index % 2 === 0 ? "md:pr-[50%] md:text-right" : "md:pl-[50%]"
                }`}
              >
                {/* Step Content Card */}
                <div
                  className={`group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover ${
                    index % 2 === 0 ? "md:mr-12" : "md:ml-12"
                  }`}
                >
                  {/* Floating Number Badge - Desktop Only */}
                  <div
                    className={`absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full ring-4 ring-background md:flex ${
                      colorClasses[step.color].bg
                    } ${colorClasses[step.color].text} ${
                      index % 2 === 0 ? "-right-18 translate-x-1/2" : "-left-18 -translate-x-1/2"
                    }`}
                  >
                    <span className="text-lg font-bold">{step.number}</span>
                  </div>

                  {/* Mobile: Inline Icon & Number */}
                  <div className="mb-4 flex items-center gap-4 md:hidden">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colorClasses[step.color].bg} ${colorClasses[step.color].text}`}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <span className="text-caption font-bold text-muted-foreground">
                        Step {step.number}
                      </span>
                      <h3 className="text-heading-sm">{step.title}</h3>
                    </div>
                  </div>

                  {/* Desktop: Icon Header */}
                  <div className={`hidden items-center gap-3 md:flex ${index % 2 === 0 ? "flex-row-reverse" : ""}`}>
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${colorClasses[step.color].bg} ${colorClasses[step.color].text}`}
                    >
                      <step.icon className="h-7 w-7" />
                    </div>
                    <div className={index % 2 === 0 ? "text-right" : ""}>
                      <h3 className="text-heading-sm">{step.title}</h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className={`mt-3 text-body-sm text-muted-foreground md:mt-4 ${index % 2 === 0 ? "md:text-right" : ""}`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* For Founders Section - Keeping original design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mx-auto mt-20 max-w-4xl"
        >
          <div className="rounded-3xl border border-border bg-gradient-cta p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:items-center">
              <div>
                <span className="mb-4 inline-block rounded-full bg-pastel-peach px-4 py-1.5 text-body-sm font-medium text-pastel-peach-foreground">
                  For founders
                </span>
                <h3 className="mb-4 text-heading md:text-display-sm">
                  No login required to browse
                </h3>
                <p className="text-body text-muted-foreground">
                  Browse developers, filter by role, tech stack, and complexity level. 
                  View real GitHub projects and detailed breakdowns. 
                  Reach out when you find the right match.
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-card/80 p-4 backdrop-blur">
                  <CheckCircle2 className="h-5 w-5 text-pastel-mint-foreground" />
                  <span className="text-body-sm">Filter by role & technology</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-card/80 p-4 backdrop-blur">
                  <CheckCircle2 className="h-5 w-5 text-pastel-mint-foreground" />
                  <span className="text-body-sm">View complexity levels (L1–L3)</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-card/80 p-4 backdrop-blur">
                  <CheckCircle2 className="h-5 w-5 text-pastel-mint-foreground" />
                  <span className="text-body-sm">See real project breakdowns</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-card/80 p-4 backdrop-blur">
                  <CheckCircle2 className="h-5 w-5 text-pastel-mint-foreground" />
                  <span className="text-body-sm">Contact developers directly</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
