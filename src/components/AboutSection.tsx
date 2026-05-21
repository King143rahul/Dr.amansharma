import { motion } from 'framer-motion';
import { Award, BookOpen, FlaskConical, Users, Zap } from 'lucide-react';

const STATS = [
  { icon: <Zap size={20} strokeWidth={1.5} />, value: '7+', label: 'Years Experience' },
  { icon: <Award size={20} strokeWidth={1.5} />, value: 'Multiple', label: 'Patents' },
  { icon: <BookOpen size={20} strokeWidth={1.5} />, value: '15+', label: 'Publications' },
  { icon: <FlaskConical size={20} strokeWidth={1.5} />, value: '2', label: 'Govt Grants' },
  { icon: <Users size={20} strokeWidth={1.5} />, value: '10+', label: 'Conferences' },
];

export const AboutSection = () => {
  return (
    <section id="about" className="py-32 bg-academic-surface border-b border-academic-border relative z-10">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start"
        >
          {/* Bio Text */}
          <div className="lg:col-span-7">
            <div className="editorial-subheading">About the Researcher</div>
            <h2 className="text-4xl md:text-5xl font-serif text-academic-accent mb-10 leading-tight">
              Pioneering the intersection of <span className="italic text-academic-brand">nanotechnology</span> and green chemistry.
            </h2>
            <div className="space-y-6 text-academic-muted text-lg leading-relaxed font-sans font-medium">
              <p>
                Dr. Aman Sharma is a materials chemist and educator dedicated to environmental sustainability. Serving as an Assistant Professor of Chemistry at the School of Science & Humanities, S-VYASA University Bengaluru, his research focuses on transforming bio-waste into advanced functional materials for water treatment and environmental remediation.
              </p>
              <p>
                Operating at the intersection of nanotechnology and green chemistry, Dr. Sharma develops scalable, cost-effective wastewater solutions. He is the founder of <strong className="text-academic-accent font-medium">AMSH Endeavours</strong>, a government grant-supported start-up designed to bridge the gap between academic research and real-world environmental applications. His work has resulted in multiple patents and high-impact publications focused on a "waste-to-wealth" approach.
              </p>
              <p>
                With over seven years of academic experience, Dr. Sharma is an active member of the Royal Society of Chemistry (RSC). He contributes to the broader scientific community by organizing conferences, securing government research grants, and conducting training outreach for fellow educators.
              </p>
              <p>
                Outside the laboratory and the lecture hall, Dr. Sharma values multidisciplinary collaboration and impactful science communication. He unwinds through cooking, badminton, and Netflix, maintaining a balanced approach to a rigorous academic career.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-academic-border border border-academic-border bg-opacity-50">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + (idx * 0.1) }}
                className={`bg-white p-8 flex flex-col items-center text-center hover:bg-academic-surface transition-colors duration-500 ${
                  idx === STATS.length - 1 ? 'col-span-2' : ''
                }`}
              >
                <div className="text-academic-brand mb-5">
                  {stat.icon}
                </div>
                <div className="text-4xl font-serif text-academic-accent mb-2 tracking-tight">{stat.value}</div>
                <div className="text-xs text-academic-muted uppercase tracking-widest font-sans font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
