import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

import { useEffect, useState } from 'react';
import { db } from '../lib/supabase';

const DEFAULT_TIMELINE = [
  {
    id: 1,
    year: "Aug 2025 - Present",
    title: "Founder",
    organization: "AMSH",
    description: "A government grant-supported startup dedicated to bridging the gap between academic research and real-world environmental applications.",
    iconName: "Rocket",
  },
  {
    id: 2,
    year: "Aug 2025 - July 2026",
    title: "Asst Prof of Chemistry",
    organization: "SVyasa",
    description: "",
    iconName: "GraduationCap",
  },
  {
    id: 3,
    year: "2022 - 2025",
    title: "Research Fellow",
    organization: "Materials Chemistry",
    description: "",
    iconName: "Microscope",
  }
];

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
    <section className="py-6 sm:py-10 bg-academic-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-academic-brand/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="editorial-subheading flex items-center justify-center gap-2 mb-1 text-xs">
            <Calendar size={12} /> Career Journey
          </div>
          <h2 className="editorial-heading text-2xl sm:text-3xl text-academic-accent mb-2">
            Professional Timeline
          </h2>
          <p className="text-academic-muted text-sm max-w-2xl mx-auto">
            A track record of academic excellence, research leadership, and entrepreneurial vision.
          </p>
        </motion.div>

        <div className="relative mt-12 md:mt-16 w-full">
          {/* Horizontal Line for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gray-300 transform -translate-y-1/2 z-0"></div>
          
          {/* Vertical Line for Mobile */}
          <div className="block md:hidden absolute left-8 top-0 bottom-0 w-px bg-gray-300 z-0"></div>

          <div className="flex flex-col md:flex-row gap-8 md:gap-0 relative z-10 w-full md:items-stretch md:overflow-x-auto hide-scrollbar pb-10 pt-4 md:px-8 snap-x">
            {timelineData.map((item, index) => {
              const colors = [
                { text: "text-blue-500", bg: "bg-blue-500" },
                { text: "text-orange-500", bg: "bg-orange-500" },
                { text: "text-yellow-500", bg: "bg-yellow-500" },
                { text: "text-emerald-500", bg: "bg-emerald-500" },
                { text: "text-purple-500", bg: "bg-purple-500" },
                { text: "text-rose-500", bg: "bg-rose-500" },
                { text: "text-cyan-500", bg: "bg-cyan-500" },
              ];
              const color = colors[index % colors.length];

              return (
              <div key={item.id} className="relative flex flex-row md:flex-col md:min-w-[180px] flex-1 group snap-center items-stretch md:items-center">
                
                {/* Desktop Top Content */}
                <div className="hidden md:flex flex-1 flex-col justify-end w-full pb-2 px-2 min-h-[80px]">
                  {index % 2 === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <h3 className="text-[12px] font-bold text-gray-800 mb-1 leading-tight">{item.title}</h3>
                      <h4 className="text-[10px] font-semibold text-gray-500 mb-1">{item.organization}</h4>
                      {item.description && <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-3">{item.description}</p>}
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex items-end justify-center pb-1">
                      <span className={`text-sm font-bold ${color.text}`}>{item.year}</span>
                    </div>
                  )}
                </div>

                {/* Timeline node */}
                <div className="flex-none relative flex items-center justify-center my-0 h-10 w-10 md:h-8 md:w-full ml-0">
                  <div className={`w-3 h-3 rounded-full ${color.bg} border-[2px] border-white shadow-sm z-20 transition-transform group-hover:scale-125`}></div>
                  {/* Vertical connector line for desktop */}
                  <div className={`hidden md:block absolute left-1/2 -translate-x-1/2 w-px bg-gray-300 -z-10 ${index % 2 === 0 ? 'bottom-1/2 h-8' : 'top-1/2 h-8'}`}></div>
                </div>

                {/* Desktop Bottom Content */}
                <div className="hidden md:flex flex-1 flex-col justify-start w-full pt-2 px-2 min-h-[80px]">
                  {index % 2 !== 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center"
                    >
                      <h3 className="text-[12px] font-bold text-gray-800 mb-1 leading-tight">{item.title}</h3>
                      <h4 className="text-[10px] font-semibold text-gray-500 mb-1">{item.organization}</h4>
                      {item.description && <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-3">{item.description}</p>}
                    </motion.div>
                  ) : (
                    <div className="flex-1 flex items-start justify-center pt-1">
                      <span className={`text-sm font-bold ${color.text}`}>{item.year}</span>
                    </div>
                  )}
                </div>

                {/* Mobile Content */}
                <div className="md:hidden flex-1 pl-4 pb-8 pt-1">
                  <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className={`text-xs font-bold tracking-widest uppercase mb-1 ${color.text}`}>
                        {item.year}
                      </div>
                      <h3 className="text-[13px] font-bold text-gray-800 mb-1 leading-tight">
                        {item.title}
                      </h3>
                      <h4 className="text-[11px] font-semibold text-gray-500 mb-2">
                        {item.organization}
                      </h4>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        {item.description}
                      </p>
                  </motion.div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
