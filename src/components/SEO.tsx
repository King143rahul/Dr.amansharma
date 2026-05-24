import { useEffect } from 'react';
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
    title: 'Dr. Aman Sharma, PhD | Chemistry Professor in Bengaluru | Founder, AMSH Endeavours',
    description:
      'Dr. Aman Sharma, PhD, is an Assistant Professor of Chemistry at S-VYASA University Bengaluru, MRSC, materials chemist, and founder of AMSH Endeavours working on green chemistry, nanotechnology, wastewater remediation, biomass valorisation, and waste-to-wealth research.',
    keywords:
      'Dr Aman Sharma, Aman Sharma PhD, chemistry professor in Bangalore, chemistry professor in Bengaluru, best chemistry professor in Bangalore, best chemistry professor in banglore, S-VYASA University chemistry, AMSH Endeavours founder, materials chemistry, green chemistry, nanotechnology, wastewater remediation, biomass valorisation, waste to wealth, environmental chemistry, MRSC',
    canonical: `${SITE_URL}/`,
  },
  '/research': {
    title: 'Research | Dr. Aman Sharma | Green Chemistry, Nanotechnology & Wastewater Remediation',
    description:
      'Explore Dr. Aman Sharma’s research in materials chemistry, biomass-derived carbon materials, nanotechnology, dye degradation, membrane technology, wastewater remediation, supercapacitors, and sustainable environmental chemistry.',
    keywords:
      'Aman Sharma research, green chemistry research Bangalore, nanotechnology researcher Bengaluru, wastewater remediation chemistry, biomass carbon materials, dye degradation, carbon nanomaterials, environmental chemistry publications, S-VYASA chemistry research',
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
      'View highlights from Dr. Aman Sharma’s academic work, chemistry teaching, research labs, conferences, workshops, awards, and scientific events.',
    keywords:
      'Dr Aman Sharma gallery, chemistry conferences Bangalore, S-VYASA chemistry events, research labs, teaching sessions, scientific events',
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
      jobTitle: 'Assistant Professor of Chemistry',
      description:
        'Assistant Professor of Chemistry at S-VYASA University Bengaluru, materials chemist, MRSC, and founder of AMSH Endeavours.',
      email: 'mailto:amansharmapdh@gmail.com',
      image: IMAGE_URL,
      url: SITE_URL,
      sameAs: [
        'https://www.linkedin.com/in/amansharmaphd/',
        'https://orcid.org/0000-0001-5024-292X',
        'https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en',
        'https://www.svyasa.edu.in/school-of-science-and-humanities.php',
      ],
      affiliation: {
        '@type': 'CollegeOrUniversity',
        name: 'S-VYASA University',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bengaluru',
          addressRegion: 'Karnataka',
          addressCountry: 'IN',
        },
      },
      workLocation: {
        '@type': 'Place',
        name: 'Bengaluru, Karnataka, India',
      },
      knowsAbout: [
        'Materials Chemistry',
        'Green Chemistry',
        'Nanotechnology',
        'Wastewater Remediation',
        'Waste to Wealth',
        'Biomass Valorisation',
        'Pollutant Degradation',
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
      '@type': 'WebPage',
      '@id': `${seo.canonical}#webpage`,
      url: seo.canonical,
      name: seo.title,
      description: seo.description,
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Dr. Aman Sharma',
        url: SITE_URL,
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
    const seo = SEO_BY_PATH[pathname] ?? SEO_BY_PATH['/'];

    document.title = seo.title;
    setCanonical(seo.canonical);
    setMeta('meta[name="description"]', 'content', seo.description);
    setMeta('meta[name="keywords"]', 'content', seo.keywords);
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
  }, [pathname]);

  return null;
};
