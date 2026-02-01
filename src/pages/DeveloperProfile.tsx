import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Github, Star, GitBranch, ArrowLeft, ExternalLink, 
  MapPin, Mail, Linkedin, Calendar, Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/landing/Header";

const mockDevelopers: Record<string, {
  name: string;
  username: string;
  avatarUrl: string;
  roles: string[];
  techStack: string[];
  maxComplexity: string;
  totalStars: number;
  projectCount: number;
  bio: string;
  location: string;
  email: string;
  linkedin: string;
  joinedDate: string;
  projects: {
    id: string;
    name: string;
    description: string;
    problem: string;
    contribution: string;
    complexity: string;
    techUsed: string[];
    stars: number;
    forks: number;
    url: string;
  }[];
}> = {
  alexrivera: {
    name: "Alex Rivera",
    username: "alexrivera",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face",
    roles: ["Full-stack Engineer", "AI / ML Engineer"],
    techStack: ["React", "TypeScript", "Python", "Node.js", "PostgreSQL", "AWS"],
    maxComplexity: "L3",
    totalStars: 390,
    projectCount: 4,
    bio: "Full-stack engineer with 6+ years of experience building scalable web applications. Passionate about clean code and developer experience.",
    location: "San Francisco, CA",
    email: "alex@example.com",
    linkedin: "linkedin.com/in/alexrivera",
    joinedDate: "January 2024",
    projects: [
      {
        id: "1",
        name: "real-time-collaboration-engine",
        description: "A distributed real-time collaboration engine with CRDT support for conflict-free editing",
        problem: "Teams working on documents simultaneously face merge conflicts and sync issues. Existing solutions are slow and don't scale well.",
        contribution: "Built the entire CRDT implementation from scratch, designed the WebSocket architecture, and optimized sync performance by 10x.",
        complexity: "L3",
        techUsed: ["TypeScript", "WebSocket", "Redis", "PostgreSQL", "React"],
        stars: 234,
        forks: 89,
        url: "https://github.com/alexrivera/real-time-collab",
      },
      {
        id: "2",
        name: "ml-recommendation-engine",
        description: "Machine learning powered recommendation system for e-commerce platforms",
        problem: "E-commerce sites struggle to provide personalized recommendations that actually convert.",
        contribution: "Developed the ML pipeline, trained collaborative filtering models, and built the API layer for real-time recommendations.",
        complexity: "L3",
        techUsed: ["Python", "TensorFlow", "FastAPI", "Redis", "PostgreSQL"],
        stars: 156,
        forks: 42,
        url: "https://github.com/alexrivera/ml-reco",
      },
      {
        id: "3",
        name: "nextjs-saas-starter",
        description: "Production-ready SaaS starter kit with authentication, billing, and team management",
        problem: "Starting a new SaaS project requires weeks of boilerplate setup for auth, payments, and teams.",
        contribution: "Created the complete starter kit including Stripe integration, role-based access, and a polished dashboard UI.",
        complexity: "L2",
        techUsed: ["Next.js", "TypeScript", "Prisma", "Stripe", "Tailwind"],
        stars: 89,
        forks: 23,
        url: "https://github.com/alexrivera/saas-starter",
      },
      {
        id: "4",
        name: "cli-dev-tools",
        description: "Collection of CLI tools for developer productivity",
        problem: "Developers waste time on repetitive terminal tasks that could be automated.",
        contribution: "Built a suite of CLI tools for project scaffolding, git workflows, and deployment automation.",
        complexity: "L1",
        techUsed: ["Node.js", "TypeScript", "Commander"],
        stars: 45,
        forks: 12,
        url: "https://github.com/alexrivera/cli-tools",
      },
    ],
  },
  sarahchen: {
    name: "Sarah Chen",
    username: "sarahchen",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face",
    roles: ["Frontend Engineer", "Designer"],
    techStack: ["React", "Vue", "Figma", "Tailwind", "TypeScript", "Framer Motion"],
    maxComplexity: "L2",
    totalStars: 156,
    projectCount: 3,
    bio: "Frontend engineer and designer focused on creating beautiful, accessible user interfaces. I love bringing designs to life with smooth animations.",
    location: "New York, NY",
    email: "sarah@example.com",
    linkedin: "linkedin.com/in/sarahchen",
    joinedDate: "February 2024",
    projects: [
      {
        id: "1",
        name: "component-library-pro",
        description: "Accessible React component library with Radix primitives and Tailwind styling",
        problem: "Most component libraries sacrifice accessibility for aesthetics or are too opinionated in styling.",
        contribution: "Designed and built 50+ accessible components with customizable theming and comprehensive documentation.",
        complexity: "L2",
        techUsed: ["React", "TypeScript", "Radix UI", "Tailwind", "Storybook"],
        stars: 89,
        forks: 23,
        url: "https://github.com/sarahchen/component-lib",
      },
      {
        id: "2",
        name: "portfolio-template",
        description: "Modern portfolio template for developers and designers",
        problem: "Developers need professional portfolios but don't want to spend weeks building one.",
        contribution: "Created a fully customizable portfolio template with smooth animations and dark mode support.",
        complexity: "L1",
        techUsed: ["Next.js", "Framer Motion", "Tailwind", "MDX"],
        stars: 45,
        forks: 18,
        url: "https://github.com/sarahchen/portfolio",
      },
      {
        id: "3",
        name: "figma-to-code",
        description: "Plugin that converts Figma designs to React components",
        problem: "Translating Figma designs to code is tedious and error-prone.",
        contribution: "Built the Figma plugin and React code generator with support for responsive layouts.",
        complexity: "L2",
        techUsed: ["TypeScript", "Figma API", "React"],
        stars: 22,
        forks: 5,
        url: "https://github.com/sarahchen/figma-to-code",
      },
    ],
  },
  marcusj: {
    name: "Marcus Johnson",
    username: "marcusj",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face",
    roles: ["Backend Engineer", "DevOps / Cloud"],
    techStack: ["Go", "Kubernetes", "PostgreSQL", "AWS", "Terraform", "Docker"],
    maxComplexity: "L3",
    totalStars: 289,
    projectCount: 5,
    bio: "Backend engineer specializing in distributed systems and cloud infrastructure. I build systems that scale to millions of users.",
    location: "Austin, TX",
    email: "marcus@example.com",
    linkedin: "linkedin.com/in/marcusj",
    joinedDate: "December 2023",
    projects: [
      {
        id: "1",
        name: "distributed-task-queue",
        description: "High-performance distributed task queue built in Go with Redis backend",
        problem: "Existing task queues don't handle high-throughput workloads with proper retry and dead-letter handling.",
        contribution: "Designed and implemented the queue system handling 100k+ tasks/second with exactly-once semantics.",
        complexity: "L3",
        techUsed: ["Go", "Redis", "PostgreSQL", "gRPC"],
        stars: 156,
        forks: 45,
        url: "https://github.com/marcusj/task-queue",
      },
      {
        id: "2",
        name: "k8s-autoscaler",
        description: "Custom Kubernetes autoscaler based on queue depth and latency metrics",
        problem: "Default K8s autoscaling doesn't account for async workloads or custom business metrics.",
        contribution: "Built a custom controller that scales based on queue depth, latency percentiles, and cost optimization.",
        complexity: "L3",
        techUsed: ["Go", "Kubernetes", "Prometheus", "Helm"],
        stars: 89,
        forks: 23,
        url: "https://github.com/marcusj/k8s-scaler",
      },
      {
        id: "3",
        name: "terraform-aws-modules",
        description: "Collection of production-ready Terraform modules for AWS infrastructure",
        problem: "Setting up secure, best-practice AWS infrastructure is complex and time-consuming.",
        contribution: "Created reusable Terraform modules for VPC, ECS, RDS, and other common patterns.",
        complexity: "L2",
        techUsed: ["Terraform", "AWS", "GitHub Actions"],
        stars: 44,
        forks: 12,
        url: "https://github.com/marcusj/tf-modules",
      },
      {
        id: "4",
        name: "log-aggregator",
        description: "Lightweight log aggregation service for microservices",
        problem: "Centralized logging solutions are expensive and complex to set up for small teams.",
        contribution: "Built a simple, self-hosted log aggregator with search and alerting capabilities.",
        complexity: "L2",
        techUsed: ["Go", "ClickHouse", "Grafana"],
        stars: 34,
        forks: 8,
        url: "https://github.com/marcusj/logs",
      },
      {
        id: "5",
        name: "api-gateway-lite",
        description: "Minimal API gateway with rate limiting and auth",
        problem: "Full API gateways like Kong are overkill for small to medium projects.",
        contribution: "Created a lightweight gateway with JWT auth, rate limiting, and request routing.",
        complexity: "L2",
        techUsed: ["Go", "Redis", "Docker"],
        stars: 28,
        forks: 6,
        url: "https://github.com/marcusj/api-gw",
      },
    ],
  },
};

const complexityColors: Record<string, string> = {
  L1: "bg-pastel-mint text-pastel-mint-foreground",
  L2: "bg-pastel-yellow text-pastel-yellow-foreground",
  L3: "bg-pastel-peach text-pastel-peach-foreground",
};

export default function DeveloperProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const developer = username ? mockDevelopers[username] : null;

  if (!developer) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-20 pt-28 text-center">
          <h1 className="mb-4 text-display-sm">Developer not found</h1>
          <p className="mb-8 text-body text-muted-foreground">
            The developer profile you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/developers")}>
            Browse developers
          </Button>
        </main>
      </div>
    );
  }

  const complexityCounts = developer.projects.reduce((acc, p) => {
    acc[p.complexity] = (acc[p.complexity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 pt-28">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/developers")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to developers
        </Button>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-3xl border border-border bg-card p-6 shadow-card md:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
            {/* Avatar */}
            <div className="relative mx-auto md:mx-0">
              <img
                src={developer.avatarUrl}
                alt={developer.name}
                className="h-28 w-28 rounded-2xl object-cover md:h-36 md:w-36"
              />
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-md ring-2 ring-card">
                <Github className="h-5 w-5 text-foreground" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <h1 className="text-display-sm">{developer.name}</h1>
                <span className={`rounded-lg px-3 py-1 text-body-sm font-bold ${complexityColors[developer.maxComplexity]}`}>
                  Max {developer.maxComplexity}
                </span>
              </div>
              <p className="mb-3 text-body text-muted-foreground">
                @{developer.username}
              </p>
              <p className="mb-4 max-w-2xl text-body text-muted-foreground">
                {developer.bio}
              </p>

              {/* Roles */}
              <div className="mb-4 flex flex-wrap justify-center gap-2 md:justify-start">
                {developer.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-primary/10 px-3 py-1 text-body-sm font-medium text-primary"
                  >
                    {role}
                  </span>
                ))}
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-body-sm text-muted-foreground md:justify-start">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {developer.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {developer.joinedDate}
                </span>
                <span className="flex items-center gap-1.5">
                  <Star className="h-4 w-4" />
                  {developer.totalStars} total stars
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-2">
              <Button variant="default" size="lg" className="gap-2">
                <Mail className="h-4 w-4" />
                Contact
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats & Tech */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Complexity breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h3 className="mb-4 text-heading-sm">Complexity breakdown</h3>
            <div className="flex gap-4">
              {["L1", "L2", "L3"].map((level) => (
                <div key={level} className="flex-1 text-center">
                  <div className={`mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl ${complexityColors[level]}`}>
                    <span className="text-lg font-bold">{complexityCounts[level] || 0}</span>
                  </div>
                  <p className="text-caption text-muted-foreground">{level} projects</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tech stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-card"
          >
            <h3 className="mb-4 text-heading-sm">Tech stack</h3>
            <div className="flex flex-wrap gap-2">
              {developer.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-secondary px-3 py-1.5 text-body-sm"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mb-6 text-display-sm">Projects ({developer.projects.length})</h2>
          <div className="space-y-6">
            {developer.projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + index * 0.05 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8"
              >
                {/* Project header */}
                <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-3">
                      <h3 className="text-heading">{project.name}</h3>
                      <span className={`rounded-lg px-2.5 py-1 text-caption font-bold ${complexityColors[project.complexity]}`}>
                        {project.complexity}
                      </span>
                    </div>
                    <p className="text-body text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      View on GitHub
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </div>

                {/* Stats */}
                <div className="mb-6 flex items-center gap-4 text-body-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4" />
                    {project.stars} stars
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="h-4 w-4" />
                    {project.forks} forks
                  </span>
                </div>

                {/* Breakdown */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-body-sm font-semibold">
                      <Code2 className="h-4 w-4 text-primary" />
                      Problem solved
                    </h4>
                    <p className="text-body-sm text-muted-foreground">
                      {project.problem}
                    </p>
                  </div>
                  <div>
                    <h4 className="mb-2 flex items-center gap-2 text-body-sm font-semibold">
                      <Code2 className="h-4 w-4 text-primary" />
                      Personal contribution
                    </h4>
                    <p className="text-body-sm text-muted-foreground">
                      {project.contribution}
                    </p>
                  </div>
                </div>

                {/* Tech used */}
                <div className="mt-6 border-t border-border pt-4">
                  <div className="flex flex-wrap gap-2">
                    {project.techUsed.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full bg-muted px-3 py-1 text-caption text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
