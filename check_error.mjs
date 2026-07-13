import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE EXCEPTION:', error.message);
  });

  console.log('Navigating to http://localhost:5173/admin/bio...');
  await page.goto('http://localhost:5173/admin/bio', { waitUntil: 'networkidle' }).catch(e => console.log('Goto error:', e.message));
  
  console.log('Waiting 2 seconds...');
  await new Promise(r => setTimeout(r, 2000));
  
  await browser.close();
  console.log('Done.');
})();
