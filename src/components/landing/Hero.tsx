import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, useSpring, useAnimationFrame } from "framer-motion";
import { ArrowRight, Github, Code2, Star, GitBranch, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";

// Animated gradient orb
function GradientOrb({ 
  className, 
  color, 
  delay = 0 
}: { 
  className: string; 
  color: string; 
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 2, delay, ease: "easeOut" }}
      className={`absolute rounded-full blur-3xl ${className}`}
      style={{ background: color }}
    >
      <motion.div
        animate={{
          scale: [1, 1.2, 0.9, 1.1, 1],
          x: [0, 30, -20, 15, 0],
          y: [0, -20, 10, -15, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-full w-full"
      />
    </motion.div>
  );
}

// Floating particle
function Particle({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0, 0.6, 0],
        y: [0, -60, -120],
        x: [0, Math.random() * 40 - 20],
      }}
      transition={{
        duration: 4,
        delay,
        repeat: Infinity,
        ease: "easeOut",
      }}
      className="absolute rounded-full bg-foreground/10"
      style={{ left: x, top: y, width: size, height: size }}
    />
  );
}

// Developer card with hover tilt
function DeveloperCard({
  name, role, avatar, level, techStack, delay = 0, className = "",
}: {
  name: string; role: string; avatar: string; level: string;
  techStack: string[]; delay?: number; className?: string;
}) {
  const levelColors = {
    "L1": "bg-pastel-mint text-pastel-mint-foreground",
    "L2": "bg-pastel-yellow text-pastel-yellow-foreground",
    "L3": "bg-pastel-peach text-pastel-peach-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ 
        scale: 1.05, 
        rotateY: 5,
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
      }}
      className={`rounded-2xl border border-border bg-card/90 p-4 shadow-card backdrop-blur-sm ${className}`}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <motion.div 
            className="h-12 w-12 overflow-hidden rounded-full bg-pastel-lavender"
            whileHover={{ scale: 1.1 }}
          >
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          </motion.div>
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-card shadow-sm">
            <Github className="h-3 w-3 text-foreground" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-semibold">{name}</p>
          <p className="truncate text-caption text-muted-foreground">{role}</p>
        </div>
        <motion.div 
          className={`rounded-lg px-2 py-1 ${levelColors[level as keyof typeof levelColors]}`}
          whileHover={{ scale: 1.15 }}
        >
          <span className="text-caption font-bold">{level}</span>
        </motion.div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {techStack.map((tech, i) => (
          <motion.span
            key={tech}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.1 * i }}
            className="rounded-full bg-muted px-2 py-0.5 text-caption text-muted-foreground"
          >
            {tech}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

// Animated counter badge
function AnimatedBadge({
  icon: Icon, text, color, delay = 0, className = "",
}: {
  icon: React.ElementType; text: string;
  color: "peach" | "lavender" | "mint" | "yellow" | "blue";
  delay?: number; className?: string;
}) {
  const colorClasses = {
    peach: "bg-pastel-peach text-pastel-peach-foreground",
    lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
    mint: "bg-pastel-mint text-pastel-mint-foreground",
    yellow: "bg-pastel-yellow text-pastel-yellow-foreground",
    blue: "bg-pastel-blue text-pastel-blue-foreground",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.6, delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1, rotate: 3 }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-lg ${colorClasses[color]} ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-body-sm font-medium">{text}</span>
    </motion.div>
  );
}

export function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden pb-20 pt-28 md:pb-32 md:pt-36">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-hero" />
        <GradientOrb 
          className="h-[500px] w-[500px] left-[10%] top-[10%]" 
          color="hsl(24 100% 92% / 0.4)" 
          delay={0} 
        />
        <GradientOrb 
          className="h-[400px] w-[400px] right-[15%] top-[20%]" 
          color="hsl(270 67% 94% / 0.4)" 
          delay={0.5} 
        />
        <GradientOrb 
          className="h-[350px] w-[350px] left-[40%] bottom-[10%]" 
          color="hsl(150 60% 92% / 0.3)" 
          delay={1} 
        />
        <GradientOrb 
          className="h-[300px] w-[300px] right-[5%] bottom-[20%]" 
          color="hsl(210 100% 94% / 0.3)" 
          delay={1.5} 
        />
        
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <Particle 
            key={i}
            delay={i * 0.5}
            x={`${10 + (i * 7) % 80}%`}
            y={`${20 + (i * 13) % 60}%`}
            size={3 + (i % 4)}
          />
        ))}

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-pastel-mint/50 px-4 py-2 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="h-4 w-4 text-pastel-mint-foreground" />
              </motion.div>
              <span className="text-body-sm font-medium text-pastel-mint-foreground">
                GitHub-verified profiles only
              </span>
            </motion.div>

            <motion.h1 
              className="mb-6 text-display text-balance md:text-display-lg lg:text-display-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Provenly helps companies evaluate developers{" "}
              </motion.span>
              <motion.span 
                className="text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                by real work, not CVs.
              </motion.span>
            </motion.h1>

            <motion.p 
              className="mb-8 text-body-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              No fake profiles. No empty resumes. Browse developers verified through their 
              actual GitHub contributions, with real project breakdowns and complexity levels.
            </motion.p>

            <motion.div 
              className="flex flex-wrap justify-center gap-4 lg:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button variant="hero" size="xl" onClick={() => navigate("/signup")} className="text-white">
                  <Github className="mr-2 h-5 w-5" />
                  Create Developer Profile
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button variant="hero-outline" size="xl" onClick={() => navigate("/developers")}>
                  View Sample Developers
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-8 flex items-center justify-center gap-6 text-body-sm text-muted-foreground lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05, x: 5 }}
              >
                <Code2 className="h-4 w-4 text-pastel-mint-foreground" />
                <span>Real code reviewed</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05, x: 5 }}
              >
                <Star className="h-4 w-4 text-pastel-yellow-foreground" />
                <span>Complexity rated</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right visual - Floating cards with parallax */}
          <div className="relative hidden h-[500px] lg:block" style={{ perspective: "1000px" }}>
            <DeveloperCard
              name="Tunde Ogunwale"
              role="Full-Stack Engineer"
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              level="L3"
              techStack={["React", "Node.js", "PostgreSQL"]}
              delay={0.4}
              className="animate-float absolute left-4 top-16 w-72"
            />
            <DeveloperCard
              name="Adeola Babatunde"
              role="Backend Engineer"
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
              level="L2"
              techStack={["Python", "FastAPI", "Redis"]}
              delay={0.6}
              className="animate-float-delayed absolute bottom-20 right-0 w-72"
            />

            <AnimatedBadge icon={Github} text="GitHub Verified" color="mint" delay={0.8} className="absolute right-16 top-8 animate-float" />
            <AnimatedBadge icon={GitBranch} text="847 commits" color="lavender" delay={1} className="animate-float-delayed absolute bottom-8 left-0" />
            <AnimatedBadge icon={Star} text="Top 5%" color="yellow" delay={1.2} className="animate-float absolute left-20 bottom-40" />

            {/* Decorative ring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              transition={{ 
                opacity: { duration: 1, delay: 1.2 },
                scale: { duration: 1, delay: 1.2 },
                rotate: { duration: 60, repeat: Infinity, ease: "linear" },
              }}
              className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/30"
              style={{
                background: "conic-gradient(from 0deg, transparent, hsl(var(--pastel-lavender) / 0.1), transparent, hsl(var(--pastel-peach) / 0.1), transparent)",
              }}
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1, delay: 1.5 }}
              className="absolute left-1/2 top-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
