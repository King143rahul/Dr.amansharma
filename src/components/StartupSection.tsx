import { motion } from 'framer-motion';
import { Leaf, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const StartupSection = () => {
  return (
    <section id="startup" className="py-32 bg-academic-bg relative z-10 border-b border-academic-border">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="border border-academic-border bg-white relative">
          <div className="p-10 md:p-16 lg:p-20 flex flex-col lg:flex-row gap-16 items-center">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="editorial-subheading flex items-center gap-2 mb-6">
                <Leaf size={14} /> Founder
              </div>
              <h2 className="text-4xl md:text-6xl font-serif font-semibold mb-6 text-academic-accent tracking-tight">
                AMSH <span className="italic text-academic-brand">Endeavours</span>
              </h2>
              <p className="text-academic-muted text-xl mb-10 leading-relaxed font-sans font-medium">
                A government grant-supported startup dedicated to developing eco-friendly and cost-efficient wastewater treatment solutions. We bridge the gap between academic research and real-world environmental impact.
              </p>
              
              <ul className="space-y-4 mb-10">
                {[
                  'Sustainable Wastewater Treatment',
                  'Eco-friendly Technologies',
                  'Cost-effective Environmental Solutions',
                  'Government Grant-Supported'
                ].map((item, idx) => (
                  <motion.li 
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + idx * 0.1, duration: 0.8 }}
                    className="flex items-start gap-4 text-academic-accent font-sans text-base font-bold tracking-wide uppercase"
                  >
                    <CheckCircle2 className="text-academic-brand mt-0.5" size={16} strokeWidth={1.5} />
                    {item}
                  </motion.li>
                ))}
              </ul>

              <button className="px-8 py-4 bg-academic-brand text-white font-sans text-base font-bold tracking-wider uppercase hover:bg-emerald-800 transition-colors duration-500 flex items-center gap-3 group">
                Visit Startup Website
                <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
              </button>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 w-full relative flex justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
            >
              {/* Abstract Startup Visual - Editorial style */}
              <div className="aspect-square w-full max-w-sm mx-auto relative border border-academic-border p-8 bg-academic-surface flex flex-col items-center justify-center">
                <div className="absolute inset-0 bg-academic-brand opacity-5 mix-blend-multiply" />
                
                <div className="w-20 h-20 border border-academic-brand rounded-full flex items-center justify-center text-academic-brand mb-8 relative z-10">
                  <Leaf size={32} strokeWidth={1} />
                </div>
                <h3 className="text-3xl font-serif text-academic-accent mb-2 relative z-10">AMSH</h3>
                <p className="text-academic-muted font-sans font-bold tracking-wider uppercase text-sm relative z-10">Endeavours</p>
                
                <div className="mt-12 w-full space-y-4 relative z-10">
                  <div className="h-px bg-academic-border w-full relative">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-academic-accent" 
                      initial={{ width: 0 }}
                      whileInView={{ width: '80%' }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                    />
                  </div>
                  <div className="h-px bg-academic-border w-full relative">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-academic-brand" 
                      initial={{ width: 0 }}
                      whileInView={{ width: '65%' }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
