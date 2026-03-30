import { motion } from "framer-motion";

// Company logo SVG components
const StripeLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z" />
  </svg>
);

const VercelLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M24 22.525H0l12-21.05 12 21.05z" />
  </svg>
);

const LinearLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M2.886 18.693L.012 6.987a.698.698 0 01.48-.847l11.622-3.203a.698.698 0 01.847.48l2.874 11.706a.698.698 0 01-.48.847L3.733 19.173a.698.698 0 01-.847-.48zm18.237-6.09l-4.2-4.2a.35.35 0 00-.495 0l-7.07 7.07a.35.35 0 000 .495l4.2 4.2a.35.35 0 00.495 0l7.07-7.07a.35.35 0 000-.495z" />
  </svg>
);

const NotionLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.98-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.166V6.354c0-.606-.233-.933-.748-.886l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.22.187c-.094-.187 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
  </svg>
);

const SupabaseLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M13.287 23.406a1.18 1.18 0 01-1.908.701l-8.5-6.895c-.682-.553-.208-1.64.682-1.64h7.55l2.176 7.834zM21.121 8.428a1.18 1.18 0 01.682 1.64l-8.5 13.23c-.38.592-1.342.177-1.214-.527l2.176-7.834h5.174c.89 0 1.364-1.087.682-1.64l-8.5-6.895a1.18 1.18 0 01.225-1.908l9.275-4.092z" />
  </svg>
);

const RailwayLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
    <path d="M.113 12.611c0 1.893.715 3.62 1.89 4.923l5.333-5.333H.113v.41zm.66 5.963a8.579 8.579 0 002.678 2.678l6.136-6.136H2.608l-1.835 1.835v1.623zm3.797 3.535a8.534 8.534 0 004.514 1.778V17.8l-4.514 4.309zm5.94 1.843c3.376-.206 6.321-2.063 7.993-4.77h-7.994v4.77zm8.453-6.196a8.52 8.52 0 00.924-3.884c0-.478-.04-.947-.116-1.404H10.51v5.288h9.453zM10.51.113v12.088h13.374A8.622 8.622 0 0010.51.113z" />
  </svg>
);

// Company logos with actual SVG components
const companies = [
  { name: "Stripe", Logo: StripeLogo },
  { name: "Vercel", Logo: VercelLogo },
  { name: "Linear", Logo: LinearLogo },
  { name: "Notion", Logo: NotionLogo },
  { name: "Supabase", Logo: SupabaseLogo },
  { name: "Railway", Logo: RailwayLogo },
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
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-foreground">
                    <company.Logo />
                  </div>
                  <span className="whitespace-nowrap text-body font-semibold text-foreground">
                    {company.name}
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
