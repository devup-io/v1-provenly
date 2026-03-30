import { motion, useScroll, useTransform } from "framer-motion";
import { Rocket, Eye, BadgeCheck, TrendingUp, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

const benefits = [
  {
    icon: Eye,
    title: "Get Discovered",
    description: "Stand out to hiring managers actively searching for verified talent with real project history.",
    color: "bg-pastel-lavender text-pastel-lavender-foreground",
    accent: "pastel-lavender",
  },
  {
    icon: BadgeCheck,
    title: "Verified Credibility",
    description: "Your GitHub contributions speak for themselves. No need to embellish—let your code do the talking.",
    color: "bg-pastel-mint text-pastel-mint-foreground",
    accent: "pastel-mint",
  },
  {
    icon: TrendingUp,
    title: "Showcase Growth",
    description: "Complexity levels (L1-L3) highlight your progression from simple projects to enterprise-grade solutions.",
    color: "bg-pastel-yellow text-pastel-yellow-foreground",
    accent: "pastel-yellow",
  },
  {
    icon: Users,
    title: "Join Top Talent",
    description: "Be part of a curated community of developers who value transparency and real-world experience.",
    color: "bg-pastel-blue text-pastel-blue-foreground",
    accent: "pastel-blue",
  },
  {
    icon: Sparkles,
    title: "Effortless Setup",
    description: "Connect GitHub, select your best projects, add context—your profile is ready in minutes.",
    color: "bg-pastel-peach text-pastel-peach-foreground",
    accent: "pastel-peach",
  },
  {
    icon: Rocket,
    title: "Career Boost",
    description: "Companies trust verified profiles more. Get noticed faster and land opportunities that match your skills.",
    color: "bg-pastel-lavender text-pastel-lavender-foreground",
    accent: "pastel-lavender",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export function WhyJoin() {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section ref={ref} className="relative overflow-hidden py-20 md:py-28 bg-muted/30">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 -z-10" style={{ y: bgY }}>
        <div className="absolute left-0 top-0 h-[400px] w-[400px] rounded-full bg-pastel-lavender/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-pastel-peach/15 blur-3xl" />
      </motion.div>

      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-pastel-lavender px-4 py-1.5 text-body-sm font-medium text-pastel-lavender-foreground"
          >
            <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Rocket className="h-4 w-4" />
            </motion.div>
            For Developers
          </motion.span>
          <h2 className="mb-4 text-display-sm md:text-display">
            Why join{" "}
            <motion.span 
              className="text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              Provenly?
            </motion.span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Stop sending cold applications. Let companies come to you based on your verified work.
          </p>
        </motion.div>

        {/* Benefits Grid with stagger */}
        <motion.div 
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.03,
                transition: { duration: 0.3, type: "spring", stiffness: 300 },
              }}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-shadow duration-300 hover:shadow-card-hover"
            >
              {/* Hover glow effect */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-${benefit.accent}/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              
              <div className="relative z-10">
                <motion.div 
                  className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${benefit.color}`}
                  whileHover={{ rotate: 10, scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <benefit.icon className="h-6 w-6" />
                </motion.div>
                <h3 className="mb-2 text-heading-sm">{benefit.title}</h3>
                <p className="text-body-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button variant="hero" size="xl" onClick={() => navigate("/signup")} className="text-white">
              Create your profile
              <Rocket className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
          <motion.p 
            className="mt-4 text-body-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8 }}
          >
            Free forever for developers. No credit card required.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
