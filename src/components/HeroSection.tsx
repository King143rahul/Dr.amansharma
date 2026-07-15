import { motion } from 'framer-motion';
import { ArrowRight, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import amanSharmaPhoto from '../assets/aman sharma photo.webp';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { sanitizeHtml } from '../lib/sanitizeHtml';

const cleanStatValue = (val: string) => {
  if (!val) return "";
  return val
    .replace(/years/gi, "")
    .replace(/experience/gi, "")
    .replace(/filed/gi, "")
    .replace(/patents?/gi, "")
    .replace(/publications?/gi, "")
    .replace(/startup/gi, "")
    .replace(/govt/gi, "")
    .replace(/grants?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

const getValueFontSize = (val: string) => {
  const len = val.length;
  if (len <= 3) return "text-xl sm:text-2xl lg:text-3xl";
  if (len <= 6) return "text-base sm:text-lg lg:text-xl px-1";
  if (len <= 10) return "text-sm sm:text-base lg:text-lg px-2";
  return "text-[10px] sm:text-xs lg:text-sm px-2 text-center leading-tight";
};

export const HeroSection = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    name: "Dr Aman Sharma, MRSC",
    heroSubtitle: "Sustainability Innovator & Researcher",
    heroRoles: "Assistant Professor of Chemistry in Bengaluru (Bangalore) | Materials Chemist | Founder, AMSH Endeavours",
    heroDesc: "Transforming bio-waste into advanced functional materials for sustainable water treatment and environmental remediation at the intersection of nanotechnology and green chemistry.",
    heroNameStyle: "classic",
    profilePicUrl: "",
    experienceValue: "4+",
    patentsValue: "4+",
    publicationsValue: "20+",
    grantsValue: "1"
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
          profilePicUrl: data.profilePicUrl || "",
          experienceValue: data.experienceValue || "4+",
          patentsValue: data.patentsValue || "4+",
          publicationsValue: data.publicationsValue || "20+",
          grantsValue: data.grantsValue || "1"
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
              profilePicUrl: data.profilePicUrl || "",
              experienceValue: data.experienceValue || "4+",
              patentsValue: data.patentsValue || "4+",
              publicationsValue: data.publicationsValue || "20+",
              grantsValue: data.grantsValue || "1"
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

  const renderStatsCircles = () => (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full max-w-[16rem] sm:max-w-xs mt-2 relative z-10">
      {[
        { value: settings.experienceValue, label: "Years\nExperience" },
        { value: settings.patentsValue, label: "Filed\nPatents" },
        { value: settings.publicationsValue, label: "Publications" },
        { value: settings.grantsValue, label: "Startup\nGovt Grant" }
      ].map((stat, i) => {
        const cleanedValue = cleanStatValue(stat.value);
        return (
          <div key={i} className="flex flex-col items-center justify-center w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto rounded-full border border-academic-brand/20 bg-white/60 backdrop-blur-md shadow-lg hover:shadow-xl hover:border-academic-brand/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
            <span className={`${getValueFontSize(cleanedValue)} font-bold text-academic-accent mb-0.5 sm:mb-1`}>{cleanedValue}</span>
            <span className="text-[9px] sm:text-[10px] lg:text-xs text-center leading-tight px-2 text-academic-muted whitespace-pre-line font-semibold uppercase tracking-wider">{stat.label}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="relative min-h-[70vh] lg:min-h-[75vh] flex items-center justify-center pt-16 pb-8 sm:pt-20 sm:pb-12 lg:pt-24 lg:pb-16 overflow-hidden bg-academic-bg text-academic-text border-b border-academic-border">
      <div className="chemistry-grid absolute inset-0 z-0 opacity-70" />
      <div className="absolute inset-x-0 top-0 z-0 h-16 border-b border-academic-border bg-white/80 sm:h-20 lg:h-24" />
      
      <div className="max-w-7xl mx-auto px-2.5 sm:px-3 lg:px-4 relative z-10 grid w-full items-center gap-8 sm:gap-10 lg:gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="editorial-subheading mb-2 flex items-center justify-center gap-3 sm:mb-4 lg:justify-start"
        >
          <span className="w-8 h-px bg-academic-brand"></span>
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(settings.heroSubtitle.replace(/Academician & Researcher/i, 'Researcher & Academician')) }} />
          <span className="w-8 h-px bg-academic-brand"></span>
        </motion.div>

        <motion.h1 
          className="font-serif font-bold max-w-full text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-academic-accent leading-[1.1] mb-4 sm:mb-6"
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

          <button onClick={() => goToSection('#contact', '/contact')} className="w-full sm:w-auto px-6 sm:px-8 py-4 border border-transparent text-academic-muted font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:text-academic-brand transition-colors duration-500 flex items-center justify-center gap-3 max-sm:border-academic-border max-sm:bg-white/70">
            <Users size={16} />
            Collaborate
          </button>
        </motion.div>

        {/* Stats circles on Mobile */}
        <div className="lg:hidden mt-10 flex justify-center w-full">
          {renderStatsCircles()}
        </div>
        </div>

        <motion.div
          className="order-1 flex w-full flex-col items-center justify-center lg:order-2"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          <div className="relative flex w-full items-center justify-center mb-4 lg:mb-12 mt-4 lg:mt-0">
            <div className="absolute h-56 w-56 rounded-full border border-academic-brand/25 min-[420px]:h-64 min-[420px]:w-64 sm:h-[20rem] sm:w-[20rem] md:h-96 md:w-96" />
            <div className="absolute h-48 w-48 rounded-full border border-academic-accent/10 min-[420px]:h-56 min-[420px]:w-56 sm:h-[16rem] sm:w-[16rem] md:h-72 md:w-72" />
            <div className="relative h-48 w-48 overflow-hidden rounded-full border-4 border-white bg-white shadow-2xl ring-1 ring-academic-border min-[420px]:h-56 min-[420px]:w-56 sm:h-64 sm:w-64 md:h-64 md:w-64 lg:h-80 lg:w-80">
              <img
                src={settings.profilePicUrl || amanSharmaPhoto}
                alt="Dr. Aman Sharma"
                className="h-full w-full object-cover object-[50%_18%]"
              />
            </div>
          </div>

          {/* Stats circles on Desktop */}
          <div className="hidden lg:flex justify-center w-full mt-2">
            {renderStatsCircles()}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
