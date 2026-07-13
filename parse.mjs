import fs from 'fs';
import * as cheerio from 'cheerio';

const content = fs.readFileSync('C:/Users/RAHUL SHARMA/.gemini/antigravity-ide/brain/aac1e36d-cb31-4d92-88cf-9f56260c4d6d/.system_generated/steps/142/content.md', 'utf8');
const $ = cheerio.load(content);

const publications = [];
$('tr.gsc_a_tr').each((i, el) => {
  const titleEl = $(el).find('a.gsc_a_at');
  const title = titleEl.text().trim();
  const link = "https://scholar.google.com" + titleEl.attr('href');
  
  const grays = $(el).find('.gs_gray');
  const authors = $(grays[0]).text().trim();
  const venue = $(grays[1]).text().trim();
  
  const year = $(el).find('.gsc_a_y .gsc_a_h').text().trim();
  
  if (title) {
    publications.push({ title, link, authors, venue, year });
  }
});

fs.writeFileSync('C:/Users/RAHUL SHARMA/Downloads/Dr. Aman Sharma/publications.json', JSON.stringify(publications, null, 2));
console.log(`Parsed ${publications.length} publications.`);
