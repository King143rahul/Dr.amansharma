import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Award, User, Mail } from 'lucide-react';
import { db } from '../lib/supabase';

interface Student {
  id: string;
  url: string;
  name: string;
  role: string;
  achievements: string;
  email?: string;
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
              email: parsed.email || "",
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
    <main className="pt-24 min-h-screen bg-academic-bg text-academic-text pb-20 sm:pb-32 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-academic-brand/5 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-academic-brand/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 sm:mb-24 mt-8"
        >
          <div className="inline-flex items-center justify-center gap-3 px-5 py-2 rounded-full bg-academic-brand/10 border border-academic-brand/20 backdrop-blur-md mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <span className="w-2 h-2 rounded-full bg-academic-brand animate-pulse"></span>
            <span className="text-academic-brand text-xs font-bold uppercase tracking-widest">Research Group</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-academic-accent mt-2 mb-6 leading-[1.1] tracking-tight">
            Mentoring & <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-academic-brand to-emerald-600">Students</span>
          </h1>
          <p className="text-academic-muted max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-sans font-medium leading-relaxed">
            Nurturing the next generation of materials chemists and sustainability researchers in green nanotechnology.
          </p>
        </motion.div>

        {loading ? (
          /* Premium Skeletons */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl p-6 space-y-4 shadow-xl shadow-black/5 animate-pulse">
                <div className="h-64 w-full bg-black/5 rounded-2xl" />
                <div className="h-8 bg-black/5 rounded-md w-2/3 mt-6" />
                <div className="h-4 bg-black/5 rounded-md w-1/3" />
                <div className="space-y-3 pt-6 border-t border-black/5">
                  <div className="h-3 bg-black/5 rounded w-full" />
                  <div className="h-3 bg-black/5 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          /* Premium Empty State */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 px-8 bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl max-w-2xl mx-auto shadow-2xl shadow-black/5"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-academic-brand/20 to-emerald-500/10 text-academic-brand rounded-2xl shadow-inner mb-6 transform rotate-3">
              <User size={36} />
            </div>
            <h3 className="text-3xl font-serif text-academic-accent mb-4">No students listed yet</h3>
            <p className="text-academic-muted text-base font-sans max-w-md mx-auto leading-relaxed">
              Dr. Sharma is currently updating the student profiles. Check back soon to meet the active researchers in our lab.
            </p>
          </motion.div>
        ) : (
          /* Glassmorphic Grid list of members */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-14">
            {students.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-white/60 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(34,197,94,0.15)] transition-all duration-700 flex flex-col hover:-translate-y-2 overflow-visible"
              >
                {/* Subtle glowing orb behind card on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-academic-brand/0 to-emerald-500/0 group-hover:from-academic-brand/5 group-hover:to-emerald-500/10 rounded-[2rem] transition-colors duration-700 -z-10 blur-xl"></div>
                
                {/* Photo container */}
                <div className="relative h-[320px] w-full p-3 pb-0">
                  <div className="relative w-full h-full overflow-hidden rounded-[1.5rem] bg-academic-surface/50 shadow-inner">
                    {student.url ? (
                      <>
                        <div className="absolute inset-0 bg-academic-brand/20 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-700"></div>
                        <img
                          src={student.url}
                          alt={student.name}
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out object-[50%_30%]"
                          loading="lazy"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-academic-brand/20 bg-gradient-to-br from-academic-brand/5 to-transparent">
                        <GraduationCap size={72} strokeWidth={1} />
                      </div>
                    )}
                    
                    {/* Floating Glassmorphic Role Badge */}
                    <div className="absolute bottom-4 left-4 right-4 z-20 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-100">
                      <div className="bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-lg border border-white/50 flex items-center gap-2 justify-center">
                        <GraduationCap size={14} className="text-academic-brand" />
                        <span className="text-[11px] font-bold tracking-widest uppercase text-academic-accent">
                          {student.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Default Role Badge (Visible when not hovering) */}
                  <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-academic-accent text-[10px] font-sans uppercase font-bold tracking-wider shadow-sm flex items-center gap-1.5 border border-white group-hover:opacity-0 transition-opacity duration-300">
                    {student.role}
                  </div>
                </div>

                {/* Details container */}
                <div className="p-7 sm:p-8 flex flex-col flex-grow z-10">
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-academic-accent mb-2 group-hover:text-academic-brand transition-colors duration-500">
                    {student.name}
                  </h3>
                  
                  {student.email && (
                    <a href={`mailto:${student.email}`} className="text-sm font-bold text-academic-brand hover:underline inline-flex items-center gap-1.5 mb-2">
                      <Mail size={14} /> {student.email}
                    </a>
                  )}
                  
                  {student.achievements && (
                    <div className="mt-4 pt-5 border-t border-academic-border/50">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-academic-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Award size={12} className="text-academic-brand" strokeWidth={2.5} />
                        </div>
                        <p className="text-academic-muted text-sm font-medium leading-relaxed font-sans whitespace-pre-line group-hover:text-academic-text transition-colors duration-500">
                          {student.achievements}
                        </p>
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
