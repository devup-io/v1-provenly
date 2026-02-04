import { motion } from "framer-motion";
import { Rocket, Eye, BadgeCheck, TrendingUp, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const benefits = [
  {
    icon: Eye,
    title: "Get Discovered",
    description: "Stand out to hiring managers actively searching for verified talent with real project history.",
    color: "bg-pastel-lavender text-pastel-lavender-foreground",
  },
  {
    icon: BadgeCheck,
    title: "Verified Credibility",
    description: "Your GitHub contributions speak for themselves. No need to embellish—let your code do the talking.",
    color: "bg-pastel-mint text-pastel-mint-foreground",
  },
  {
    icon: TrendingUp,
    title: "Showcase Growth",
    description: "Complexity levels (L1-L3) highlight your progression from simple projects to enterprise-grade solutions.",
    color: "bg-pastel-yellow text-pastel-yellow-foreground",
  },
  {
    icon: Users,
    title: "Join Top Talent",
    description: "Be part of a curated community of developers who value transparency and real-world experience.",
    color: "bg-pastel-blue text-pastel-blue-foreground",
  },
  {
    icon: Sparkles,
    title: "Effortless Setup",
    description: "Connect GitHub, select your best projects, add context—your profile is ready in minutes.",
    color: "bg-pastel-peach text-pastel-peach-foreground",
  },
  {
    icon: Rocket,
    title: "Career Boost",
    description: "Companies trust verified profiles more. Get noticed faster and land opportunities that match your skills.",
    color: "bg-pastel-lavender text-pastel-lavender-foreground",
  },
];

export function WhyJoin() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-pastel-lavender px-4 py-1.5 text-body-sm font-medium text-pastel-lavender-foreground">
            <Rocket className="h-4 w-4" />
            For Developers
          </span>
          <h2 className="mb-4 text-display-sm md:text-display">
            Why join{" "}
            <span className="text-muted-foreground">Provenly?</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Stop sending cold applications. Let companies come to you based on your verified work.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:shadow-card-hover hover:border-primary/20"
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${benefit.color}`}>
                <benefit.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-heading-sm">{benefit.title}</h3>
              <p className="text-body-sm text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Button variant="hero" size="xl" onClick={() => navigate("/signup")}>
            Create your profile
            <Rocket className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-body-sm text-muted-foreground">
            Free forever for developers. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
