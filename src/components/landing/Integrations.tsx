import { motion } from "framer-motion";
import { Github, Linkedin, Globe, Code2, GitBranch, Terminal } from "lucide-react";

const integrations = [
  {
    icon: Github,
    name: "GitHub",
    description: "Auto-import repos, commits, stars, and contribution history",
    color: "bg-foreground text-background",
    connected: true,
  },
  {
    icon: Linkedin,
    name: "LinkedIn",
    description: "Import your professional experience and endorsements",
    color: "bg-pastel-blue text-pastel-blue-foreground",
    connected: false,
    comingSoon: true,
  },
  {
    icon: Globe,
    name: "Portfolio",
    description: "Link your personal website or portfolio for extra context",
    color: "bg-pastel-mint text-pastel-mint-foreground",
    connected: true,
  },
  {
    icon: Code2,
    name: "LeetCode",
    description: "Showcase your algorithmic problem-solving skills",
    color: "bg-pastel-yellow text-pastel-yellow-foreground",
    connected: false,
    comingSoon: true,
  },
  {
    icon: GitBranch,
    name: "GitLab",
    description: "Import contributions from GitLab repositories",
    color: "bg-pastel-peach text-pastel-peach-foreground",
    connected: false,
    comingSoon: true,
  },
  {
    icon: Terminal,
    name: "Stack Overflow",
    description: "Display your reputation and top answers",
    color: "bg-pastel-lavender text-pastel-lavender-foreground",
    connected: false,
    comingSoon: true,
  },
];

export function Integrations() {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-20 md:py-28">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
          style={{
            background: "conic-gradient(from 0deg, transparent, hsl(var(--pastel-lavender) / 0.08), transparent, hsl(var(--pastel-mint) / 0.08), transparent)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring" }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-pastel-peach px-4 py-1.5 text-body-sm font-medium text-pastel-peach-foreground"
          >
            <Code2 className="h-4 w-4" />
            Integrations
          </motion.span>
          <h2 className="mb-4 text-display-sm md:text-display">
            Connect your{" "}
            <span className="text-muted-foreground">developer identity</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Pull in your work from platforms you already use. One profile, all your proof.
          </p>
        </motion.div>

        {/* Integration cards in a hexagonal-inspired layout */}
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration, index) => (
              <motion.div
                key={integration.name}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                whileHover={{ 
                  y: -8,
                  scale: 1.04,
                  transition: { duration: 0.25 },
                }}
                className="group relative rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between">
                  <motion.div
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${integration.color}`}
                    whileHover={{ rotate: 15, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <integration.icon className="h-6 w-6" />
                  </motion.div>
                  {integration.connected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.1, type: "spring" }}
                      className="rounded-full bg-pastel-mint px-2.5 py-0.5 text-caption font-medium text-pastel-mint-foreground"
                    >
                      Live
                    </motion.span>
                  )}
                  {integration.comingSoon && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-caption font-medium text-muted-foreground">
                      Soon
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-heading-sm">{integration.name}</h3>
                <p className="mt-1 text-body-sm text-muted-foreground">{integration.description}</p>
                
                {/* Connection line animation */}
                <motion.div
                  className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted"
                >
                  {integration.connected && (
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      className="h-full rounded-full bg-pastel-mint"
                    />
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
