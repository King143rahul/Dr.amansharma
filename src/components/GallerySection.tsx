import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { Image, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export const GallerySection = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const fetchImages = async () => {
    try {
      const { data, error } = await db
        .from('media_gallery')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        setImages(data);
      }
    } catch (err) {
      console.error("Error fetching gallery images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();

    // Subscribe to real-time changes
    const channel = db
      .channel('public_gallery_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'media_gallery' },
        () => {
          fetchImages();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (e.key === 'Escape') setSelectedIdx(null);
      if (e.key === 'ArrowRight') {
        setSelectedIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
      }
      if (e.key === 'ArrowLeft') {
        setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIdx, images]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <section className="py-20 sm:py-24 lg:py-32 bg-academic-surface relative z-10 border-b border-academic-border">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <div className="editorial-subheading flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-academic-brand"></span>
            Visual Archive
            <span className="w-8 h-px bg-academic-brand"></span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-academic-accent mt-6 mb-6 leading-tight">
            Academic <span className="italic text-academic-brand">Gallery</span>
          </h2>
          <p className="text-academic-muted max-w-2xl mx-auto text-base sm:text-xl font-sans font-medium">
            Glimpses of research, teaching, and academic leadership.
          </p>
        </motion.div>

        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] bg-academic-border/30 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : images.length === 0 ? (
          /* Empty State */
          <div className="text-center py-14 sm:py-20 px-5 bg-white border border-academic-border rounded-2xl max-w-lg mx-auto shadow-sm">
            <Image size={48} className="mx-auto mb-4 text-academic-muted opacity-30 animate-bounce" />
            <h3 className="text-2xl font-serif text-academic-accent mb-2">Visual archive is empty</h3>
            <p className="text-academic-muted text-sm font-sans max-w-xs mx-auto">
              Photos uploaded from the administrative dashboard will appear here dynamically.
            </p>
          </div>
        ) : (
          /* Image Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setSelectedIdx(idx)}
                className="group relative aspect-[4/3] bg-white border border-academic-border overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 rounded-xl"
              >
                <img
                  src={item.url}
                  alt="Academic gallery visual item"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-academic-accent/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-white/90 text-academic-accent p-3 rounded-full shadow-md scale-75 group-hover:scale-100 transition-all duration-300 ease-out">
                    <ZoomIn size={20} strokeWidth={2} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Modal */}
      <AnimatePresence>
        {selectedIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIdx(null)}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-4 md:p-8"
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedIdx(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition z-[10000]"
              aria-label="Close Lightbox"
            >
              <X size={24} />
            </button>

            {/* Left navigation */}
            <button
              onClick={handlePrev}
              className="absolute left-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition z-[10000] hidden sm:block"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Main content viewport */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[80vh] flex flex-col items-center"
            >
              <img
                src={images[selectedIdx]?.url}
                alt="Selected academic item"
                className="max-w-full max-h-[72vh] sm:max-h-[75vh] object-contain rounded border border-white/10 shadow-2xl"
              />
              <div className="mt-4 text-white/75 font-sans text-sm font-medium bg-black/40 px-4 py-1.5 rounded-full border border-white/5">
                {selectedIdx + 1} of {images.length}
              </div>
            </motion.div>

            {/* Right navigation */}
            <button
              onClick={handleNext}
              className="absolute right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition z-[10000] hidden sm:block"
              aria-label="Next image"
            >
              <ChevronRight size={28} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
