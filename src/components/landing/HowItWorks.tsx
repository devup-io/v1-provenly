import { motion } from "framer-motion";
import { UserPlus, Sparkles, Wallet, Check } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create your profile",
    description:
      "Set up your portfolio in minutes. Showcase your skills, experience, and best work samples.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Match with opportunities",
    description:
      "Get discovered by companies looking for your exact skills, or browse open projects.",
  },
  {
    number: "03",
    icon: Wallet,
    title: "Collaborate and get paid",
    description:
      "Work on your terms with milestone-based payments. Keep every dollar you earn.",
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
                How it works
              </h2>
              <p className="text-body-lg text-muted-foreground">
                Getting started is simple. Join thousands of independents
                building successful careers on their own terms.
              </p>
            </motion.div>

            <div className="space-y-8">
              {steps.map((step, index) => (
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

          {/* Right: UI Mockup */}
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
              </div>

              {/* Mock profile preview */}
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-pastel-lavender" />
                  <div className="flex-1">
                    <div className="mb-2 h-5 w-32 rounded bg-secondary" />
                    <div className="h-4 w-24 rounded bg-muted" />
                  </div>
                  <div className="rounded-lg bg-pastel-mint px-3 py-1.5">
                    <span className="text-body-sm font-medium text-pastel-mint-foreground">
                      Available
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  {["$95k+ earned", "47 projects", "5.0 rating"].map((stat) => (
                    <div
                      key={stat}
                      className="rounded-xl bg-muted/50 p-4 text-center"
                    >
                      <span className="text-body-sm font-medium">{stat}</span>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div>
                  <div className="mb-3 h-4 w-16 rounded bg-muted" />
                  <div className="flex flex-wrap gap-2">
                    {["React", "TypeScript", "Node.js", "Figma"].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-secondary px-3 py-1.5 text-body-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div>
                  <div className="mb-3 h-4 w-20 rounded bg-muted" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="aspect-[4/3] rounded-xl bg-pastel-peach/50" />
                    <div className="aspect-[4/3] rounded-xl bg-pastel-blue/50" />
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
              <span className="text-body-sm font-medium">Profile complete!</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
