
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MoonIcon, SunIcon, MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "../ui-custom/GlassCard";
import { AnimatedButton } from "../ui-custom/AnimatedButton";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Loan Application", path: "/loan-application" },
  { label: "Loan Status", path: "/loan-status" },
  { label: "Profile", path: "/profile" },
];

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 transition-all duration-300",
        scrolled ? "backdrop-blur-md bg-white/70 shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-opacity duration-300 hover:opacity-80"
          >
            <div className="w-8 h-8 bg-primary rounded-md grid place-items-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-semibold text-xl">Credable</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === item.path 
                    ? "text-primary-foreground bg-primary" 
                    : "text-foreground/70 hover:text-foreground hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden animate-slide-down">
          <GlassCard className="mt-4 mx-4 p-4">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                    location.pathname === item.path
                      ? "text-primary-foreground bg-primary"
                      : "text-foreground/70 hover:text-foreground hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </GlassCard>
        </div>
      )}
    </header>
  );
};

export default Header;
