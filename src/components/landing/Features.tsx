import { motion } from "framer-motion";
import { Github, Shield, Layers, Eye } from "lucide-react";

const features = [
  {
    icon: Github,
    title: "GitHub-Only Verification",
    description:
      "No fake profiles, no empty resumes. Every developer is verified through their actual GitHub contributions.",
    color: "mint" as const,
  },
  {
    icon: Layers,
    title: "Complexity Levels",
    description:
      "Projects are rated L1 to L3 based on technical complexity, from simple CRUD apps to complex distributed systems.",
    color: "peach" as const,
  },
  {
    icon: Eye,
    title: "Real Work, Not Buzzwords",
    description:
      "See actual code, commit history, and detailed project breakdowns. Thinking matters more than keywords.",
    color: "lavender" as const,
  },
  {
    icon: Shield,
    title: "No Login Required for Founders",
    description:
      "Browse developer profiles, filter by skills and complexity, and reach out directly. Zero friction.",
    color: "yellow" as const,
  },
];

const colorClasses = {
  peach: "bg-pastel-peach text-pastel-peach-foreground",
  mint: "bg-pastel-mint text-pastel-mint-foreground",
  lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
  yellow: "bg-pastel-yellow text-pastel-yellow-foreground",
};

export function Features() {
  return (
    <section id="features" className="py-20 md:py-30">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="mb-4 text-display-sm md:text-display">
            Hire based on{" "}
            <span className="text-muted-foreground">what developers actually built</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Provenly shows you real work, not polished CVs. Technical credibility from day one.
          </p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-8 shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              <div
                className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl ${colorClasses[feature.color]}`}
              >
                <feature.icon className="h-7 w-7" />
              </div>

              <h3 className="mb-3 text-heading-sm">{feature.title}</h3>

              <p className="text-body text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
