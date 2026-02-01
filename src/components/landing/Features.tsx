import { motion } from "framer-motion";
import { Github, Shield, Layers, Eye, CheckCircle2 } from "lucide-react";

const features = [
  {
    icon: Github,
    title: "GitHub-Only Verification",
    description:
      "No fake profiles, no empty resumes. Every developer is verified through their actual GitHub contributions.",
    highlights: ["Real commit history", "Verified repos", "Authentic profiles"],
    color: "mint" as const,
  },
  {
    icon: Layers,
    title: "Complexity Levels",
    description:
      "Projects are rated L1 to L3 based on technical complexity, from simple CRUD apps to complex distributed systems.",
    highlights: ["L1 → Beginner", "L2 → Intermediate", "L3 → Advanced"],
    color: "peach" as const,
  },
  {
    icon: Eye,
    title: "Real Work, Not Buzzwords",
    description:
      "See actual code, commit history, and detailed project breakdowns. Thinking matters more than keywords.",
    highlights: ["Code samples", "Project context", "Technical depth"],
    color: "lavender" as const,
  },
  {
    icon: Shield,
    title: "No Login for Founders",
    description:
      "Browse developer profiles, filter by skills and complexity, and reach out directly. Zero friction.",
    highlights: ["Browse freely", "Smart filters", "Direct contact"],
    color: "yellow" as const,
  },
];

const colorClasses = {
  peach: {
    bg: "bg-pastel-peach",
    text: "text-pastel-peach-foreground",
    border: "border-pastel-peach/50",
    gradient: "from-pastel-peach/20 to-transparent",
  },
  mint: {
    bg: "bg-pastel-mint",
    text: "text-pastel-mint-foreground",
    border: "border-pastel-mint/50",
    gradient: "from-pastel-mint/20 to-transparent",
  },
  lavender: {
    bg: "bg-pastel-lavender",
    text: "text-pastel-lavender-foreground",
    border: "border-pastel-lavender/50",
    gradient: "from-pastel-lavender/20 to-transparent",
  },
  yellow: {
    bg: "bg-pastel-yellow",
    text: "text-pastel-yellow-foreground",
    border: "border-pastel-yellow/50",
    gradient: "from-pastel-yellow/20 to-transparent",
  },
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
          className="mx-auto mb-16 max-w-3xl text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mb-4 inline-block rounded-full bg-pastel-peach px-4 py-1.5 text-body-sm font-medium text-pastel-peach-foreground"
          >
            Why Provenly
          </motion.span>
          <h2 className="mb-4 text-display-sm md:text-display">
            Hire based on{" "}
            <span className="relative">
              <span className="relative z-10">what developers actually built</span>
              <motion.span
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute bottom-1 left-0 h-3 bg-pastel-peach/40"
              />
            </span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Provenly shows you real work, not polished CVs. Technical credibility from day one.
          </p>
        </motion.div>

        {/* Bento-style feature grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-3xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover md:p-8 ${colorClasses[feature.color].border}`}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[feature.color].gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colorClasses[feature.color].bg} ${colorClasses[feature.color].text}`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="mb-3 text-heading-sm">{feature.title}</h3>
                <p className="mb-5 text-body text-muted-foreground">
                  {feature.description}
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2">
                  {feature.highlights.map((highlight) => (
                    <span
                      key={highlight}
                      className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-caption text-muted-foreground"
                    >
                      <CheckCircle2 className={`h-3 w-3 ${colorClasses[feature.color].text}`} />
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
