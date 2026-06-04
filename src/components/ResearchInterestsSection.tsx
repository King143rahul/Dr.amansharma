import { motion } from 'framer-motion';
import { Activity, ArrowRight, Atom, Beaker, Droplets, Layers, Leaf, Microscope, Recycle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { sanitizeHtml } from '../lib/sanitizeHtml';

const DEFAULT_ICONS: Record<string, React.ReactNode> = {
  'Materials Chemistry': <Beaker size={24} strokeWidth={1.5} />,
  'Nanotechnology': <Atom size={24} strokeWidth={1.5} />,
  'Environmental Sustainability': <Leaf size={24} strokeWidth={1.5} />,
  'Sustainability': <Leaf size={24} strokeWidth={1.5} />,
  'Water Treatment': <Droplets size={24} strokeWidth={1.5} />,
  'Membrane Technology': <Layers size={24} strokeWidth={1.5} />,
  'Waste-to-Wealth Approach': <Recycle size={24} strokeWidth={1.5} />,
  'Carbon Functional Materials': <Activity size={24} strokeWidth={1.5} />,
  'Wastewater Remediation': <Microscope size={24} strokeWidth={1.5} />,
  'Hydrogen': <Atom size={24} strokeWidth={1.5} />,
};

export const ResearchInterestsSection = () => {
  const [interests, setInterests] = useState<{ id: string; name: string; icon: React.ReactNode }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const { data, error } = await db
          .from('research_interests')
          .select('*');
        
        if (!error && data) {
          const mappedData = data.map((item: any) => ({
            id: item.id,
            name: item.text || '',
            icon: DEFAULT_ICONS[item.text] || <Atom size={24} strokeWidth={1.5} />
          }));
          setInterests(mappedData);
        }
      } catch (err) {
        console.error("Error fetching research interests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInterests();

    // Subscribe to real-time changes
    const channel = db
      .channel('research_interests_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'research_interests' },
        () => {
          fetchInterests();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  return (
    <section id="research" className="py-10 sm:py-14 lg:py-16 bg-academic-surface relative z-10 border-b border-academic-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="editorial-subheading flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-academic-brand"></span>
            Fields of Study
            <span className="w-8 h-px bg-academic-brand"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-academic-accent mt-6 mb-6 leading-tight">
            Research <span className="italic text-academic-brand">Interests</span>
          </h2>
          <p className="text-academic-muted max-w-2xl mx-auto text-base sm:text-lg font-sans font-medium">
            Exploring the intersection of chemistry, nanotechnology, and sustainability to create impactful environmental solutions.
          </p>
          <button
            onClick={() => document.querySelector('#publications')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 sm:mt-10 inline-flex w-full sm:w-auto items-center justify-center gap-3 px-6 sm:px-8 py-4 bg-academic-accent text-white font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:bg-academic-brand transition-colors duration-500 group"
          >
            View Work
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
        </motion.div>

        <div className="marquee-container">
          {loading ? (
             <div className="w-full py-12 text-center text-academic-muted">Loading research interests...</div>
          ) : interests.length > 0 ? (
            <div className="marquee-content">
              {/* First copy of interests */}
              {interests.map((interest, idx) => (
                <div
                  key={`copy1-${interest.id}-${idx}`}
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white p-4 sm:p-6 flex flex-col items-center justify-center text-center group border border-academic-border hover:border-academic-brand hover:shadow-xl transition-all duration-500 flex-shrink-0"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-academic-accent group-hover:text-academic-brand transition-colors duration-500 flex items-center justify-center">
                    {interest.icon}
                  </div>
                  <h3
                    className="text-xs sm:text-sm font-serif font-bold text-academic-accent leading-tight break-words group-hover:text-academic-brand transition-colors duration-500"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(interest.name) }}
                  />
                </div>
              ))}
              {/* Second copy for seamless looping */}
              {interests.map((interest, idx) => (
                <div
                  key={`copy2-${interest.id}-${idx}`}
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-white p-4 sm:p-6 flex flex-col items-center justify-center text-center group border border-academic-border hover:border-academic-brand hover:shadow-xl transition-all duration-500 flex-shrink-0"
                >
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3 text-academic-accent group-hover:text-academic-brand transition-colors duration-500 flex items-center justify-center">
                    {interest.icon}
                  </div>
                  <h3
                    className="text-xs sm:text-sm font-serif font-bold text-academic-accent leading-tight break-words group-hover:text-academic-brand transition-colors duration-500"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(interest.name) }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full py-12 text-center text-academic-muted">No research interests found. Add them in the Admin Panel.</div>
          )}
        </div>
      </div>
    </section>
  );
};
