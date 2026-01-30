import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, Star, Verified } from "lucide-react";

// Floating profile card component
function ProfileCard({
  name,
  role,
  avatar,
  earnings,
  delay = 0,
  className = "",
}: {
  name: string;
  role: string;
  avatar: string;
  earnings: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`rounded-2xl border border-border bg-card p-4 shadow-card ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-pastel-lavender">
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pastel-mint">
            <Verified className="h-3 w-3 text-pastel-mint-foreground" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-body-sm font-semibold">{name}</p>
          <p className="truncate text-caption text-muted-foreground">{role}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-pastel-yellow/50 px-3 py-2">
        <DollarSign className="h-4 w-4 text-pastel-yellow-foreground" />
        <span className="text-body-sm font-medium text-pastel-yellow-foreground">
          {earnings} earned
        </span>
      </div>
    </motion.div>
  );
}

// Badge component for floating elements
function FloatingBadge({
  icon: Icon,
  text,
  color,
  delay = 0,
  className = "",
}: {
  icon: React.ElementType;
  text: string;
  color: "peach" | "lavender" | "mint" | "yellow" | "blue";
  delay?: number;
  className?: string;
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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 shadow-md ${colorClasses[color]} ${className}`}
    >
      <Icon className="h-4 w-4" />
      <span className="text-body-sm font-medium">{text}</span>
    </motion.div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-16 md:pb-32 md:pt-24">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-pastel-peach/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-pastel-lavender/30 blur-3xl" />
      </div>

      <div className="container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-pastel-mint/50 px-4 py-2"
            >
              <Star className="h-4 w-4 text-pastel-mint-foreground" />
              <span className="text-body-sm font-medium text-pastel-mint-foreground">
                Zero commission, always
              </span>
            </motion.div>

            <h1 className="mb-6 text-display text-balance md:text-display-lg lg:text-display-xl">
              Work the way you want.{" "}
              <span className="text-muted-foreground">Get paid commission-free.</span>
            </h1>

            <p className="mb-8 text-body-lg text-muted-foreground">
              Contra connects independent professionals with forward-thinking companies.
              Build your portfolio, land projects, and keep 100% of what you earn.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl">
                Join Contra
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="hero-outline" size="xl">
                Hire Talent
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-4 text-body-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background bg-pastel-lavender"
                  />
                ))}
              </div>
              <span>Join 500k+ independents worldwide</span>
            </div>
          </motion.div>

          {/* Right visual - Floating cards */}
          <div className="relative hidden h-[500px] lg:block">
            {/* Main profile card */}
            <ProfileCard
              name="Sarah Chen"
              role="Product Designer"
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
              earnings="$125k+"
              delay={0.3}
              className="animate-float absolute left-8 top-16 w-64"
            />

            {/* Secondary profile card */}
            <ProfileCard
              name="Marcus Johnson"
              role="Full-Stack Developer"
              avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              earnings="$89k+"
              delay={0.5}
              className="animate-float-delayed absolute bottom-20 right-4 w-64"
            />

            {/* Floating badges */}
            <FloatingBadge
              icon={Verified}
              text="Verified Pro"
              color="mint"
              delay={0.7}
              className="absolute right-20 top-8 animate-float"
            />

            <FloatingBadge
              icon={DollarSign}
              text="0% Fees"
              color="peach"
              delay={0.9}
              className="animate-float-delayed absolute bottom-8 left-0"
            />

            {/* Decorative elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/50 bg-card/50"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
