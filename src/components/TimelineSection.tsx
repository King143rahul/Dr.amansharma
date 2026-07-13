import { motion } from 'framer-motion';
import { Rocket, Microscope, GraduationCap, Calendar } from 'lucide-react';

import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';

const DEFAULT_TIMELINE = [
  {
    id: 1,
    year: "Present",
    title: "Founder",
    organization: "AMSH Endeavours",
    description: "A government grant-supported startup dedicated to bridging the gap between academic research and real-world environmental applications.",
    iconName: "Rocket",
  },
  {
    id: 2,
    year: "2025",
    title: "Ph.D. in Chemistry",
    organization: "Christ University, Bengaluru",
    description: "Completed Doctorate from the Centre for Advanced Research & Development (CARD) under the supervision of Prof. Gurumurthy Hegde.",
    iconName: "GraduationCap",
  }
];

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'Rocket': return <Rocket size={24} className="text-academic-accent" />;
    case 'Microscope': return <Microscope size={24} className="text-academic-accent" />;
    case 'GraduationCap': return <GraduationCap size={24} className="text-academic-accent" />;
    default: return <Calendar size={24} className="text-academic-accent" />;
  }
};

export const TimelineSection = () => {
  const [timelineData, setTimelineData] = useState<any[]>(DEFAULT_TIMELINE);

  useEffect(() => {
    const fetchTimeline = async () => {
      const { data } = await db.from('general_settings').select('seoDescription').eq('id', 'settings').single();
      if (data && data.seoDescription) {
        try {
          const parsed = JSON.parse(data.seoDescription);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTimelineData(parsed);
          }
        } catch (e) {
          console.error("Failed to parse timeline JSON", e);
        }
      }
    };
    fetchTimeline();
  }, []);

  return (
    <section className="py-20 sm:py-32 bg-academic-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-academic-brand/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="editorial-subheading flex items-center justify-center gap-2 mb-4">
            <Calendar size={16} /> Career Journey
          </div>
          <h2 className="editorial-heading text-4xl sm:text-5xl md:text-6xl text-academic-accent mb-6">
            Professional Timeline
          </h2>
          <p className="text-academic-muted text-lg max-w-2xl mx-auto">
            A track record of academic excellence, research leadership, and entrepreneurial vision.
          </p>
        </motion.div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-academic-border via-academic-brand/50 to-academic-border transform -translate-x-1/2"></div>

          <div className="space-y-12 sm:space-y-24">
            {timelineData.map((item, index) => (
              <div key={item.id} className="relative flex flex-col md:flex-row items-center justify-between group">
                
                {/* Timeline node */}
                <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-academic-surface shadow-xl flex items-center justify-center z-20 group-hover:scale-110 group-hover:border-academic-brand/30 transition-all duration-500">
                  <div className="absolute inset-0 rounded-full bg-academic-brand/10 animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {getIcon(item.iconName)}
                </div>

                {/* Left side Content (Empty for odd, filled for even on desktop) */}
                <div className={`w-full md:w-5/12 pl-16 md:pl-0 ${index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:order-last md:pl-12'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50, y: 20 }}
                    whileInView={{ opacity: 1, x: 0, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="relative p-6 sm:p-8 bg-white/60 backdrop-blur-xl border border-academic-border rounded-3xl shadow-lg hover:shadow-2xl hover:border-academic-brand/40 hover:-translate-y-1 transition-all duration-500 group-hover:bg-white/80"
                  >
                    <div className="inline-block px-4 py-1.5 rounded-full bg-academic-surface text-academic-accent text-sm font-bold tracking-widest uppercase mb-4 border border-academic-border">
                      {item.year}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-serif font-bold text-academic-accent mb-2">
                      {item.title}
                    </h3>
                    <h4 className="text-lg font-sans font-semibold text-academic-brand mb-4">
                      {item.organization}
                    </h4>
                    <p className="text-academic-muted leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                </div>

                {/* Right side spacer (Empty for even, filled for odd on desktop) */}
                <div className={`hidden md:block w-5/12 ${index % 2 === 0 ? 'order-last' : ''}`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
