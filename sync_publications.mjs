import { chromium } from 'playwright';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

// Note: Replace these with your actual Supabase credentials if running outside the project context
const supabaseUrl = 'https://miyracycsbuwybicljpo.supabase.co';
const supabaseAnonKey = 'sb_publishable_uxXgnPU8WMRZYSqSZDtXxg_nrEqIs1P';
const db = createClient(supabaseUrl, supabaseAnonKey);

const SCHOLAR_URL = 'https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en';

async function fetchAbstract(title) {
  try {
    const encodedTitle = encodeURIComponent(title);
    const res = await fetch(`https://api.crossref.org/works?query.title=${encodedTitle}`);
    if (!res.ok) return '';
    const data = await res.json();
    
    if (data.message && data.message.items && data.message.items.length > 0) {
      // Find the closest match (CrossRef sometimes returns inexact matches)
      const item = data.message.items[0];
      const matchTitle = item.title ? item.title[0].toLowerCase() : '';
      
      // If titles somewhat match or it's the top result
      if (matchTitle.includes(title.toLowerCase().substring(0, 15))) {
        let abstract = item.abstract || '';
        // Strip JATS XML tags if present
        abstract = abstract.replace(/<[^>]+>/g, '').trim();
        return abstract;
      }
    }
  } catch (err) {
    console.error(`Error fetching abstract for "${title}":`, err.message);
  }
  return '';
}

(async () => {
  console.log('Starting sync process...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('Navigating to Google Scholar...');
  await page.goto(SCHOLAR_URL, { waitUntil: 'networkidle' });

  // Click "Show more" until it's disabled to get ALL research
  console.log('Expanding all publications...');
  let showMoreButton = page.locator('#gsc_bpf_more');
  while (await showMoreButton.isVisible()) {
    const disabled = await showMoreButton.getAttribute('disabled');
    if (disabled !== null) {
      break;
    }
    await showMoreButton.click();
    await page.waitForTimeout(1500); // wait for results to load
  }

  console.log('Scraping publications...');
  const rawPublications = await page.evaluate(() => {
    const rows = document.querySelectorAll('tr.gsc_a_tr');
    const results = [];
    rows.forEach(row => {
      const titleEl = row.querySelector('a.gsc_a_at');
      if (!titleEl) return;
      const title = titleEl.innerText;
      const link = "https://scholar.google.com" + titleEl.getAttribute('href');
      
      const grays = row.querySelectorAll('.gs_gray');
      const authors = grays.length > 0 ? grays[0].innerText : "";
      const venue = grays.length > 1 ? grays[1].innerText : "";
      
      const yearEl = row.querySelector('.gsc_a_y .gsc_a_h');
      const year = yearEl ? yearEl.innerText : "";
      
      results.push({ title, link, authors, venue, year });
    });
    return results;
  });

  await browser.close();

  console.log(`Found ${rawPublications.length} publications. Fetching abstracts...`);

  const enrichedPublications = [];
  for (let i = 0; i < rawPublications.length; i++) {
    const pub = rawPublications[i];
    console.log(`[${i+1}/${rawPublications.length}] Fetching abstract for: ${pub.title.substring(0, 50)}...`);
    const abstract = await fetchAbstract(pub.title);
    enrichedPublications.push({
      ...pub,
      summary: abstract
    });
    // Add a small delay to avoid hitting rate limits
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('Clearing old publications from Supabase...');
  // Since we don't know the exact IDs, we'll fetch them all and delete them
  const { data: existingData } = await db.from('publications').select('id');
  if (existingData && existingData.length > 0) {
    const idsToDelete = existingData.map(p => p.id);
    const chunkSize = 100;
    for (let i = 0; i < idsToDelete.length; i += chunkSize) {
      const chunk = idsToDelete.slice(i, i + chunkSize);
      await db.from('publications').delete().in('id', chunk);
    }
  }

  console.log('Inserting new publications to Supabase...');
  const { data: insertedData, error: insertError } = await db
    .from('publications')
    .insert(enrichedPublications)
    .select('id, title'); // Fetch IDs and titles to map order

  if (insertError) {
    console.error('Error inserting publications:', insertError);
    return;
  }

  console.log('Generating order file...');
  // Map the exact Google Scholar order using the inserted data's UUIDs
  const publicationOrder = [];
  rawPublications.forEach(rp => {
    const matchedPub = insertedData.find(idData => idData.title === rp.title);
    if (matchedPub) {
      publicationOrder.push(matchedPub.id);
    }
  });

  const dataDir = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const orderFilePath = path.join(dataDir, 'publicationOrder.json');
  fs.writeFileSync(orderFilePath, JSON.stringify(publicationOrder, null, 2));
  
  console.log(`Success! Wrote ${publicationOrder.length} publication IDs to src/data/publicationOrder.json`);
  console.log('Sync complete.');
})();
