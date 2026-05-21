"use client";

import { Button } from '@/components/ui/button';

const integrations = [
  {
    name: 'Google Scholar',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
  },
  {
    name: 'LinkedIn',
    url: 'https://cdn-icons-png.flaticon.com/512/174/174857.png',
  },
  {
    name: 'ORCID',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/06/ORCID_iD.svg',
  },
  {
    name: 'ResearchGate',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/aa/ResearchGate_Logo.png',
  },
  {
    name: 'Scopus',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Scopus_logo.svg',
  },
  {
    name: 'Crossref',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Crossref_Logo_Stacked_RGB_SMALL.svg',
  },
  {
    name: 'PubMed',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/fb/US-NLM-PubMed-Logo.svg',
  },
  {
    name: 'YouTube',
    url: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
  },
  {
    name: 'Google Drive',
    url: 'https://cdn-icons-png.flaticon.com/512/5968/5968520.png',
  },
  {
    name: 'Jira',
    url: 'https://cdn-icons-png.flaticon.com/512/906/906324.png',
  },
  {
    name: 'Dropbox',
    url: 'https://cdn-icons-png.flaticon.com/512/888/888853.png',
  },
  {
    name: 'Discord',
    url: 'https://cdn-icons-png.flaticon.com/512/2111/2111370.png',
  },
];

export default function IntegrationsSection() {
  return (
    <section className="relative z-10 border-b border-academic-border bg-white py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <p className="editorial-subheading">Research Network</p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-academic-accent md:text-5xl">
            Collaboration tools for a chemistry lab that moves from paper to pilot.
          </h2>
          <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-academic-muted">
            A stronger research workflow connects literature, lab records, outreach, and startup translation without losing the scientific thread.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button asChild className="rounded-lg px-5 py-2">
              <a href="https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en" target="_blank" rel="noopener noreferrer">
                Browse Publications
              </a>
            </Button>
            <Button asChild variant="outline" className="rounded-lg px-5 py-2">
              <a href="/contact">Start Collaboration</a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="relative flex aspect-square items-center justify-center border-2 border-academic-border bg-academic-surface p-3 shadow-sm transition-colors duration-300 hover:border-academic-brand hover:bg-white"
              style={{
                clipPath:
                  'polygon(25% 0%, 75% 0%, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0% 75%, 0% 25%)',
              }}
              title={integration.name}
            >
              <img
                src={integration.url}
                alt={`${integration.name} logo`}
                className="h-10 w-10 object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
