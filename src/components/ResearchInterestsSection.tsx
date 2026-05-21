import { motion } from 'framer-motion';
import { Activity, ArrowRight, Atom, Beaker, Droplets, Layers, Leaf, Microscope, Recycle } from 'lucide-react';

const INTERESTS = [
  { name: 'Materials Chemistry', icon: <Beaker size={24} strokeWidth={1.5} /> },
  { name: 'Nanotechnology', icon: <Atom size={24} strokeWidth={1.5} /> },
  { name: 'Environmental Sustainability', icon: <Leaf size={24} strokeWidth={1.5} /> },
  { name: 'Water Treatment', icon: <Droplets size={24} strokeWidth={1.5} /> },
  { name: 'Membrane Technology', icon: <Layers size={24} strokeWidth={1.5} /> },
  { name: 'Waste-to-Wealth Approach', icon: <Recycle size={24} strokeWidth={1.5} /> },
  { name: 'Carbon Functional Materials', icon: <Activity size={24} strokeWidth={1.5} /> },
  { name: 'Wastewater Remediation', icon: <Microscope size={24} strokeWidth={1.5} /> },
];

export const ResearchInterestsSection = () => {
  return (
    <section id="research" className="py-32 bg-academic-surface relative z-10 border-b border-academic-border">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="editorial-subheading flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-academic-brand"></span>
            Fields of Study
            <span className="w-8 h-px bg-academic-brand"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-academic-accent mt-6 mb-6 leading-tight">
            Research <span className="italic text-academic-brand">Interests</span>
          </h2>
          <p className="text-academic-muted max-w-2xl mx-auto text-lg font-sans font-medium">
            Exploring the intersection of chemistry, nanotechnology, and sustainability to create impactful environmental solutions.
          </p>
          <button
            onClick={() => document.querySelector('#publications')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-10 inline-flex items-center justify-center gap-3 px-8 py-4 bg-academic-accent text-white font-sans text-base font-bold tracking-wider uppercase hover:bg-academic-brand transition-colors duration-500 group"
          >
            View Work
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-500" />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-academic-border border border-academic-border bg-opacity-50">
          {INTERESTS.map((interest, idx) => (
            <motion.div
              key={interest.name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="min-w-0 bg-white p-8 md:p-10 flex flex-col items-center text-center group hover:bg-academic-surface transition-colors duration-500"
            >
              <div className="w-12 h-12 mb-6 text-academic-accent group-hover:text-academic-brand transition-colors duration-500 flex items-center justify-center">
                {interest.icon}
              </div>
              <h3 className="max-w-full text-xl font-serif font-bold text-academic-accent leading-tight break-words">{interest.name}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
