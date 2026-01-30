import { motion } from "framer-motion";
import { Github, Folder, FileText, Globe, Check, Star, GitBranch } from "lucide-react";

const developerSteps = [
  {
    number: "01",
    icon: Github,
    title: "Sign up with GitHub",
    description:
      "One-click OAuth. We fetch your profile and public repositories automatically. No passwords, no email verification.",
  },
  {
    number: "02",
    icon: Folder,
    title: "Select your best projects",
    description:
      "Choose 2-5 projects you're proud of. We show repo stats, languages, and commit history automatically.",
  },
  {
    number: "03",
    icon: FileText,
    title: "Add project breakdowns",
    description:
      "For each project: explain the problem, your contribution, and rate the technical complexity (L1-L3).",
  },
  {
    number: "04",
    icon: Globe,
    title: "Publish your profile",
    description:
      "Get a public URL at provenly.live/dev/username. Founders can discover you instantly.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-gradient-cta py-20 md:py-30"
    >
      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left: Steps */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <h2 className="mb-4 text-display-sm md:text-display">
                For developers
              </h2>
              <p className="text-body-lg text-muted-foreground">
                Create your verified profile in minutes. No resume needed, 
                just your GitHub and real project experience.
              </p>
            </motion.div>

            <div className="space-y-8">
              {developerSteps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="flex gap-6"
                >
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <step.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-caption font-bold uppercase tracking-wider text-muted-foreground">
                        Step {step.number}
                      </span>
                    </div>
                    <h3 className="mb-2 text-heading-sm">{step.title}</h3>
                    <p className="text-body text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Profile Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="rounded-3xl border border-border bg-card p-6 shadow-xl">
              {/* Mock browser header */}
              <div className="mb-6 flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-pastel-peach" />
                <div className="h-3 w-3 rounded-full bg-pastel-yellow" />
                <div className="h-3 w-3 rounded-full bg-pastel-mint" />
                <div className="ml-4 flex-1 rounded-full bg-muted/50 px-4 py-1.5">
                  <span className="text-caption text-muted-foreground">provenly.live/dev/alexrivera</span>
                </div>
              </div>

              {/* Mock developer profile */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-pastel-lavender">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                      alt="Developer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-heading-sm">Alex Rivera</span>
                      <Github className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-body-sm text-muted-foreground">Full-Stack Engineer</p>
                  </div>
                  <div className="rounded-lg bg-pastel-peach px-3 py-1.5">
                    <span className="text-body-sm font-bold text-pastel-peach-foreground">
                      L3
                    </span>
                  </div>
                </div>

                {/* Tech stack */}
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"].map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-secondary px-3 py-1.5 text-body-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Project card */}
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="font-semibold">real-time-collaboration-engine</p>
                      <p className="text-caption text-muted-foreground">Complex distributed system</p>
                    </div>
                    <div className="flex items-center gap-3 text-caption text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3" /> 234
                      </span>
                      <span className="flex items-center gap-1">
                        <GitBranch className="h-3 w-3" /> 89
                      </span>
                    </div>
                  </div>
                  <p className="mb-3 text-body-sm text-muted-foreground">
                    Built a real-time collaboration engine supporting 10k concurrent users with conflict resolution...
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-pastel-peach px-2 py-0.5 text-caption font-medium text-pastel-peach-foreground">
                      L3 - Complex
                    </span>
                    <span className="text-caption text-muted-foreground">TypeScript • WebSocket • Redis</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-full bg-card px-4 py-3 shadow-lg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pastel-mint">
                <Check className="h-4 w-4 text-pastel-mint-foreground" />
              </div>
              <span className="text-body-sm font-medium">GitHub Verified</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
