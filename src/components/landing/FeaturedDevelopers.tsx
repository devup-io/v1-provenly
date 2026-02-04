import { motion } from "framer-motion";
import { Github, Star, ArrowRight, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const featuredDevelopers = [
  {
    name: "Emily Watson",
    username: "emilywatson",
    role: "AI / ML Engineer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    level: "L3",
    badge: "Top Rated",
    badgeIcon: Trophy,
    techStack: ["Python", "PyTorch", "TensorFlow", "FastAPI"],
    stars: 445,
    projectsCompleted: 6,
    highlight: "Built ML pipeline processing 1M+ daily requests",
  },
  {
    name: "Alex Rivera",
    username: "alexrivera",
    role: "Full-Stack Engineer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    level: "L3",
    badge: "Rising Star",
    badgeIcon: Zap,
    techStack: ["React", "TypeScript", "Python", "AWS"],
    stars: 390,
    projectsCompleted: 4,
    highlight: "Shipped 3 production apps in 6 months",
  },
  {
    name: "Marcus Johnson",
    username: "marcusj",
    role: "DevOps / Cloud",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    level: "L3",
    badge: "Expert",
    badgeIcon: Trophy,
    techStack: ["Go", "Kubernetes", "PostgreSQL", "AWS"],
    stars: 289,
    projectsCompleted: 5,
    highlight: "Reduced infrastructure costs by 40%",
  },
];

const levelColors = {
  L1: "bg-pastel-mint text-pastel-mint-foreground",
  L2: "bg-pastel-yellow text-pastel-yellow-foreground",
  L3: "bg-pastel-peach text-pastel-peach-foreground",
};

export function FeaturedDevelopers() {
  const navigate = useNavigate();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
      <div className="container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-pastel-yellow px-4 py-1.5 text-body-sm font-medium text-pastel-yellow-foreground">
            <Trophy className="h-4 w-4" />
            Featured This Week
          </span>
          <h2 className="mb-4 text-display-sm md:text-display">
            Spotlight on{" "}
            <span className="text-muted-foreground">top talent</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Hand-picked developers with exceptional project contributions and verified expertise.
          </p>
        </motion.div>

        {/* Featured Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {featuredDevelopers.map((dev, index) => (
            <motion.div
              key={dev.username}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(`/dev/${dev.username}`)}
              className="group relative cursor-pointer overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
            >
              {/* Badge */}
              <div className="absolute right-4 top-4">
                <div className="flex items-center gap-1.5 rounded-full bg-pastel-yellow px-3 py-1 text-caption font-semibold text-pastel-yellow-foreground">
                  <dev.badgeIcon className="h-3.5 w-3.5" />
                  {dev.badge}
                </div>
              </div>

              {/* Avatar & Info */}
              <div className="mb-4 flex items-center gap-4">
                <div className="relative">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted ring-4 ring-background">
                    <img
                      src={dev.avatar}
                      alt={dev.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm ring-2 ring-card">
                    <Github className="h-4 w-4 text-foreground" />
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm group-hover:text-primary transition-colors">{dev.name}</h3>
                  <p className="text-body-sm text-muted-foreground">{dev.role}</p>
                </div>
              </div>

              {/* Level & Stats */}
              <div className="mb-4 flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-caption font-bold ${levelColors[dev.level as keyof typeof levelColors]}`}>
                  {dev.level}
                </span>
                <span className="flex items-center gap-1 text-caption text-muted-foreground">
                  <Star className="h-3.5 w-3.5" />
                  {dev.stars} stars
                </span>
                <span className="text-caption text-muted-foreground">
                  {dev.projectsCompleted} projects
                </span>
              </div>

              {/* Highlight */}
              <p className="mb-4 text-body-sm text-foreground/80 italic">
                "{dev.highlight}"
              </p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5">
                {dev.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-muted px-2.5 py-1 text-caption text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Hover Arrow */}
              <div className="absolute bottom-6 right-6 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <Button variant="outline" size="lg" onClick={() => navigate("/developers")} className="group">
            Explore all developers
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
