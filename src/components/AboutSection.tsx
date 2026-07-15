import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';
import { sanitizeHtml } from '../lib/sanitizeHtml';

export const AboutSection = () => {
  const [bioText, setBioText] = useState<string>("");
  const [subheading, setSubheading] = useState("Pioneering the intersection of nanotechnology and green chemistry.");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBio = async () => {
      try {
        const { data, error } = await db
          .from('biography')
          .select('text')
          .eq('id', 'about')
          .single();
        
        if (!error && data) {
          setBioText(data.text ?? "");
        }
      } catch (err) {
        console.error("Error fetching bio:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSettings = async () => {
      try {
        const { data, error } = await db
          .from('general_settings')
          .select('aboutSubheading')
          .eq('id', 'settings')
          .single();
        
        if (!error && data && data.aboutSubheading) {
          setSubheading(data.aboutSubheading);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };

    fetchBio();
    fetchSettings();

    // Subscribe to real-time changes
    const bioChannel = db
      .channel('biography_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'biography', filter: 'id=eq.about' },
        (payload) => {
          const data = payload.new as any;
          if (data) {
            setBioText(data.text ?? "");
          }
        }
      )
      .subscribe();

    const settingsChannel = db
      .channel('about_settings_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'general_settings', filter: 'id=eq.settings' },
        (payload) => {
          const data = payload.new as any;
          if (data && data.aboutSubheading) {
            setSubheading(data.aboutSubheading);
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(bioChannel);
      db.removeChannel(settingsChannel);
    };
  }, []);

  // Split bio text into paragraphs
  const paragraphs = bioText.split('\n').filter(p => p.trim() !== '');

  return (
    <section id="about" className="pt-4 pb-8 sm:pb-10 lg:pb-12 bg-green-50/30 border-b border-academic-border relative z-10">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-3 lg:px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col max-w-4xl mx-auto"
        >
          {/* Bio Text */}
          <div className="w-full">
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-academic-accent mb-8 sm:mb-10 leading-tight"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(subheading) }}
            />
            <div className="space-y-5 sm:space-y-6 text-academic-muted text-base sm:text-lg leading-relaxed font-sans font-medium text-justify">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-academic-border rounded w-full"></div>
                  <div className="h-4 bg-academic-border rounded w-5/6"></div>
                  <div className="h-4 bg-academic-border rounded w-4/6"></div>
                </div>
              ) : paragraphs.length > 0 ? (
                paragraphs.map((p, idx) => (
                  <p key={idx} dangerouslySetInnerHTML={{ __html: sanitizeHtml(p) }} />
                ))
              ) : (
                <p>Biography information is currently being updated.</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
