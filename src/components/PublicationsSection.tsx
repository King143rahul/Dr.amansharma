import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../lib/supabase';
import { sanitizeHtml } from '../lib/sanitizeHtml';

const getOrcidDisplayId = (url: string) => {
  if (!url) return "";
  const clean = url.replace(/\/$/, "");
  const lastSlash = clean.lastIndexOf("/");
  if (lastSlash !== -1) {
    return clean.slice(lastSlash + 1);
  }
  return url;
};

export const PublicationsSection = () => {
  const [publicationsData, setPublicationsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPub, setSelectedPub] = useState<any | null>(null);
  const [orcidUrl, setOrcidUrl] = useState("https://orcid.org/0000-0001-5024-292X");

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

    const fetchSettings = async () => {
      try {
        const { data, error } = await db
          .from('general_settings')
          .select('contactOrcid')
          .eq('id', 'settings')
          .single();
        if (!error && data && data.contactOrcid) {
          setOrcidUrl(data.contactOrcid);
        }
      } catch (err) {
        console.error("Error fetching orcid from settings:", err);
      }
    };

    fetchPublications();
    fetchSettings();

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

    // Subscribe to settings changes for real-time orcid updates
    const settingsChannel = db
      .channel('publications_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'general_settings', filter: 'id=eq.settings' },
        (payload) => {
          const data = payload.new as any;
          if (data && data.contactOrcid) {
            setOrcidUrl(data.contactOrcid);
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
      db.removeChannel(settingsChannel);
    };
  }, []);

  return (
    <section id="publications" className="py-8 sm:py-10 lg:py-12 relative z-10 bg-academic-bg border-b border-academic-border">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-3 lg:px-4">
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
            <div className="flex flex-col gap-3">
              <a 
                href="https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-3 px-6 sm:px-8 py-4 border border-academic-border text-academic-accent font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:bg-academic-surface hover:border-academic-accent transition-colors duration-500"
              >
                Google Scholar <ExternalLink size={16} />
              </a>
              {orcidUrl && (
                <a 
                  href={orcidUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-3 px-6 sm:px-8 py-4 border border-academic-border text-academic-accent font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:bg-academic-surface hover:border-academic-accent transition-colors duration-500"
                >
                  ORCID: {getOrcidDisplayId(orcidUrl)} <ExternalLink size={16} />
                </a>
              )}
            </div>
          </motion.div>

          <div className="lg:w-2/3 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            {loading ? (
              <div className="py-12 text-center text-academic-muted col-span-1 sm:col-span-2">Loading publications...</div>
            ) : publicationsData.length > 0 ? (
              publicationsData.map((pub, idx) => (
                <motion.div
                   key={pub.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: Math.min(idx * 0.05, 0.5) }}
                  className="editorial-card min-w-0 p-5 sm:p-6 group flex flex-col h-full"
                >
                  <div className="hidden sm:flex mb-4 w-10 h-10 border border-academic-border rounded-full items-center justify-center text-academic-muted flex-shrink-0 group-hover:text-academic-brand group-hover:border-academic-brand transition-colors duration-500">
                    <FileText size={16} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex flex-col flex-1 h-full">
                    <button onClick={() => setSelectedPub(pub)} className="block text-left w-full focus:outline-none cursor-pointer">
                      <h3
                        className="text-lg sm:text-xl font-serif font-bold text-academic-accent mb-3 group-hover:text-academic-brand transition-colors duration-500 leading-snug break-words"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.title) }}
                      />
                    </button>
                    <p
                      className="text-sm text-academic-muted font-sans font-medium mb-4 leading-relaxed break-words flex-1"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.authors) }}
                    />
                    <div className="flex flex-col gap-3 pt-4 border-t border-academic-border text-xs text-academic-muted font-sans uppercase tracking-wider mt-auto">
                      <div className="flex items-center gap-3 min-w-0">
                        {pub.venue?.toLowerCase().includes("chemistry") && pub.venue?.toLowerCase().includes("european journal") && (
                          <img 
                            src="https://chemistry-europe.onlinelibrary.wiley.com/cover/15213765" 
                            alt="Chemistry – A European Journal Logo" 
                            className="w-6 h-8 object-contain border border-academic-border bg-white flex-shrink-0"
                          />
                        )}
                        <span
                          className="min-w-0 italic leading-relaxed break-words"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.venue) }}
                        />
                      </div>
                      <span
                        className="font-semibold text-academic-accent flex-shrink-0 border border-academic-border px-3 py-1 bg-academic-surface self-start"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.year) }}
                      />
                    </div>
                    <button
                      onClick={() => setSelectedPub(pub)}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-sans font-bold uppercase tracking-wider text-academic-accent hover:text-academic-brand transition-colors duration-500 group/link cursor-pointer"
                    >
                      View Details
                      <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform duration-500" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 text-center text-academic-muted col-span-1 sm:col-span-2">No publications added yet. Add some in the Admin Panel.</div>
            )}
          </div>
        </div>
      </div>

      {/* Summary & Details Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedPub && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPub(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white border border-academic-border rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[85vh] overflow-y-auto"
              >
                <button
                  onClick={() => setSelectedPub(null)}
                  className="absolute top-4 right-4 text-academic-muted hover:text-academic-brand transition-colors cursor-pointer"
                  aria-label="Close Modal"
                >
                  <X size={24} />
                </button>

                <div className="editorial-subheading text-academic-brand uppercase text-xs tracking-wider mb-2">
                  Publication Details
                </div>
                
                <h3 
                  className="text-2xl sm:text-3xl font-serif font-bold text-academic-accent mb-4 leading-snug"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedPub.title) }}
                />

                <p 
                  className="text-base text-academic-muted font-sans mb-4 border-b border-academic-border pb-4"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedPub.authors) }}
                />

                <div className="space-y-4 mb-8">
                  <div>
                    <h4 className="text-xs font-bold text-academic-muted uppercase tracking-wider mb-1">Journal / Venue</h4>
                    <div className="flex items-center gap-3">
                      {selectedPub.venue?.toLowerCase().includes("chemistry") && selectedPub.venue?.toLowerCase().includes("european journal") && (
                        <img 
                          src="https://chemistry-europe.onlinelibrary.wiley.com/cover/15213765" 
                          alt="Chemistry – A European Journal Logo" 
                          className="w-10 h-12 object-contain border border-academic-border bg-white flex-shrink-0"
                        />
                      )}
                      <p className="text-academic-accent font-sans italic" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedPub.venue || "N/A") }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-academic-muted uppercase tracking-wider mb-1">Publication Year</h4>
                    <p className="text-academic-accent font-sans font-semibold" dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedPub.year || "N/A") }} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-academic-muted uppercase tracking-wider mb-2">Research Summary</h4>
                    <p className="text-academic-text font-serif text-base leading-relaxed bg-academic-surface/50 p-4 rounded-xl border border-academic-border/50">
                      {selectedPub.summary || "A summary of this research paper is currently being updated by the author."}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end border-t border-academic-border pt-4">
                  <button
                    onClick={() => setSelectedPub(null)}
                    className="px-5 py-2.5 rounded-lg border border-academic-border text-academic-accent font-bold hover:bg-academic-surface transition cursor-pointer"
                  >
                    Close
                  </button>
                  {selectedPub.link && (
                    <a
                      href={selectedPub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-2.5 bg-academic-brand text-white font-bold rounded-lg hover:bg-emerald-800 transition flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      View Full Publication
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  );
};
