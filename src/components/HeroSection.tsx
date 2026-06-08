import { motion } from 'framer-motion';
import { ArrowRight, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import amanSharmaPhoto from '../assets/aman sharma photo.webp';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { sanitizeHtml } from '../lib/sanitizeHtml';

const CHEMISTRY_POINTS = [
  { label: 'C', className: 'left-[8%] top-[18%]' },
  { label: 'O', className: 'left-[12%] bottom-[20%]' },
  { label: 'H', className: 'right-[14%] top-[22%]' },
  { label: 'Fe', className: 'right-[26%] top-[48%]' },
  { label: 'OH', className: 'right-[10%] bottom-[24%]' },
];

export const HeroSection = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    name: "Dr Aman Sharma, MRSC",
    heroSubtitle: "Sustainability Innovator & Researcher",
    heroRoles: "Assistant Professor of Chemistry in Bengaluru (Bangalore) | Materials Chemist | Founder, AMSH Endeavours",
    heroDesc: "Transforming bio-waste into advanced functional materials for sustainable water treatment and environmental remediation at the intersection of nanotechnology and green chemistry.",
    heroNameStyle: "classic",
    profilePicUrl: ""
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await db
        .from('general_settings')
        .select('*')
        .eq('id', 'settings')
        .single();
      
      if (!error && data) {
        setSettings({
          name: data.name || "Dr Aman Sharma, MRSC",
          heroSubtitle: data.heroSubtitle || settings.heroSubtitle,
          heroRoles: data.heroRoles || settings.heroRoles,
          heroDesc: data.heroDesc || settings.heroDesc,
          heroNameStyle: data.heroNameStyle || "classic",
          profilePicUrl: data.profilePicUrl || ""
        });
      }
    };

    fetchSettings();

    // Subscribe to real-time changes
    const channel = db
      .channel('general_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'general_settings', filter: 'id=eq.settings' },
        (payload) => {
          const data = payload.new as any;
          if (data) {
            setSettings({
              name: data.name || "Dr Aman Sharma, MRSC",
              heroSubtitle: data.heroSubtitle || settings.heroSubtitle,
              heroRoles: data.heroRoles || settings.heroRoles,
              heroDesc: data.heroDesc || settings.heroDesc,
              heroNameStyle: data.heroNameStyle || "classic",
              profilePicUrl: data.profilePicUrl || ""
            });
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const goToSection = (sectionId: string, route = '/') => {
    const section = document.querySelector(sectionId);

    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    navigate(route);
    window.setTimeout(() => {
      document.querySelector(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const nameVal = (settings.name || "Dr Aman Sharma, MRSC")
    .replace(/\bsharma\b/gi, 'Sharma')
    .replace(/\bMSRC\b/g, 'MRSC')
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const commaIndex = nameVal.indexOf(',');
  const mainName = commaIndex === -1 ? nameVal : nameVal.slice(0, commaIndex).trim();
  const nameSuffix = commaIndex === -1 ? '' : nameVal.slice(commaIndex + 1).trim();
  
  const nameParts = mainName.split(' ');
  const lastName = nameParts.pop();
  const restName = nameParts.join(' ');

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 sm:pt-24 sm:pb-16 lg:pt-24 overflow-hidden bg-academic-bg text-academic-text border-b border-academic-border">
      <div className="chemistry-grid absolute inset-0 z-0 opacity-70" />
      <div className="absolute inset-x-0 top-0 z-0 h-16 border-b border-academic-border bg-white/80 sm:h-20 lg:h-24" />
      <div className="pointer-events-none absolute inset-0 z-0 hidden sm:block">
        <div className="absolute left-[7%] top-[20%] h-48 w-48 rotate-12 border border-academic-brand/20" />
        <div className="absolute bottom-[14%] right-[9%] h-56 w-56 -rotate-12 border border-academic-accent/15" />
        <div className="absolute left-[13%] top-[28%] h-px w-40 rotate-[31deg] bg-academic-brand/25" />
        <div className="absolute left-[16%] bottom-[28%] h-px w-52 -rotate-[28deg] bg-academic-brand/25" />
        <div className="absolute right-[13%] top-[33%] h-px w-48 -rotate-[33deg] bg-academic-brand/25" />
        <div className="absolute right-[15%] bottom-[31%] h-px w-44 rotate-[27deg] bg-academic-brand/25" />
        {CHEMISTRY_POINTS.map((point) => (
          <div
            key={point.label}
            className={`absolute flex h-12 w-12 items-center justify-center rounded-full border border-academic-brand/40 bg-white text-sm font-bold text-academic-brand shadow-sm ${point.className}`}
          >
            {point.label}
          </div>
        ))}
      </div>
      
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 relative z-10 grid w-full items-center gap-8 sm:gap-10 lg:gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="editorial-subheading mb-4 flex items-center justify-center gap-3 sm:mb-7 lg:justify-start"
        >
          <span className="w-8 h-px bg-academic-brand"></span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.heroSubtitle) }} />
          <span className="w-8 h-px bg-academic-brand"></span>
        </motion.div>

        <motion.h1 
          className="font-serif font-bold max-w-full text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-academic-accent leading-[1.1] mb-5 sm:mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <span>
            {restName}{' '}
            <span className="text-academic-brand italic">{lastName}</span>
          </span>
          {nameSuffix && (
            <span className="whitespace-nowrap text-[0.5em] align-baseline font-sans not-italic text-academic-muted">
              , {nameSuffix}
            </span>
          )}
        </motion.h1>

        <motion.p 
          className="text-lg sm:text-xl md:text-2xl text-academic-muted font-semibold mb-5 sm:mb-8 max-w-2xl font-sans leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
        >
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.heroRoles) }} />
        </motion.p>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-academic-text max-w-3xl mb-7 sm:mb-12 leading-relaxed font-serif font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        >
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.heroDesc) }} />
        </motion.p>

        <motion.div 
          className="flex w-full flex-col sm:flex-row items-stretch justify-center gap-3 sm:items-center sm:gap-4 lg:justify-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        >
          <button onClick={() => goToSection('#research', '/research')} className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-academic-accent text-white font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:bg-academic-brand transition-colors duration-500 flex items-center justify-center gap-3 group">
            Explore Research
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
          <button onClick={() => goToSection('#publications', '/research')} className="w-full sm:w-auto px-6 sm:px-8 py-4 border border-academic-border text-academic-accent font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:border-academic-accent transition-colors duration-500 flex items-center justify-center gap-3">
            <FileText size={16} />
            View Work
          </button>
          <button onClick={() => goToSection('#contact', '/contact')} className="w-full sm:w-auto px-6 sm:px-8 py-4 border border-transparent text-academic-muted font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:text-academic-brand transition-colors duration-500 flex items-center justify-center gap-3 max-sm:border-academic-border max-sm:bg-white/70">
            <Users size={16} />
            Collaborate
          </button>
        </motion.div>
        </div>

        <motion.div
          className="order-1 relative flex w-full items-center justify-center lg:order-2"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          <div className="absolute h-56 w-56 rounded-full border border-academic-brand/25 min-[420px]:h-64 min-[420px]:w-64 sm:h-[22rem] sm:w-[22rem] md:h-[30rem] md:w-[30rem]" />
          <div className="absolute h-48 w-48 rounded-full border border-academic-accent/10 min-[420px]:h-56 min-[420px]:w-56 sm:h-[18rem] sm:w-[18rem] md:h-[25rem] md:w-[25rem]" />
          <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-white bg-white shadow-2xl ring-1 ring-academic-border min-[420px]:h-56 min-[420px]:w-56 sm:h-72 sm:w-72 md:h-[26rem] md:w-[26rem]">
            <img
              src={settings.profilePicUrl || amanSharmaPhoto}
              alt="Dr. Aman Sharma"
              className="h-full w-full object-cover object-[50%_18%]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
