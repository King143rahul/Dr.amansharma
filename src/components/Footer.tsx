import { BookOpen, GraduationCap, Mail, MapPin, Microscope, Network, Globe, Link as LinkIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../lib/supabase';

const LinkedinIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z" />
  </svg>
);

const OrcidIcon = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 32 32" 
    fill="currentColor" 
    className={className}
  >
    <path d="M16 0C7.161 0 0 7.161 0 16s7.161 16 16 16 16-7.161 16-16S24.839 0 16 0M9.823 5.839c.704 0 1.265.573 1.265 1.26s-.561 1.265-1.265 1.265a1.27 1.27 0 0 1-1.26-1.265c0-.697.563-1.26 1.26-1.26m-.959 4.046h1.923v13.391H8.864zm4.751 0h5.197c4.948 0 7.125 3.541 7.125 6.703 0 3.439-2.687 6.699-7.099 6.699h-5.224zm1.921 1.74v9.927h3.063c4.365 0 5.365-3.312 5.365-4.964 0-2.687-1.713-4.963-5.464-4.963z"/>
  </svg>
);

const ICON_MAP: Record<string, any> = {
  GraduationCap, BookOpen, Microscope, Network, Globe, Link: LinkIcon, Mail, Linkedin: LinkedinIcon, Orcid: OrcidIcon
};

const getIcon = (name: string) => {
  const IconComponent = ICON_MAP[name] || LinkIcon;
  return <IconComponent size={22} strokeWidth={1.8} />;
};



const SOCIAL_LINKS = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/amansharmaphd/',
    icon: <LinkedinIcon size={22} />,
  },
  {
    label: 'Google Scholar',
    href: 'https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en',
    icon: <GraduationCap size={22} strokeWidth={1.8} />,
  },
  {
    label: 'ORCID',
    href: 'https://orcid.org/0000-0001-5024-292X',
    icon: <OrcidIcon size={22} />,
  },
];

export const Footer = () => {
  const [name, setName] = useState("Dr Aman Sharma, MRSC");
  const [socialLinks, setSocialLinks] = useState(SOCIAL_LINKS);

  const cleanSocialLinks = (links: any[]) => {
    if (!links) return [];
    return links
      .filter((link: any) => link && link.label && !link.label.toLowerCase().includes('vyasa'))
      .map((link: any) => {
        if (link.label && link.label.toLowerCase().includes('linkedin')) {
          return { ...link, icon: 'Linkedin' };
        }
        if (link.label && link.label.toLowerCase().includes('orcid')) {
          return { ...link, icon: 'Orcid' };
        }
        return link;
      });
  };

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
            setSocialLinks(cleanSocialLinks(data.socialLinks));
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
            if (data.socialLinks) {
              setSocialLinks(cleanSocialLinks(data.socialLinks));
            }
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
      <div className="mx-auto flex flex-col sm:flex-row items-center justify-between max-w-7xl gap-4 px-4 py-4 sm:py-5">
        <div className="text-center sm:text-left">
          <div className="text-2xl sm:text-3xl font-serif font-bold leading-none">{displayName}</div>
          <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs sm:text-sm text-white/70">
            <a
              href="mailto:amansharmaphd@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <Mail size={14} />
              amansharmaphd@gmail.com
            </a>
            <span className="inline-flex items-center gap-1">
              <MapPin size={14} />
              Bengaluru, Karnataka
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 hover:text-white hover:scale-110 transition-all p-1"
              title={link.label}
              aria-label={link.label}
            >
              {typeof link.icon === "string" ? getIcon(link.icon) : link.icon}
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto text-center px-4 py-2.5 text-[10px] sm:text-xs font-medium text-white/50">
          &copy; {new Date().getFullYear()} {copyrightName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
