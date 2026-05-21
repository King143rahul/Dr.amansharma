import { motion } from 'framer-motion';
import { Users, Megaphone, Globe } from 'lucide-react';

const TEACHING = [
  'NEET', 'IIT-JEE', 'KCET', 'IB', 'IGCSE', 'ISC', 'ICSE', 'CBSE', 'NIOS'
];

export const TeachingSection = () => {
  return (
    <section id="teaching" className="py-32 bg-academic-surface relative z-10 border-b border-academic-border">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="editorial-subheading mb-6">Pedagogy</div>
            <h2 className="text-4xl md:text-5xl font-serif text-academic-accent mb-8 leading-tight">
              Teaching <span className="italic text-academic-brand">Expertise</span>
            </h2>
            <p className="text-academic-muted text-xl mb-10 leading-relaxed font-sans font-medium">
              With over 7 years of academic experience, Dr. Sharma teaches chemistry, environmental chemistry, and biochemistry while mentoring students across competitive and board curricula.
            </p>
            <div className="flex flex-wrap gap-2">
              {TEACHING.map((subject, idx) => (
                <motion.span
                  key={subject}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.5 }}
                  className="px-4 py-2 bg-academic-bg border border-academic-border text-academic-accent font-sans text-sm font-bold tracking-wider uppercase hover:bg-academic-brand hover:text-white hover:border-academic-brand transition-colors duration-500 cursor-default"
                >
                  {subject}
                </motion.span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            <div className="editorial-subheading mb-6">Service</div>
            <h2 className="text-4xl md:text-5xl font-serif text-academic-accent mb-8 leading-tight">
              Leadership & <span className="italic text-academic-brand">Outreach</span>
            </h2>
            
            <div className="space-y-4">
              {[
                { title: 'Conference Organization', desc: 'Organized academic conferences and scientific events.', icon: <Globe size={20} strokeWidth={1.5} /> },
                { title: 'Faculty Development', desc: 'Conducted FDPs and educator training workshops.', icon: <Users size={20} strokeWidth={1.5} /> },
                { title: 'Science Communication', desc: 'Active in bridging the gap between complex research and public understanding.', icon: <Megaphone size={20} strokeWidth={1.5} /> }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-6 p-6 border border-academic-border bg-white hover:bg-academic-bg transition-colors duration-500 group">
                  <div className="text-academic-muted group-hover:text-academic-brand transition-colors duration-500 mt-1 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-serif font-medium text-academic-accent text-lg mb-1">{item.title}</h4>
                    <p className="text-academic-muted text-base font-sans font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};
