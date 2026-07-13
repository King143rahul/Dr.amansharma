import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://scholar.google.com/citations?user=qVwMtGEAAAAJ&hl=en', { waitUntil: 'networkidle' });

  // Click "Show more" until it's disabled to get ALL research
  let showMoreButton = page.locator('#gsc_bpf_more');
  while (await showMoreButton.isVisible()) {
    const disabled = await showMoreButton.getAttribute('disabled');
    if (disabled !== null) {
      break;
    }
    await showMoreButton.click();
    await page.waitForTimeout(1000); // wait for results to load
  }

  const publications = await page.evaluate(() => {
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

  fs.writeFileSync('./publications.json', JSON.stringify(publications, null, 2));
  console.log(`Successfully scraped ${publications.length} publications.`);
  
  await browser.close();
})();
