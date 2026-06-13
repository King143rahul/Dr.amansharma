import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Atom } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import NavHeader from './ui/nav-header';
import { db } from '../lib/supabase';

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Research', href: '/research' },
  { name: 'Startup', href: '/startup' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Team', href: '/team' },
  { name: 'Contact', href: '/contact' },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [name, setName] = useState("Dr Aman Sharma, MRSC");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (progressBarRef.current && totalScroll > 0) {
        const progress = (window.scrollY / totalScroll) * 100;
        progressBarRef.current.style.width = `${progress}%`;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const { data, error } = await db
          .from('general_settings')
          .select('name')
          .eq('id', 'settings')
          .single();
        if (!error && data && data.name) {
          setName(data.name);
        }
      } catch (err) {
        console.error("Error fetching name for navbar:", err);
      }
    };

    fetchName();

    const channel = db
      .channel('navbar_name_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'general_settings', filter: 'id=eq.settings' },
        (payload) => {
          const data = payload.new as any;
          if (data && data.name) {
            setName(data.name);
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
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
        ref={progressBarRef}
        className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-academic-brand via-emerald-500 to-teal-400 transition-all duration-100 ease-out z-50" 
        style={{ width: '0%' }}
      />
      <div className="max-w-7xl mx-auto px-2.5 sm:px-3 lg:px-4 flex items-center justify-between gap-3">
        <Link 
          to="/"
          className="min-w-0 flex-shrink flex items-center gap-2 group/logo text-xl font-serif font-bold text-academic-accent cursor-pointer"
        >
          <div className="shrink-0 text-academic-brand">
            <Atom size={24} className="animate-[spin_12s_linear_infinite]" strokeWidth={1.8} />
          </div>
          <span className="truncate tracking-tight text-base sm:text-xl">
            {name.replace(/\bsharma\b/gi, 'Sharma').replace(/\bMSRC\b/g, 'MRSC').replace(/\s+,/g, ',').replace(/\s{2,}/g, ' ').replace(/\s*,?\s*MRSC\b/gi, '').trim()}
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:block shrink-0 ml-4">
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
