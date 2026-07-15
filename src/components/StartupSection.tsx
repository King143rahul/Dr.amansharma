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
  const featuresList = data?.features?.length > 0 ? data.features : [
    'Sustainable Wastewater Treatment',
    'Eco-friendly Technologies',
    'Cost-effective Environmental Solutions',
    'Government Grant-Supported'
  ];
  const links = data?.externalLinks || [];

  let extendedDescriptionText = data?.extended_description || "";
  let grantAgenciesList: any[] = [];
  try {
    if (extendedDescriptionText.trim().startsWith('{')) {
      const parsed = JSON.parse(extendedDescriptionText);
      extendedDescriptionText = parsed.text || "";
      grantAgenciesList = parsed.agencies || [];
    }
  } catch (e) {
    // it's just text
  }

  return (
    <section id="startup" className="py-8 sm:py-10 lg:py-12 bg-academic-bg relative z-10 border-b border-academic-border">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-3 lg:px-4">
        <div className="border border-academic-border bg-white relative p-5 sm:p-10 md:p-12 lg:p-16">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
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
              
              {!loading && extendedDescriptionText && (
                <div
                  className="mb-10 text-academic-muted text-sm sm:text-base leading-relaxed font-sans whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(extendedDescriptionText) }}
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
              className="lg:w-1/2 w-full flex flex-col items-center gap-12 sm:gap-16 mt-10 lg:mt-0"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* AMSH Logo */}
              <div className="w-full max-w-xs sm:max-w-sm mx-auto relative rounded-2xl overflow-hidden shadow-xl shadow-black/5 border border-academic-border/50 bg-[#3B546B]/5">
                <img 
                  src="/amsh-endeavours-logo.jpg" 
                  alt="AMSH Endeavours Logo" 
                  className="w-full h-auto object-contain rounded-xl hover:scale-[1.02] transition-transform duration-700" 
                />
              </div>

              {/* Grant Agencies */}
              <div className="w-full text-center">
                <h3 className="text-academic-muted font-sans text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-6 sm:mb-8">
                  Supported By Grant Agencies
                </h3>
                
                <div className="flex flex-wrap justify-center items-start gap-6 sm:gap-10">
                  {grantAgenciesList.length > 0 ? (
                    grantAgenciesList.map((agency: any, idx: number) => (
                      <div key={idx} className="group flex flex-col items-center gap-3 cursor-pointer w-20 sm:w-24">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-academic-border shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-academic-brand/40 group-hover:-translate-y-1 transition-all duration-300 overflow-hidden p-2 sm:p-3">
                          {agency.logoUrl ? (
                            <img src={agency.logoUrl} alt={agency.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-academic-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center leading-tight px-1 group-hover:text-academic-brand transition-colors">
                              {agency.name}
                            </span>
                          )}
                        </div>
                        {agency.logoUrl && (
                          <span className="text-academic-muted text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center leading-tight group-hover:text-academic-brand transition-colors">
                            {agency.name}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Agency 1 Placeholder */}
                      <div className="group flex flex-col items-center gap-3 cursor-pointer w-20 sm:w-24">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-academic-border shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-academic-brand/40 group-hover:-translate-y-1 transition-all duration-300 overflow-hidden p-2">
                          <span className="text-academic-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center leading-tight px-1 group-hover:text-academic-brand transition-colors">
                            Ministry of<br/>Agriculture
                          </span>
                        </div>
                      </div>

                      {/* Agency 2 Placeholder */}
                      <div className="group flex flex-col items-center gap-3 cursor-pointer w-20 sm:w-24">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white border border-academic-border shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:border-academic-brand/40 group-hover:-translate-y-1 transition-all duration-300 overflow-hidden p-2">
                          <span className="text-academic-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center leading-tight px-1 group-hover:text-academic-brand transition-colors">
                            Govt of<br/>India
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
