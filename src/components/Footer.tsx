import { BookOpen, ExternalLink, GraduationCap, Mail, MapPin, Microscope, Network } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  return (
    <footer className="relative z-10 border-t border-academic-border bg-academic-accent text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 lg:grid-cols-[1.35fr_0.75fr_1fr] lg:px-8">
        <div>
          <div className="mb-4 font-serif text-3xl font-bold">Dr. Aman Sharma</div>
          <p className="max-w-xl text-base font-medium leading-relaxed text-white/80">
            Assistant Professor of Chemistry in Bengaluru, materials chemist, MRSC, and founder of AMSH Endeavours, working across green chemistry, nanotechnology, wastewater remediation, and waste-to-wealth research.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm font-bold uppercase tracking-wider text-white/80 sm:flex-row sm:flex-wrap">
            <a
              href="mailto:amansharmapdh@gmail.com"
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
            >
              <Mail size={16} />
              amansharmapdh@gmail.com
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin size={16} />
              Bengaluru, Karnataka
            </span>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-white/60">Explore</h2>
          <nav className="grid gap-3" aria-label="Footer navigation">
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
          <div className="grid gap-3">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-between gap-4 border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold uppercase tracking-wider text-white/85 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                <span className="inline-flex items-center gap-3">
                  {link.icon}
                  {link.label}
                </span>
                <ExternalLink size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-sm font-semibold text-white/60 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>&copy; {new Date().getFullYear()} Dr. Aman Sharma. All rights reserved.</p>
          <p>Founder, AMSH Endeavours | S-VYASA University Bengaluru</p>
        </div>
      </div>
    </footer>
  );
};
