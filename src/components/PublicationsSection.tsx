import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';

export const PublicationsSection = () => {
  const [publicationsData, setPublicationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const { data, error } = await db
          .from('publications')
          .select('*')
          .order('year', { ascending: false });
        
        if (!error && data) {
          setPublicationsData(data);
        }
      } catch (err) {
        console.error("Error fetching publications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublications();

    // Subscribe to real-time changes
    const channel = db
      .channel('publications_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'publications' },
        () => {
          fetchPublications();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  return (
    <section id="publications" className="py-20 sm:py-24 lg:py-32 relative z-10 bg-academic-bg border-b border-academic-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-10 sm:gap-14 lg:gap-24 items-start">
          <motion.div 
            className="lg:w-1/3 lg:sticky lg:top-32"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="editorial-subheading">Selected Work</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-academic-accent mb-6 sm:mb-8 leading-tight">
              Research & <span className="italic text-academic-brand">Publications</span>
            </h2>
            <p className="text-academic-muted text-base sm:text-lg mb-8 sm:mb-10 font-sans font-medium">
              A comprehensive portfolio of scientific contributions advancing the field of environmental chemistry and functional materials.
            </p>
            <a 
              href="https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-6 sm:px-8 py-4 border border-academic-border text-academic-accent font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:bg-academic-surface hover:border-academic-accent transition-colors duration-500"
            >
              Google Scholar <ExternalLink size={16} />
            </a>
          </motion.div>

          <div className="lg:w-2/3 w-full flex flex-col gap-4">
            {loading ? (
              <div className="py-12 text-center text-academic-muted">Loading publications...</div>
            ) : publicationsData.length > 0 ? (
              publicationsData.map((pub, idx) => (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: Math.min(idx * 0.05, 0.5) }}
                  className="editorial-card min-w-0 p-5 sm:p-6 md:p-8 group flex items-start gap-5 md:gap-6"
                >
                  <div className="hidden sm:flex mt-1 w-10 h-10 border border-academic-border rounded-full items-center justify-center text-academic-muted flex-shrink-0 group-hover:text-academic-brand group-hover:border-academic-brand transition-colors duration-500">
                    <FileText size={16} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <a href={pub.link} target="_blank" rel="noopener noreferrer" className="block">
                      <h3
                        className="text-xl sm:text-2xl font-serif font-bold text-academic-accent mb-3 group-hover:text-academic-brand transition-colors duration-500 leading-snug break-words"
                        dangerouslySetInnerHTML={{ __html: pub.title }}
                      />
                    </a>
                    <p
                      className="text-base text-academic-muted font-sans font-medium mb-4 leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: pub.authors }}
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-5 border-t border-academic-border text-sm text-academic-muted font-sans uppercase tracking-wider">
                      <span
                        className="min-w-0 italic leading-relaxed break-words sm:pr-4"
                        dangerouslySetInnerHTML={{ __html: pub.venue }}
                      />
                      <span
                        className="font-semibold text-academic-accent flex-shrink-0 border border-academic-border px-3 py-1 bg-academic-surface"
                        dangerouslySetInnerHTML={{ __html: pub.year }}
                      />
                    </div>
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex items-center gap-2 text-sm font-sans font-bold uppercase tracking-wider text-academic-accent hover:text-academic-brand transition-colors duration-500 group/link"
                    >
                      View Work
                      <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform duration-500" />
                    </a>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center text-academic-muted">No publications added yet. Add some in the Admin Panel.</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
