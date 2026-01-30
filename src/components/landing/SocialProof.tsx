import { motion } from "framer-motion";

const companies = [
  { name: "Stripe", logo: "Stripe" },
  { name: "Vercel", logo: "Vercel" },
  { name: "Linear", logo: "Linear" },
  { name: "Notion", logo: "Notion" },
  { name: "Supabase", logo: "Supabase" },
  { name: "Railway", logo: "Railway" },
];

export function SocialProof() {
  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <p className="text-body-sm font-medium uppercase tracking-wider text-muted-foreground">
            Developers hired at
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16"
        >
          {companies.map((company, index) => (
            <motion.div
              key={company.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="flex items-center justify-center opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            >
              <span className="text-heading font-bold text-muted-foreground">
                {company.logo}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
