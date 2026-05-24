import { motion } from 'framer-motion';
import { Activity, ArrowRight, Atom, Beaker, Droplets, Layers, Leaf, Microscope, Recycle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';

const DEFAULT_ICONS: Record<string, React.ReactNode> = {
  'Materials Chemistry': <Beaker size={24} strokeWidth={1.5} />,
  'Nanotechnology': <Atom size={24} strokeWidth={1.5} />,
  'Environmental Sustainability': <Leaf size={24} strokeWidth={1.5} />,
  'Water Treatment': <Droplets size={24} strokeWidth={1.5} />,
  'Membrane Technology': <Layers size={24} strokeWidth={1.5} />,
  'Waste-to-Wealth Approach': <Recycle size={24} strokeWidth={1.5} />,
  'Carbon Functional Materials': <Activity size={24} strokeWidth={1.5} />,
  'Wastewater Remediation': <Microscope size={24} strokeWidth={1.5} />,
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
    <section id="research" className="py-20 sm:py-24 lg:py-32 bg-academic-surface relative z-10 border-b border-academic-border">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-academic-border border border-academic-border bg-opacity-50">
          {loading ? (
             <div className="col-span-full py-12 text-center text-academic-muted">Loading research interests...</div>
          ) : interests.length > 0 ? interests.map((interest, idx) => (
            <motion.div
              key={interest.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="min-w-0 bg-white p-6 sm:p-8 md:p-10 flex flex-col items-center text-center group hover:bg-academic-surface transition-colors duration-500"
            >
              <div className="w-12 h-12 mb-6 text-academic-accent group-hover:text-academic-brand transition-colors duration-500 flex items-center justify-center">
                {interest.icon}
              </div>
              <h3
                className="max-w-full text-xl font-serif font-bold text-academic-accent leading-tight break-words"
                dangerouslySetInnerHTML={{ __html: interest.name }}
              />
            </motion.div>
          )) : (
            <div className="col-span-full py-12 text-center text-academic-muted">No research interests found. Add them in the Admin Panel.</div>
          )}
        </div>
      </div>
    </section>
  );
};
