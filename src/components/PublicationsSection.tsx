import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ExternalLink, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../lib/supabase';
import { sanitizeHtml } from '../lib/sanitizeHtml';
import publicationOrder from '../data/publicationOrder.json';

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
  const [pubOrderMap, setPubOrderMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const { data, error } = await db
          .from('publications')
          .select('*');
        
        if (!error && data) {
          // Sort by the Google Scholar exact order using publicationOrder.json, and the manual order map
          data.sort((a, b) => {
            const orderA = pubOrderMap[a.id];
            const orderB = pubOrderMap[b.id];
            
            if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
            if (orderA !== undefined) return -1;
            if (orderB !== undefined) return 1;

            const indexA = publicationOrder.indexOf(a.title);
            const indexB = publicationOrder.indexOf(b.title);
            
            // If both are found in the array, sort by array index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            // If only a is found, it comes first
            if (indexA !== -1) return -1;
            // If only b is found, it comes first
            if (indexB !== -1) return 1;
            
            // Fallback for new unmapped publications: sort by year descending
            return (b.year || '').localeCompare(a.year || '');
          });
          
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
          .select('contactOrcid, seoKeywords')
          .eq('id', 'settings')
          .single();
        if (!error && data) {
          if (data.contactOrcid) setOrcidUrl(data.contactOrcid);
          if (data.seoKeywords) {
            try {
              setPubOrderMap(JSON.parse(data.seoKeywords));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
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
          if (data && data.seoKeywords) {
            try {
              setPubOrderMap(JSON.parse(data.seoKeywords));
            } catch (e) {}
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
        <div className="flex flex-col mb-12 lg:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="editorial-subheading">Selected Work</div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-academic-accent mb-6 sm:mb-8 leading-tight">
              Selected <span className="italic text-academic-brand">Publications</span>
            </h2>
            <p className="text-academic-muted text-base sm:text-lg mb-8 sm:mb-10 font-sans font-medium">
              A comprehensive portfolio of scientific contributions advancing the field of environmental chemistry and functional materials.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 border border-academic-border text-academic-accent font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:bg-academic-surface hover:border-academic-accent transition-colors duration-500"
              >
                Google Scholar <ExternalLink size={16} />
              </a>
              {orcidUrl && (
                <a 
                  href={orcidUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 border border-academic-border text-academic-accent font-sans text-sm sm:text-base font-bold tracking-wider uppercase hover:bg-academic-surface hover:border-academic-accent transition-colors duration-500"
                >
                  ORCID: {getOrcidDisplayId(orcidUrl)} <ExternalLink size={16} />
                </a>
              )}
            </div>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto w-full flex flex-col gap-12 lg:gap-16">
          {/* Publications Section */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-academic-accent mb-6 pb-3 border-b border-academic-border flex items-center gap-3">
               <FileText className="text-academic-brand" size={24} /> Publications
            </h3>
            <div className="flex flex-col">
              {loading ? (
                <div className="py-12 text-center text-academic-muted">Loading publications...</div>
              ) : publicationsData.filter(p => !p.venue?.toLowerCase().includes("patent")).length > 0 ? (
                publicationsData.filter(p => !p.venue?.toLowerCase().includes("patent")).map((pub, idx) => (
                  <motion.div
                     key={pub.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.3) }}
                    className="flex gap-4 sm:gap-6 py-5 border-b border-academic-border/50 group last:border-0"
                  >
                    <div className="text-academic-brand font-serif font-bold text-lg min-w-[24px] pt-0.5">
                      {idx + 1}.
                    </div>
                    <div className="flex-1 min-w-0">
                      <button onClick={() => setSelectedPub(pub)} className="block text-left w-full focus:outline-none cursor-pointer">
                        <h4
                          className="text-base sm:text-lg font-serif font-bold text-academic-accent group-hover:text-academic-brand transition-colors duration-300 leading-snug break-words"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.title) }}
                        />
                      </button>
                      <p
                        className="text-sm text-academic-muted font-sans mt-1.5 leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.authors) }}
                      />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-academic-muted font-sans">
                        <span className="italic" dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.venue) }} />
                        <span className="font-semibold text-academic-accent" dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.year) }} />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center text-academic-muted">No publications added yet.</div>
              )}
            </div>
          </div>

          {/* Patents Section */}
          <div className={publicationsData.filter(p => p.venue?.toLowerCase().includes("patent")).length > 0 ? "block" : "hidden"}>
            <h3 className="text-2xl font-serif font-bold text-academic-accent mb-6 pb-3 border-b border-academic-border flex items-center gap-3">
               <FileText className="text-academic-brand" size={24} /> Patents
            </h3>
            <div className="flex flex-col">
              {loading ? (
                <div className="py-12 text-center text-academic-muted">Loading patents...</div>
              ) : publicationsData.filter(p => p.venue?.toLowerCase().includes("patent")).length > 0 ? (
                publicationsData.filter(p => p.venue?.toLowerCase().includes("patent")).map((pub, idx) => (
                  <motion.div
                     key={pub.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: Math.min(idx * 0.05, 0.3) }}
                    className="flex gap-4 sm:gap-6 py-5 border-b border-academic-border/50 group last:border-0"
                  >
                    <div className="text-academic-brand font-serif font-bold text-lg min-w-[24px] pt-0.5">
                      {idx + 1}.
                    </div>
                    <div className="flex-1 min-w-0">
                      <button onClick={() => setSelectedPub(pub)} className="block text-left w-full focus:outline-none cursor-pointer">
                        <h4
                          className="text-base sm:text-lg font-serif font-bold text-academic-accent group-hover:text-academic-brand transition-colors duration-300 leading-snug break-words"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.title) }}
                        />
                      </button>
                      <p
                        className="text-sm text-academic-muted font-sans mt-1.5 leading-relaxed break-words"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.authors) }}
                      />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-academic-muted font-sans">
                        <span className="italic font-bold text-academic-brand" dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.venue) }} />
                        <span className="font-semibold text-academic-accent" dangerouslySetInnerHTML={{ __html: sanitizeHtml(pub.year) }} />
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-12 text-center text-academic-muted">No patents added yet.</div>
              )}
            </div>
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
