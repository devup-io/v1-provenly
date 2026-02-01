import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Finally, a platform where my GitHub actually matters. Got hired within 2 weeks of creating my profile.",
    author: "Alex Chen",
    role: "Full-Stack Engineer",
    company: "Acquired by Stripe",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote: "We hired 3 engineers through Provenly. The project breakdowns told us exactly what they could do.",
    author: "Sarah Kim",
    role: "Engineering Manager",
    company: "Series B Startup",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
  {
    quote: "The complexity ratings are genius. L3 developers really know their stuff - verified by real code.",
    author: "Marcus Johnson",
    role: "CTO",
    company: "YC W24",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-30">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <span className="mb-4 inline-block rounded-full bg-pastel-yellow px-4 py-1.5 text-body-sm font-medium text-pastel-yellow-foreground">
            Testimonials
          </span>
          <h2 className="mb-4 text-display-sm md:text-display">
            Loved by developers{" "}
            <span className="text-muted-foreground">and companies</span>
          </h2>
          <p className="text-body-lg text-muted-foreground">
            See what developers and hiring managers say about Provenly.
          </p>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover"
            >
              {/* Quote icon */}
              <div className="absolute -top-3 left-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pastel-lavender">
                  <Quote className="h-4 w-4 text-pastel-lavender-foreground" />
                </div>
              </div>

              {/* Rating */}
              <div className="mb-4 flex gap-1 pt-2">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-pastel-yellow text-pastel-yellow" />
                ))}
              </div>

              {/* Quote */}
              <p className="mb-6 text-body text-foreground">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.author}
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-body-sm font-semibold">{testimonial.author}</p>
                  <p className="text-caption text-muted-foreground">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
