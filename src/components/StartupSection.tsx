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
  const extendedDescription = data?.extended_description || "";
  const featuresList = data?.features?.length > 0 ? data.features : [
    'Sustainable Wastewater Treatment',
    'Eco-friendly Technologies',
    'Cost-effective Environmental Solutions',
    'Government Grant-Supported'
  ];
  const links = data?.externalLinks || [];

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
                <div className="mb-8 sm:mb-10">
                  <p
                    className="text-academic-muted text-base sm:text-xl leading-relaxed font-sans font-medium whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
                  />
                </div>
              )}
              <ul className="space-y-4 mb-10">
                {featuresList.map((item: string, idx: number) => (
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
              
              {!loading && extendedDescription && (
                <div
                  className="mb-10 text-academic-muted text-sm sm:text-base leading-relaxed font-sans whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(extendedDescription) }}
                />
              )}

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
              className="lg:w-1/2 w-full relative flex justify-center items-center mt-10 lg:mt-0"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-full max-w-xl mx-auto relative rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-academic-border/50 bg-[#3B546B]/5">
                <img 
                  src="/amsh-endeavours-logo.jpg" 
                  alt="AMSH Endeavours Logo" 
                  className="w-full h-auto object-contain rounded-xl hover:scale-[1.02] transition-transform duration-700" 
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
