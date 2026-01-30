import { motion } from "framer-motion";
import { Github, ArrowUpRight, Star, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

const developers = [
  {
    name: "Alex Rivera",
    role: "Full-Stack Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    level: "L3",
    techStack: ["React", "Node.js", "PostgreSQL"],
    stars: 847,
    commits: 1243,
    color: "peach" as const,
  },
  {
    name: "Maya Chen",
    role: "Backend Engineer",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    level: "L3",
    techStack: ["Python", "FastAPI", "Redis"],
    stars: 523,
    commits: 892,
    color: "mint" as const,
  },
  {
    name: "Jordan Kim",
    role: "Frontend Engineer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    level: "L2",
    techStack: ["Vue.js", "TypeScript", "Tailwind"],
    stars: 312,
    commits: 654,
    color: "lavender" as const,
  },
  {
    name: "Priya Sharma",
    role: "AI/ML Engineer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    level: "L3",
    techStack: ["Python", "TensorFlow", "PyTorch"],
    stars: 1023,
    commits: 567,
    color: "yellow" as const,
  },
  {
    name: "Marcus Johnson",
    role: "DevOps Engineer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    level: "L2",
    techStack: ["Kubernetes", "Terraform", "AWS"],
    stars: 198,
    commits: 423,
    color: "blue" as const,
  },
  {
    name: "Sofia Martinez",
    role: "Blockchain Developer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    level: "L3",
    techStack: ["Solidity", "Rust", "Web3.js"],
    stars: 756,
    commits: 891,
    color: "peach" as const,
  },
];

const levelColors = {
  "L1": "bg-pastel-mint text-pastel-mint-foreground",
  "L2": "bg-pastel-yellow text-pastel-yellow-foreground",
  "L3": "bg-pastel-peach text-pastel-peach-foreground",
};

const colorClasses = {
  peach: "bg-pastel-peach/10",
  mint: "bg-pastel-mint/10",
  lavender: "bg-pastel-lavender/10",
  yellow: "bg-pastel-yellow/10",
  blue: "bg-pastel-blue/10",
};

export function DeveloperShowcase() {
  return (
    <section id="developers" className="py-20 md:py-30">
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
            Sample{" "}
            <span className="text-muted-foreground">verified developers</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Browse real developer profiles with verified GitHub activity, 
            project breakdowns, and complexity ratings.
          </p>
        </motion.div>

        {/* Developer grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer, index) => (
            <motion.div
              key={developer.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={`group cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover ${colorClasses[developer.color]}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="relative">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted">
                    <img
                      src={developer.avatar}
                      alt={developer.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm">
                    <Github className="h-4 w-4 text-foreground" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg px-2 py-1 ${levelColors[developer.level as keyof typeof levelColors]}`}>
                    <span className="text-caption font-bold">{developer.level}</span>
                  </div>
                  <div className="flex items-center gap-1 rounded-full p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <h3 className="mb-1 text-subheading">{developer.name}</h3>
              <p className="mb-3 text-body-sm text-muted-foreground">
                {developer.role}
              </p>

              {/* Tech stack */}
              <div className="mb-4 flex flex-wrap gap-1.5">
                {developer.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-caption text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" /> {developer.stars} stars
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" /> {developer.commits} commits
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <Button variant="outline" size="lg">
            Browse all developers
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
