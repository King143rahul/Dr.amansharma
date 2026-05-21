import { motion } from 'framer-motion';
import { ArrowRight, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import amanSharmaPhoto from '../assets/aman sharma photo.png';

const CHEMISTRY_POINTS = [
  { label: 'C', className: 'left-[8%] top-[18%]' },
  { label: 'N', className: 'left-[21%] top-[42%]' },
  { label: 'O', className: 'left-[12%] bottom-[20%]' },
  { label: 'H', className: 'right-[14%] top-[22%]' },
  { label: 'Fe', className: 'right-[26%] top-[48%]' },
  { label: 'OH', className: 'right-[10%] bottom-[24%]' },
];

export const HeroSection = () => {
  const navigate = useNavigate();

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

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-12 overflow-hidden bg-academic-bg text-academic-text border-b border-academic-border">
      <div className="chemistry-grid absolute inset-0 z-0 opacity-70" />
      <div className="absolute inset-x-0 top-0 z-0 h-28 border-b border-academic-border bg-white/80" />
      <div className="pointer-events-none absolute inset-0 z-0">
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
      
      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative z-10 grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col items-start text-left">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="editorial-subheading mb-8 flex items-center gap-3"
        >
          <span className="w-8 h-px bg-academic-brand"></span>
          Sustainability Innovator & Researcher
        </motion.div>

        <motion.h1 
          className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-academic-accent leading-none mb-8"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          Dr. Aman <br />
          <span className="text-academic-brand italic pr-4">Sharma</span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-academic-muted font-semibold mb-8 max-w-2xl font-sans"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.4 }}
        >
          Assistant Professor of Chemistry in Bengaluru (Bangalore) | Materials Chemist | Founder, AMSH Endeavours
        </motion.p>

        <motion.p
          className="text-lg md:text-xl text-academic-text max-w-3xl mb-14 leading-relaxed font-serif font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        >
          Transforming bio-waste into advanced functional materials for sustainable water treatment and environmental remediation at the intersection of nanotechnology and green chemistry.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
        >
          <button onClick={() => goToSection('#research', '/research')} className="w-full sm:w-auto px-8 py-4 bg-academic-accent text-white font-sans text-base font-bold tracking-wider uppercase hover:bg-academic-brand transition-colors duration-500 flex items-center justify-center gap-3 group">
            Explore Research
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
          <button onClick={() => goToSection('#publications', '/research')} className="w-full sm:w-auto px-8 py-4 border border-academic-border text-academic-accent font-sans text-base font-bold tracking-wider uppercase hover:border-academic-accent transition-colors duration-500 flex items-center justify-center gap-3">
            <FileText size={16} />
            View Work
          </button>
          <button onClick={() => goToSection('#contact', '/contact')} className="w-full sm:w-auto px-8 py-4 text-academic-muted font-sans text-base font-bold tracking-wider uppercase hover:text-academic-brand transition-colors duration-500 flex items-center justify-center gap-3">
            <Users size={16} />
            Collaborate
          </button>
        </motion.div>
        </div>

        <motion.div
          className="relative flex w-full items-center justify-center"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          <div className="absolute h-[22rem] w-[22rem] rounded-full border border-academic-brand/25 md:h-[30rem] md:w-[30rem]" />
          <div className="absolute h-[18rem] w-[18rem] rounded-full border border-academic-accent/10 md:h-[25rem] md:w-[25rem]" />
          <div className="relative h-72 w-72 overflow-hidden rounded-full border-4 border-white bg-white shadow-2xl ring-1 ring-academic-border md:h-[26rem] md:w-[26rem]">
            <img
              src={amanSharmaPhoto}
              alt="Dr. Aman Sharma"
              className="h-full w-full object-cover object-[50%_18%]"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
