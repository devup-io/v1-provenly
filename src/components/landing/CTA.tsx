import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden py-20 md:py-30">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-cta" />

      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-pastel-lavender/40 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-pastel-peach/40 blur-3xl"
        />
      </div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 shadow-md"
          >
            <Sparkles className="h-4 w-4 text-pastel-yellow-foreground" />
            <span className="text-body-sm font-medium">
              Join 500,000+ independents
            </span>
          </motion.div>

          <h2 className="mb-6 text-display-sm text-balance md:text-display lg:text-display-lg">
            Independence starts here.
          </h2>

          <p className="mb-10 text-body-lg text-muted-foreground">
            Whether you're a freelancer looking for your next project or a
            company searching for top talent, Contra is the platform built for
            the future of work.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="hero" size="xl">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="hero-outline" size="xl">
              Learn More
            </Button>
          </div>

          <p className="mt-6 text-body-sm text-muted-foreground">
            No credit card required • Free forever for freelancers
          </p>
        </motion.div>
      </div>
    </section>
  );
}
