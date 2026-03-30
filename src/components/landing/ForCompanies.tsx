import { motion } from "framer-motion";
import { Building2, Search, Filter, MessageSquare, Shield, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const companyBenefits = [
  {
    icon: Search,
    title: "Find Verified Talent",
    description: "Browse developers with real GitHub contributions—no inflated resumes, no keyword stuffing.",
    color: "bg-pastel-blue text-pastel-blue-foreground",
  },
  {
    icon: Filter,
    title: "Smart Filters",
    description: "Filter by tech stack, complexity level, role, and project type to find exact matches.",
    color: "bg-pastel-mint text-pastel-mint-foreground",
  },
  {
    icon: Shield,
    title: "Zero Risk Assessment",
    description: "Review actual code, project breakdowns, and technical depth before reaching out.",
    color: "bg-pastel-peach text-pastel-peach-foreground",
  },
  {
    icon: MessageSquare,
    title: "Direct Contact",
    description: "Reach out to developers directly. No middlemen, no recruiter fees, no delays.",
    color: "bg-pastel-lavender text-pastel-lavender-foreground",
  },
];

const stats = [
  { value: "3x", label: "Faster hiring" },
  { value: "90%", label: "Profile accuracy" },
  { value: "$0", label: "To browse" },
];

export function ForCompanies() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute right-[10%] top-[10%] h-[400px] w-[400px] rounded-full bg-pastel-blue/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -15, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-[10%] left-[10%] h-[350px] w-[350px] rounded-full bg-pastel-peach/10 blur-3xl"
        />
      </div>

      <div className="container">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full bg-pastel-blue px-4 py-1.5 text-body-sm font-medium text-pastel-blue-foreground"
            >
              <Building2 className="h-4 w-4" />
              For Companies
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-4 text-display-sm md:text-display"
            >
              Hire developers you can{" "}
              <span className="relative inline-block">
                <span className="relative z-10">actually trust</span>
                <motion.span
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className="absolute bottom-1 left-0 h-3 w-full origin-left bg-pastel-blue/30"
                />
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mb-8 text-body-lg text-muted-foreground"
            >
              Stop guessing. See exactly what a developer has built, how complex it was, 
              and what technologies they used—all verified through GitHub.
            </motion.p>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mb-8 flex gap-8"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
                >
                  <div className="text-display-sm font-bold text-primary">{stat.value}</div>
                  <div className="text-caption text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button variant="hero" size="xl" onClick={() => navigate("/developers")} className="text-white">
                  Browse Developers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right - Benefit Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {companyBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.12 }}
                whileHover={{ 
                  y: -6, 
                  scale: 1.03,
                  transition: { duration: 0.25 },
                }}
                className="group rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <motion.div
                  className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${benefit.color}`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <benefit.icon className="h-5 w-5" />
                </motion.div>
                <h3 className="mb-1.5 text-heading-sm text-[1.1rem]">{benefit.title}</h3>
                <p className="text-body-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
