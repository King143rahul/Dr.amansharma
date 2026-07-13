import { useEffect } from 'react';
import { db } from '../lib/supabase';
import { useLocation } from 'react-router-dom';

const SITE_URL = 'https://amansharmaphd.com';
const IMAGE_URL = `${SITE_URL}/aman-sharma-photo.png`;

type SeoConfig = {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
};

const SEO_BY_PATH: Record<string, SeoConfig> = {
  '/': {
    title: 'Dr. Aman Sharma, PhD | Materials Chemist & Chemistry Professor in Bengaluru',
    description:
      'Dr. Aman Sharma, PhD, is an Assistant Professor of Chemistry in Bengaluru, materials chemist, Royal Society of Chemistry member, and founder of AMSH Endeavours.',
    keywords:
      'Dr Aman Sharma, Aman Sharma PhD, chemistry professor in Bengaluru, chemistry professor in Bangalore, AMSH Endeavours founder, materials chemistry, green chemistry, nanotechnology, wastewater remediation, biomass valorisation, waste to wealth, environmental chemistry',
    canonical: `${SITE_URL}/`,
  },
  '/research': {
    title: 'Research | Dr. Aman Sharma | Green Chemistry, Nanotechnology & Wastewater Remediation',
    description:
      "Explore Dr. Aman Sharma's research in materials chemistry, biomass-derived carbon materials, nanotechnology, dye degradation, membrane technology, wastewater remediation, hydrogen materials, and sustainable environmental chemistry.",
    keywords:
      'Aman Sharma research, green chemistry research Bangalore, nanotechnology researcher Bengaluru, wastewater remediation chemistry, biomass carbon materials, hydrogen production materials, carbon nanomaterials, environmental chemistry publications',
    canonical: `${SITE_URL}/research`,
  },
  '/startup': {
    title: 'AMSH Endeavours | Founder Dr. Aman Sharma | Wastewater Treatment Startup',
    description:
      'AMSH Endeavours is a government grant-supported startup founded by Dr. Aman Sharma to develop eco-friendly, cost-efficient wastewater treatment and environmental remediation solutions.',
    keywords:
      'AMSH Endeavours, AMSH Endeavours founder, Dr Aman Sharma startup, wastewater treatment startup Bangalore, environmental startup Bengaluru, sustainable water treatment, eco friendly wastewater solutions',
    canonical: `${SITE_URL}/startup`,
  },
  '/gallery': {
    title: 'Gallery | Dr. Aman Sharma | Chemistry Research, Teaching & Conferences',
    description:
      "View highlights from Dr. Aman Sharma's academic work, chemistry teaching, research labs, conferences, workshops, awards, and scientific events.",
    keywords:
      'Dr Aman Sharma gallery, chemistry conferences Bangalore, research labs, teaching sessions, scientific events',
    canonical: `${SITE_URL}/gallery`,
  },
  '/contact': {
    title: 'Contact Dr. Aman Sharma | Chemistry Professor in Bengaluru',
    description:
      'Contact Dr. Aman Sharma for research collaborations, chemistry consulting, wastewater remediation projects, academic speaking, AMSH Endeavours, and green chemistry partnerships in Bengaluru.',
    keywords:
      'contact Dr Aman Sharma, Aman Sharma email, chemistry professor contact Bangalore, Bengaluru chemistry consultant, green chemistry collaboration, AMSH Endeavours contact',
    canonical: `${SITE_URL}/contact`,
  },
};

const setMeta = (selector: string, attribute: string, value: string) => {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
};

const setCanonical = (href: string) => {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = href;
};

const buildSchema = (seo: SeoConfig, path: string) => ({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Dr. Aman Sharma',
      honorificPrefix: 'Dr.',
      givenName: 'Aman',
      familyName: 'Sharma',
      jobTitle: 'Chemistry Professor',
      description:
        'Chemistry Professor in Bengaluru, materials chemist, Royal Society of Chemistry member, and founder of AMSH Endeavours.',
      email: 'mailto:AmanSharmaphd@gmail.com',
      image: IMAGE_URL,
      url: SITE_URL,
      sameAs: [
        'https://www.linkedin.com/in/amansharmaphd/',
        'https://orcid.org/0000-0001-5024-292X',
        'https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en'
      ],
      knowsAbout: [
        'Materials Chemistry',
        'Green Chemistry',
        'Nanotechnology',
        'Wastewater Remediation',
        'Hydrogen Production Materials',
        'Waste to Wealth',
        'Biomass Valorisation',
        'Environmental Chemistry',
        'Carbon Nanomaterials',
        'Membrane Technology',
      ],
      memberOf: {
        '@type': 'Organization',
        name: 'Royal Society of Chemistry',
      },
      founder: {
        '@type': 'Organization',
        name: 'AMSH Endeavours',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#amsh`,
      name: 'AMSH Endeavours',
      founder: {
        '@id': `${SITE_URL}/#person`,
      },
      description:
        'Government grant-supported startup focused on eco-friendly and cost-efficient wastewater treatment solutions.',
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Dr. Aman Sharma',
      url: SITE_URL,
      publisher: {
        '@id': `${SITE_URL}/#person`,
      },
    },
    {
      '@type': 'WebPage',
      '@id': `${seo.canonical}#webpage`,
      url: seo.canonical,
      name: seo.title,
      description: seo.description,
      isPartOf: {
        '@id': `${SITE_URL}/#website`,
      },
      about: {
        '@id': `${SITE_URL}/#person`,
      },
      primaryImageOfPage: {
        '@type': 'ImageObject',
        url: IMAGE_URL,
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${SITE_URL}/`,
          },
          ...(path === '/'
            ? []
            : [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: seo.title.split('|')[0].trim(),
                  item: seo.canonical,
                },
              ]),
        ],
      },
    },
  ],
});

export const SEO = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    let active = true;
    
    const updateTags = (seo: SeoConfig) => {
      document.title = seo.title;
      setCanonical(seo.canonical);
      setMeta('meta[name="description"]', 'content', seo.description);
      setMeta('meta[name="keywords"]', 'content', seo.keywords);
      setMeta('meta[name="robots"]', 'content', pathname.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
      setMeta('meta[property="og:title"]', 'content', seo.title);
      setMeta('meta[property="og:description"]', 'content', seo.description);
      setMeta('meta[property="og:url"]', 'content', seo.canonical);
      setMeta('meta[property="og:image"]', 'content', IMAGE_URL);
      setMeta('meta[name="twitter:title"]', 'content', seo.title);
      setMeta('meta[name="twitter:description"]', 'content', seo.description);
      setMeta('meta[name="twitter:image"]', 'content', IMAGE_URL);

      const schema = document.head.querySelector<HTMLScriptElement>('#route-schema');
      if (schema) {
        schema.textContent = JSON.stringify(buildSchema(seo, pathname));
      }
    };

    const fetchDynamicSEO = async () => {
      const defaultSeo = SEO_BY_PATH[pathname] ?? SEO_BY_PATH['/'];
      updateTags(defaultSeo); // apply defaults instantly
      
      const { data, error } = await db.from('general_settings').select('seoTitle, seoDescription, seoKeywords').eq('id', 'settings').single();
      if (!error && data && active) {
        const dynamicSeo = {
          ...defaultSeo,
          title: data.seoTitle?.trim() || defaultSeo.title,
          description: data.seoDescription?.trim() || defaultSeo.description,
          keywords: data.seoKeywords?.trim() || defaultSeo.keywords,
        };
        updateTags(dynamicSeo);
      }
    };

    fetchDynamicSEO();

    return () => {
      active = false;
    };
  }, [pathname]);

  return null;
};
