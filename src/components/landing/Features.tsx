import { motion } from "framer-motion";
import { DollarSign, Shield, UserCheck, Palette } from "lucide-react";

const features = [
  {
    icon: DollarSign,
    title: "Zero Commission",
    description:
      "Keep 100% of what you earn. No hidden fees, no percentage cuts. Your work, your money.",
    color: "peach" as const,
  },
  {
    icon: Shield,
    title: "Built-in Payments",
    description:
      "Fast, secure payouts with milestone tracking. Get paid on time, every time.",
    color: "mint" as const,
  },
  {
    icon: UserCheck,
    title: "Verified Talent",
    description:
      "Access a curated network of independent professionals with proven track records.",
    color: "lavender" as const,
  },
  {
    icon: Palette,
    title: "Modern Profiles",
    description:
      "Beautiful portfolio-style profiles that showcase your best work and attract clients.",
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
            Everything you need to{" "}
            <span className="text-muted-foreground">succeed independently</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Built for modern freelancers and teams who value transparency,
            flexibility, and fair compensation.
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
