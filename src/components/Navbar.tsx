import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Atom } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import NavHeader from './ui/nav-header';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Research', href: '/research' },
  { name: 'Startup', href: '/startup' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Contact', href: '/contact' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keep route transitions anchored at the top of each page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg border-b border-academic-border/70 py-3 shadow-md' : 'bg-transparent py-6'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Scroll Progress Bar */}
      <div 
        className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-academic-brand via-emerald-500 to-teal-400 transition-all duration-100 ease-out z-50" 
        style={{ width: `${scrollProgress}%` }}
      />
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
        <Link 
          to="/"
          className="min-w-0 text-xl font-serif font-bold text-academic-accent cursor-pointer flex items-center gap-2 group/logo"
        >
          <div className="text-academic-brand group-hover/logo:rotate-360 transition-transform duration-1000 ease-in-out">
            <Atom size={24} className="animate-[spin_12s_linear_infinite]" strokeWidth={1.8} />
          </div>
          <span className="truncate tracking-tight text-lg sm:text-xl">Dr. Aman Sharma</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <NavHeader items={NAV_LINKS} />
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          type="button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          className="-m-2 flex min-h-11 min-w-11 items-center justify-center p-2 text-academic-accent transition-colors duration-500 hover:text-academic-brand md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? (
            <X className="pointer-events-none" size={24} strokeWidth={1.5} />
          ) : (
            <Menu className="pointer-events-none" size={24} strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-academic-bg border-t border-academic-border mt-4 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-6 space-y-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-left text-base font-sans font-bold uppercase tracking-wider transition-colors duration-500 ${
                    location.pathname === link.href ? 'text-academic-brand' : 'text-academic-muted hover:text-academic-brand'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
