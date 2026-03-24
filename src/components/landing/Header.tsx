import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import { getDeveloper } from "@/lib/api";

const navLinks = [
  { label: "Developers", href: "/developers" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Features", href: "/#features" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20);
          ticking = false;
        });
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check if user is authenticated
    const developer = getDeveloper();
    setIsAuthenticated(!!developer);
  }, [location.pathname]);

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const element = document.querySelector(href.substring(1));
          element?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const element = document.querySelector(href.substring(1));
        element?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={`mx-auto max-w-6xl rounded-full border border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-300 ${
          scrolled ? "shadow-lg" : "shadow-md"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4 md:h-16 md:px-6">
          {/* Logo */}
          <button onClick={() => navigate("/")} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">P</span>
            </div>
            <span className="text-heading-sm tracking-tight">Provenly</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-body-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop Search & Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <NotificationBell enabled={isAuthenticated} />
            {/* Search Bar */}
            <div className={`relative transition-all duration-300 ${searchFocused ? "w-64" : "w-48"}`}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search developers..."
                className="h-9 rounded-full border-border/50 bg-muted/50 pl-9 text-sm focus:bg-background"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onClick={() => navigate("/developers")}
              />
            </div>
            
            {isAuthenticated && !isDashboardRoute ? (
              <Button variant="hero" size="sm" className="rounded-full text-black" onClick={() => navigate("/dashboard") }>
                View My Profile
              </Button>
            ) : !isAuthenticated ? (
              <Button variant="hero" size="sm" className="rounded-full text-black" onClick={() => navigate("/signup") }>
                Sign in with GitHub
              </Button>
            ) : null}
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <NotificationBell enabled={isAuthenticated} />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-border bg-background shadow-xl md:hidden"
          >
            {/* Mobile Search */}
            <div className="border-b border-border p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search developers..."
                  className="h-10 w-full rounded-full bg-muted/50 pl-9"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/developers");
                  }}
                />
              </div>
            </div>

            <nav className="flex flex-col p-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.href)}
                  className="rounded-xl px-4 py-3 text-left text-body text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </button>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-border px-2 pt-4">
                {isAuthenticated && !isDashboardRoute ? (
                  <Button variant="hero" className="rounded-xl text-black" onClick={() => { setMobileMenuOpen(false); navigate("/dashboard"); }}>
                    View My Profile
                  </Button>
                ) : !isAuthenticated ? (
                  <Button variant="hero" className="rounded-xl text-black" onClick={() => { setMobileMenuOpen(false); navigate("/signup"); }}>
                    Sign in with GitHub
                  </Button>
                ) : null}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
