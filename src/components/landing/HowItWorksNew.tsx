import { motion } from "framer-motion";
import { Github, FolderGit2, FileText, Globe, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Github,
    title: "Sign up with GitHub",
    description: "One-click OAuth. We fetch your profile and public repositories automatically.",
    color: "bg-pastel-lavender",
    iconColor: "text-pastel-lavender-foreground",
  },
  {
    number: "02",
    icon: FolderGit2,
    title: "Select your best projects",
    description: "Choose 2-5 projects you're proud of. We show repo stats, languages, and commits.",
    color: "bg-pastel-mint",
    iconColor: "text-pastel-mint-foreground",
  },
  {
    number: "03",
    icon: FileText,
    title: "Add project breakdowns",
    description: "Explain the problem, your contribution, and rate the technical complexity.",
    color: "bg-pastel-yellow",
    iconColor: "text-pastel-yellow-foreground",
  },
  {
    number: "04",
    icon: Globe,
    title: "Publish your profile",
    description: "Get a public URL at provenly.live/dev/username. Founders discover you instantly.",
    color: "bg-pastel-peach",
    iconColor: "text-pastel-peach-foreground",
  },
];

export function HowItWorksNew() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-background py-20 md:py-30">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-pastel-lavender/30 blur-3xl" />
        <div className="absolute right-1/4 bottom-20 h-72 w-72 rounded-full bg-pastel-mint/30 blur-3xl" />
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

        {/* Steps - Horizontal Timeline on Desktop */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="absolute left-0 right-0 top-[60px] hidden h-0.5 bg-gradient-to-r from-pastel-lavender via-pastel-mint via-50% to-pastel-peach lg:block" />

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-card transition-all hover:shadow-card-hover">
                  {/* Icon Circle */}
                  <div className="relative z-10 mb-6">
                    <div
                      className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl ${step.color}`}
                    >
                      <step.icon className={`h-10 w-10 ${step.iconColor}`} />
                    </div>
                    {/* Step Number Badge */}
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-caption font-bold text-primary-foreground">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="mb-2 text-center text-heading-sm">{step.title}</h3>
                  <p className="text-center text-body-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Arrow (between cards on desktop) */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-[72px] z-20 hidden lg:block">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* For Founders Section */}
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
                  <div className="h-3 w-3 rounded-full bg-pastel-mint" />
                  <span className="text-body-sm">Filter by role & technology</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-card/80 p-4 backdrop-blur">
                  <div className="h-3 w-3 rounded-full bg-pastel-mint" />
                  <span className="text-body-sm">View complexity levels (L1–L3)</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-card/80 p-4 backdrop-blur">
                  <div className="h-3 w-3 rounded-full bg-pastel-mint" />
                  <span className="text-body-sm">See real project breakdowns</span>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-card/80 p-4 backdrop-blur">
                  <div className="h-3 w-3 rounded-full bg-pastel-mint" />
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
