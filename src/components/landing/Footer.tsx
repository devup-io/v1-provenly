import { motion } from "framer-motion";
import { Twitter, Linkedin, Instagram, Github } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Find Talent", href: "#" },
    { label: "Find Work", href: "#" },
    { label: "How It Works", href: "#" },
    { label: "Pricing", href: "#" },
    { label: "Enterprise", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Guidelines", href: "#" },
    { label: "API", href: "#" },
    { label: "Status", href: "#" },
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
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <a href="/" className="mb-4 inline-block">
              <span className="text-heading-sm tracking-tight">Contra</span>
            </a>
            <p className="mb-6 max-w-xs text-body text-muted-foreground">
              The commission-free freelance platform for independent
              professionals and forward-thinking companies.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <h4 className="mb-4 text-body-sm font-semibold uppercase tracking-wider">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-body-sm text-muted-foreground transition-colors hover:text-foreground"
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
