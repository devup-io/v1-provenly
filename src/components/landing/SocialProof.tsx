import { motion } from "framer-motion";

// Company logos with actual SVG-style representations
const companies = [
  { name: "Stripe", logo: "Stripe" },
  { name: "Vercel", logo: "Vercel" },
  { name: "Linear", logo: "Linear" },
  { name: "Notion", logo: "Notion" },
  { name: "Supabase", logo: "Supabase" },
  { name: "Railway", logo: "Railway" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
};

export function SocialProof() {
  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="container">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="space-y-6"
        >
          <p className="text-center text-body-sm font-medium uppercase tracking-wider text-muted-foreground">
            Developers hired at
          </p>

          {/* Marquee container */}
          <div
            className="relative overflow-hidden
            [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]
            [-webkit-mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
          >
            <motion.div
              animate={{ x: [0, -1200] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 25,
                  ease: "linear",
                },
              }}
              className="flex w-max gap-10"
            >
              {[...companies, ...companies, ...companies].map((company, index) => (
                <div
                  key={`${company.name}-${index}`}
                  className="flex flex-shrink-0 items-center gap-3 rounded-lg border border-border bg-card px-5 py-3 transition-colors hover:bg-muted"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    <span className="text-lg font-bold text-muted-foreground">
                      {company.name.charAt(0)}
                    </span>
                  </div>
                  <span className="whitespace-nowrap text-body font-semibold text-foreground">
                    {company.logo}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
