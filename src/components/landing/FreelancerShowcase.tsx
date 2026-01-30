import { motion } from "framer-motion";
import { Verified, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const freelancers = [
  {
    name: "Emma Rodriguez",
    role: "Brand Designer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    badge: "Top Rated",
    color: "peach" as const,
  },
  {
    name: "James Park",
    role: "Frontend Developer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    badge: "Rising Star",
    color: "mint" as const,
  },
  {
    name: "Sofia Martinez",
    role: "UX Researcher",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    badge: "Commission-free",
    color: "lavender" as const,
  },
  {
    name: "David Chen",
    role: "Motion Designer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    badge: "Top Rated",
    color: "yellow" as const,
  },
  {
    name: "Aisha Johnson",
    role: "Content Writer",
    avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
    badge: "Expert",
    color: "blue" as const,
  },
  {
    name: "Michael Brown",
    role: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    badge: "Commission-free",
    color: "peach" as const,
  },
];

const colorClasses = {
  peach: "bg-pastel-peach text-pastel-peach-foreground",
  mint: "bg-pastel-mint text-pastel-mint-foreground",
  lavender: "bg-pastel-lavender text-pastel-lavender-foreground",
  yellow: "bg-pastel-yellow text-pastel-yellow-foreground",
  blue: "bg-pastel-blue text-pastel-blue-foreground",
};

export function FreelancerShowcase() {
  return (
    <section id="freelancers" className="py-20 md:py-30">
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
            Meet our{" "}
            <span className="text-muted-foreground">talented community</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            Join a global network of independent professionals delivering
            exceptional work for top companies.
          </p>
        </motion.div>

        {/* Freelancer grid */}
        <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {freelancers.map((freelancer, index) => (
            <motion.div
              key={freelancer.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group cursor-pointer rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="relative">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl bg-muted">
                    <img
                      src={freelancer.avatar}
                      alt={freelancer.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm">
                    <Verified className="h-4 w-4 text-pastel-mint-foreground" />
                  </div>
                </div>
                <div
                  className="flex items-center gap-1 rounded-full p-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              <h3 className="mb-1 text-subheading">{freelancer.name}</h3>
              <p className="mb-4 text-body-sm text-muted-foreground">
                {freelancer.role}
              </p>

              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${colorClasses[freelancer.color]}`}
              >
                <span className="text-caption font-medium">
                  {freelancer.badge}
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
            Browse all talent
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
