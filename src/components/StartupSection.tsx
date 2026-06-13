import { motion } from 'framer-motion';
import { Leaf, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { sanitizeHtml } from '../lib/sanitizeHtml';

export const StartupSection = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const { data: resData, error } = await db
          .from('startup')
          .select('*')
          .eq('id', 'section')
          .single();
        
        if (!error && resData) {
          setData(resData);
        }
      } catch (err) {
        console.error("Error fetching startup:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();

    // Subscribe to real-time changes
    const channel = db
      .channel('startup_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'startup', filter: 'id=eq.section' },
        (payload) => {
          const newData = payload.new as any;
          if (newData) {
            setData(newData);
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const title = data?.title || "AMSH Endeavours";
  const description = data?.description || "A government grant-supported startup dedicated to developing eco-friendly and cost-efficient wastewater treatment solutions.";
  const links = data?.externalLinks || [];
  const plainTitle = title.replace(/<[^>]*>/g, "");

  return (
    <section id="startup" className="py-8 sm:py-10 lg:py-12 bg-academic-bg relative z-10 border-b border-academic-border">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-3 lg:px-4">
        <div className="border border-academic-border bg-white relative">
          <div className="p-5 sm:p-10 md:p-16 lg:p-20 flex flex-col lg:flex-row gap-10 sm:gap-14 lg:gap-16 items-center">
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
              <h2
                className="text-3xl sm:text-4xl md:text-6xl font-serif font-semibold mb-6 text-academic-accent tracking-tight break-words"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(title) }}
              />
              {loading ? (
                <div className="animate-pulse space-y-4 mb-10">
                  <div className="h-4 bg-academic-border rounded w-full"></div>
                  <div className="h-4 bg-academic-border rounded w-5/6"></div>
                  <div className="h-4 bg-academic-border rounded w-4/6"></div>
                </div>
              ) : (
                <p
                  className="text-academic-muted text-base sm:text-xl mb-8 sm:mb-10 leading-relaxed font-sans font-medium whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
                />
              )}
              
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
                    className="flex items-start gap-3 sm:gap-4 text-academic-accent font-sans text-sm sm:text-base font-bold tracking-wide uppercase"
                  >
                    <CheckCircle2 className="text-academic-brand mt-0.5" size={16} strokeWidth={1.5} />
                    {item}
                  </motion.li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
                {links.map((link: any, idx: number) => (
                  <a 
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 sm:px-8 py-4 bg-academic-brand text-white font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:bg-emerald-800 transition-colors duration-500 flex items-center justify-center gap-3 group"
                  >
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(link.label) }} />
                    <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-500" />
                  </a>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="lg:w-1/2 w-full relative flex justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.3 }}
            >
              {data?.photoUrl ? (
                <div className="aspect-square w-full max-w-sm mx-auto relative border border-academic-border overflow-hidden bg-academic-surface shadow-md">
                  <img src={data.photoUrl} alt={plainTitle} className="w-full h-full object-cover" />
                </div>
              ) : (
                /* Abstract Startup Visual - Editorial style */
                <div className="aspect-square w-full max-w-sm mx-auto relative border border-academic-border p-8 bg-academic-surface flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-academic-brand opacity-5 mix-blend-multiply" />
                  
                  <div className="w-20 h-20 border border-academic-brand rounded-full flex items-center justify-center text-academic-brand mb-8 relative z-10">
                    <Leaf size={32} strokeWidth={1} />
                  </div>
                  <h3 className="text-3xl font-serif text-academic-accent mb-2 relative z-10 text-center">{plainTitle.split(' ')[0] || "AMSH"}</h3>
                  <p className="text-academic-muted font-sans font-bold tracking-wider uppercase text-sm relative z-10 text-center">{plainTitle.split(' ').slice(1).join(' ') || "Endeavours"}</p>
                  
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
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
