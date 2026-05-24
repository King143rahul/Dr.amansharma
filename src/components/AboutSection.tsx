import { motion } from 'framer-motion';
import { Award, BookOpen, FlaskConical, Users, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';

export const AboutSection = () => {
  const [bioText, setBioText] = useState<string>("");
  const [subheading, setSubheading] = useState("Pioneering the intersection of nanotechnology and green chemistry.");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    experience: '7+',
    patents: 'Multiple',
    publications: '15+',
    grants: '2',
    conferences: '10+'
  });

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
          .select('aboutSubheading, experienceValue, patentsValue, publicationsValue, grantsValue, conferencesValue')
          .eq('id', 'settings')
          .single();
        
        if (!error && data) {
          if (data.aboutSubheading) setSubheading(data.aboutSubheading);
          setStats({
            experience: data.experienceValue ?? '7+',
            patents: data.patentsValue ?? 'Multiple',
            publications: data.publicationsValue ?? '15+',
            grants: data.grantsValue ?? '2',
            conferences: data.conferencesValue ?? '10+'
          });
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
          if (data) {
            if (data.aboutSubheading) setSubheading(data.aboutSubheading);
            setStats({
              experience: data.experienceValue ?? '7+',
              patents: data.patentsValue ?? 'Multiple',
              publications: data.publicationsValue ?? '15+',
              grants: data.grantsValue ?? '2',
              conferences: data.conferencesValue ?? '10+'
            });
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(bioChannel);
      db.removeChannel(settingsChannel);
    };
  }, []);

  const STATS = [
    { icon: <Zap size={20} strokeWidth={1.5} />, value: stats.experience, label: 'Years Experience' },
    { icon: <Award size={20} strokeWidth={1.5} />, value: stats.patents, label: 'Patents' },
    { icon: <BookOpen size={20} strokeWidth={1.5} />, value: stats.publications, label: 'Publications' },
    { icon: <FlaskConical size={20} strokeWidth={1.5} />, value: stats.grants, label: 'Govt Grants' },
    { icon: <Users size={20} strokeWidth={1.5} />, value: stats.conferences, label: 'Conferences' },
  ];

  // Split bio text into paragraphs
  const paragraphs = bioText.split('\n').filter(p => p.trim() !== '');

  return (
    <section id="about" className="py-20 sm:py-24 lg:py-32 bg-academic-surface border-b border-academic-border relative z-10">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-start"
        >
          {/* Bio Text */}
          <div className="lg:col-span-7">
            <div className="editorial-subheading">About the Researcher</div>
            <h2 
              className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-academic-accent mb-8 sm:mb-10 leading-tight"
              dangerouslySetInnerHTML={{ __html: subheading }}
            />
            <div className="space-y-5 sm:space-y-6 text-academic-muted text-base sm:text-lg leading-relaxed font-sans font-medium">
              {loading ? (
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-academic-border rounded w-full"></div>
                  <div className="h-4 bg-academic-border rounded w-5/6"></div>
                  <div className="h-4 bg-academic-border rounded w-4/6"></div>
                </div>
              ) : paragraphs.length > 0 ? (
                paragraphs.map((p, idx) => (
                  <p key={idx} dangerouslySetInnerHTML={{ __html: p }} />
                ))
              ) : (
                <p>Biography information is currently being updated.</p>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-px bg-academic-border border border-academic-border bg-opacity-50">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 + (idx * 0.1) }}
              className={`bg-white p-5 sm:p-8 flex flex-col items-center text-center hover:bg-academic-surface transition-colors duration-500 ${
                  idx === STATS.length - 1 ? 'col-span-2' : ''
                }`}
              >
                <div className="text-academic-brand mb-5">
                  {stat.icon}
                </div>
                <div
                  className="text-3xl sm:text-4xl font-serif text-academic-accent mb-2 tracking-tight break-words"
                  dangerouslySetInnerHTML={{ __html: stat.value }}
                />
                <div className="text-xs text-academic-muted uppercase tracking-widest font-sans font-bold">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
