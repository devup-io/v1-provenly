import { motion } from "framer-motion";
import { Twitter, Linkedin, Instagram, Github } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Find Talent", href: "#" },
    { label: "Find Work", href: "#" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Pricing", href: "#" },
    { label: "Enterprise", href: "#" },
    { label: "Login / Sign Up", href: "/signup" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Help", href: "/help" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "/contact" },
    { label: "Features", href: "/features" },
    { label: "Use Cases", href: "/use-cases" },
    { label: "What is Provenly?", href: "/what-is-provenly" },
    { label: "Resource Guides", href: "/resources/best-platform-to-showcase-developer-projects" },
  ],
  Resources: [
    { label: "Help", href: "/help" },
    { label: "Community", href: "#" },
    { label: "Guidelines", href: "#" },
    { label: "API", href: "#" },
    { label: "Status", href: "/status" },
    { label: "Best Platform Guide", href: "/resources/best-platform-to-showcase-developer-projects" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Github, href: "#", label: "GitHub" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12 md:py-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand column - full width on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2 lg:col-span-2"
          >
            <a href="/" className="mb-4 inline-block">
              <span className="text-heading-sm tracking-tight">Provenly</span>
            </a>
            <p className="mb-6 max-w-xs text-body-sm text-muted-foreground">
              The GitHub-verified platform for developers who want to be judged
              by their real work, not empty resumes.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link columns - 2 per row on mobile */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
              className="col-span-1"
            >
              <h4 className="mb-3 text-caption font-semibold uppercase tracking-wider md:mb-4 md:text-body-sm">
                {title}
              </h4>
              <ul className="space-y-2 md:space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-caption text-muted-foreground transition-colors hover:text-foreground md:text-body-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row"
        >
          <p className="text-body-sm text-muted-foreground">
            © {new Date().getFullYear()} Contra. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-body-sm text-muted-foreground hover:text-foreground"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-body-sm text-muted-foreground hover:text-foreground"
            >
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
