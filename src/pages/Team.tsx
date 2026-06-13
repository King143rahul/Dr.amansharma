import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, User } from 'lucide-react';
import { db } from '../lib/supabase';

interface Student {
  id: string;
  url: string;
  name: string;
  role: string;
  achievements: string;
  display_order: number;
}

export default function Team() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const { data, error } = await db
        .from('media_gallery')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        const studentList = data
          .filter((item: any) => {
            try {
              const parsed = JSON.parse(item.caption);
              return parsed && parsed.type === 'student';
            } catch {
              return false;
            }
          })
          .map((item: any) => {
            const parsed = JSON.parse(item.caption);
            return {
              id: item.id,
              url: item.url,
              name: parsed.name || "Student Name",
              role: parsed.role || "Research Student",
              achievements: parsed.achievements || "",
              display_order: item.display_order || 0
            };
          });
        setStudents(studentList);
      }
    } catch (err) {
      console.error("Error fetching team members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();

    // Subscribe to real-time updates
    const channel = db
      .channel('public_team_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'media_gallery' },
        () => {
          fetchTeam();
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  return (
    <main className="pt-24 min-h-screen bg-academic-bg text-academic-text pb-16 sm:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 sm:mb-20"
        >
          <div className="editorial-subheading flex items-center justify-center gap-3">
            <span className="w-8 h-px bg-academic-brand"></span>
            Research Group
            <span className="w-8 h-px bg-academic-brand"></span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-academic-accent mt-4 mb-6 leading-tight">
            Mentoring & <span className="italic text-academic-brand">Students</span>
          </h1>
          <p className="text-academic-muted max-w-3xl mx-auto text-base sm:text-lg md:text-xl font-sans font-medium leading-relaxed">
            Nurturing the next generation of materials chemists and sustainability researchers in green nanotechnology.
          </p>
        </motion.div>

        {loading ? (
          /* Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border border-academic-border rounded-2xl p-6 space-y-4 animate-pulse shadow-sm">
                <div className="h-48 w-full bg-academic-surface rounded-xl" />
                <div className="h-6 bg-academic-surface rounded w-2/3" />
                <div className="h-4 bg-academic-surface rounded w-1/2" />
                <div className="space-y-2">
                  <div className="h-3 bg-academic-surface rounded w-full" />
                  <div className="h-3 bg-academic-surface rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-6 bg-white border border-academic-border rounded-2xl max-w-xl mx-auto shadow-sm"
          >
            <div className="inline-flex items-center justify-center p-4 bg-academic-brand/10 text-academic-brand rounded-full mb-4">
              <User size={32} />
            </div>
            <h3 className="text-2xl font-serif text-academic-accent mb-2">No students listed yet</h3>
            <p className="text-academic-muted text-sm font-sans max-w-xs mx-auto leading-relaxed">
              Dr. Sharma is currently updating the student profiles. Check back soon for list of active researchers.
            </p>
          </motion.div>
        ) : (
          /* Grid list of members */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {students.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white border border-academic-border overflow-hidden rounded-2xl shadow-sm hover:shadow-xl hover:border-academic-brand/30 transition-all duration-500 flex flex-col"
              >
                {/* Photo container */}
                <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-academic-surface border-b border-academic-border">
                  {student.url ? (
                    <img
                      src={student.url}
                      alt={student.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out object-[50%_30%]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-academic-muted/40">
                      <GraduationCap size={64} strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-academic-accent/80 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] sm:text-xs font-sans uppercase font-bold tracking-wider shadow-sm flex items-center gap-1.5 border border-white/10">
                    <GraduationCap size={12} />
                    {student.role}
                  </div>
                </div>

                {/* Details container */}
                <div className="p-6 sm:p-8 flex flex-col flex-grow">
                  <h3 className="text-2xl font-serif font-bold text-academic-accent mb-1 group-hover:text-academic-brand transition-colors">
                    {student.name}
                  </h3>
                  <div className="text-sm font-semibold text-academic-brand/90 font-sans tracking-wide uppercase mb-4">
                    {student.role}
                  </div>
                  
                  {student.achievements && (
                    <div className="mt-auto pt-4 border-t border-academic-border/60">
                      <div className="flex items-start gap-2 text-academic-muted text-xs sm:text-sm font-medium leading-relaxed font-sans">
                        <Award size={16} className="text-academic-brand mt-0.5 shrink-0" strokeWidth={2} />
                        <div className="whitespace-pre-line text-academic-text font-medium">
                          {student.achievements}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
