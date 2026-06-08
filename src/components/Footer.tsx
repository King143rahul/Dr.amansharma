import { BookOpen, ExternalLink, GraduationCap, Mail, MapPin, Microscope, Network, Globe, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';


const ICON_MAP: Record<string, any> = {
  GraduationCap, BookOpen, Microscope, Network, Globe, Link: LinkIcon, Mail
};

const getIcon = (name: string) => {
  const IconComponent = ICON_MAP[name] || LinkIcon;
  return <IconComponent size={18} strokeWidth={1.8} />;
};

const QUICK_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Research', href: '/research' },
  { label: 'Startup', href: '/startup' },
  { label: 'Contact', href: '/contact' },
];

const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/amansharmaphd/',
    icon: <Network size={18} strokeWidth={1.8} />,
  },
  {
    label: 'Google Scholar',
    href: 'https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en',
    icon: <GraduationCap size={18} strokeWidth={1.8} />,
  },
  {
    label: 'ORCID',
    href: 'https://orcid.org/0000-0001-5024-292X',
    icon: <BookOpen size={18} strokeWidth={1.8} />,
  },
  {
    label: 'S-VYASA Profile',
    href: 'https://www.svyasa.edu.in/school-of-science-and-humanities.php',
    icon: <Microscope size={18} strokeWidth={1.8} />,
  },
];

export const Footer = () => {
  const [name, setName] = useState("Dr Aman Sharma, MRSC");
  const [socialLinks, setSocialLinks] = useState(SOCIAL_LINKS);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const { data } = await db
          .from('general_settings')
          .select('name,footerNameStyle,socialLinks')
          .eq('id', 'settings')
          .single();
        if (data && data.name) {
          setName(data.name);
          if (data.socialLinks && data.socialLinks.length > 0) {
            setSocialLinks(data.socialLinks);
          }
        }
      } catch (err) {
        console.error("Error fetching name for footer:", err);
      }
    };
    fetchName();

    const channel = db
      .channel('footer_name_changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'general_settings', filter: 'id=eq.settings' },
        (payload) => {
          const data = payload.new as any;
          if (data && data.name) {
            setName(data.name);
            if (data.socialLinks) setSocialLinks(data.socialLinks);
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const displayName = name
    .replace(/\bsharma\b/gi, 'Sharma')
    .replace(/\bMSRC\b/g, 'MRSC')
    .replace(/\s+,/g, ',')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const copyrightName = displayName
    .replace(/\s*,?\s*MRSC\b/gi, '')
    .replace(/^Dr\.?\s+/i, '')
    .trim();

  return (
    <footer className="relative z-10 border-t border-academic-border bg-academic-accent text-white font-sans">
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-4 lg:grid-cols-[1.35fr_0.75fr_1fr] lg:gap-8 lg:px-8 lg:py-6">
        <div>
          <div className="mb-3 text-2xl font-serif font-bold leading-none">{displayName}</div>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/80 sm:flex-row sm:flex-wrap">
            <a
              href="mailto:AmanSharmaphd@gmail.com"
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail size={16} />
              AmanSharmaphd@gmail.com
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} />
              Bengaluru, Karnataka
            </span>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/60">Explore</h2>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 lg:grid lg:gap-3" aria-label="Footer navigation">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-base font-semibold text-white/80 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/60">Academic Profiles</h2>
          <div className="grid grid-cols-2 gap-2 lg:gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-between gap-2 border border-white/15 bg-white/5 px-2 py-2 lg:px-3 lg:py-2.5 text-xs font-bold uppercase tracking-wider text-white/85 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <span className="inline-flex items-center gap-2 truncate">
                  {typeof link.icon === "string" ? getIcon(link.icon) : link.icon}
                  <span className="truncate">{link.label}</span>
                </span>
                <ExternalLink size={12} className="hidden lg:block shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl justify-center px-6 py-4 text-center text-sm font-semibold text-white/60 lg:px-8">
          <p>&copy; {new Date().getFullYear()} {copyrightName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
