import { motion } from 'framer-motion';

const GALLERY_ITEMS = [
  { id: 1, title: 'Conferences' },
  { id: 2, title: 'Research Labs' },
  { id: 3, title: 'Workshops' },
  { id: 4, title: 'Awards' },
  { id: 5, title: 'Teaching Sessions' },
  { id: 6, title: 'Scientific Events' },
];

export const GallerySection = () => {
  return (
    <section className="py-32 bg-academic-surface relative z-10 border-b border-academic-border">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-20"
        >
          <div className="editorial-subheading flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-academic-brand"></span>
            Visual Archive
            <span className="w-8 h-px bg-academic-brand"></span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-academic-accent mt-6 mb-6 leading-tight">
            Academic <span className="italic text-academic-brand">Gallery</span>
          </h2>
          <p className="text-academic-muted max-w-2xl mx-auto text-xl font-sans font-medium">
            Glimpses of research, teaching, and academic leadership.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-academic-border border border-academic-border bg-opacity-50">
          {GALLERY_ITEMS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.8 }}
              className="group relative aspect-[4/3] bg-white overflow-hidden cursor-pointer hover:bg-academic-brand transition-colors duration-500 flex flex-col items-center justify-center p-8 text-center"
            >
              <h3 className="text-2xl font-serif font-medium text-academic-accent group-hover:text-white transition-colors duration-500 leading-tight">
                {item.title}
              </h3>
              <div className="absolute inset-0 border border-transparent group-hover:border-academic-border transition-colors duration-500" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
