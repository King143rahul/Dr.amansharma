import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink, FileText } from 'lucide-react';
import publicationsData from '../publications.json';

export const PublicationsSection = () => {
  return (
    <section id="publications" className="py-32 relative z-10 bg-academic-bg border-b border-academic-border">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          <motion.div 
            className="lg:w-1/3 lg:sticky lg:top-32"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="editorial-subheading">Selected Work</div>
            <h2 className="text-4xl md:text-5xl font-serif text-academic-accent mb-8 leading-tight">
              Research & <span className="italic text-academic-brand">Publications</span>
            </h2>
            <p className="text-academic-muted text-lg mb-10 font-sans font-medium">
              A comprehensive portfolio of scientific contributions advancing the field of environmental chemistry and functional materials.
            </p>
            <a 
              href="https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 border border-academic-border text-academic-accent font-sans text-base font-bold tracking-wider uppercase hover:bg-academic-surface hover:border-academic-accent transition-colors duration-500"
            >
              Google Scholar <ExternalLink size={16} />
            </a>
          </motion.div>

          <div className="lg:w-2/3 w-full flex flex-col gap-4">
            {publicationsData.map((pub, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: Math.min(idx * 0.05, 0.5) }}
                className="editorial-card min-w-0 p-6 md:p-8 group flex items-start gap-5 md:gap-6"
              >
                <div className="hidden sm:flex mt-1 w-10 h-10 border border-academic-border rounded-full items-center justify-center text-academic-muted flex-shrink-0 group-hover:text-academic-brand group-hover:border-academic-brand transition-colors duration-500">
                  <FileText size={16} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <a href={pub.link} target="_blank" rel="noopener noreferrer" className="block">
                    <h3 className="text-2xl font-serif font-bold text-academic-accent mb-3 group-hover:text-academic-brand transition-colors duration-500 leading-snug break-words">
                      {pub.title}
                    </h3>
                  </a>
                  <p className="text-base text-academic-muted font-sans font-medium mb-4 leading-relaxed break-words">{pub.authors}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-5 border-t border-academic-border text-sm text-academic-muted font-sans uppercase tracking-wider">
                    <span className="min-w-0 italic leading-relaxed break-words sm:pr-4">{pub.venue}</span>
                    <span className="font-semibold text-academic-accent flex-shrink-0 border border-academic-border px-3 py-1 bg-academic-surface">{pub.year}</span>
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
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
