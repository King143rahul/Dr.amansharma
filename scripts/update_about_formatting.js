import pg from 'pg';

const connectionString = 'postgresql://postgres:1YnynPyptgaU4x9g@db.miyracycsbuwybicljpo.supabase.co:5432/postgres';

async function main() {
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected!');

    // 1. Update general_settings aboutSubheading with HTML
    console.log('Updating aboutSubheading with rich HTML formatting...');
    await client.query(`
      UPDATE general_settings
      SET "aboutSubheading" = 'Pioneering the intersection of <span class="text-academic-brand italic">nanotechnology</span> and green chemistry.'
      WHERE id = 'settings';
    `);

    // 2. Update biography with rich HTML paragraphs
    console.log('Updating biography with original paragraphs and typography tags...');
    const bioText = [
      'Dr. Aman Sharma is a materials chemist and educator dedicated to environmental sustainability. Serving as an Assistant Professor of Chemistry at the School of Science & Humanities, S-VYASA University Bengaluru, his research focuses on transforming bio-waste into advanced functional materials for water treatment and environmental remediation.',
      'Operating at the intersection of nanotechnology and green chemistry, Dr. Sharma develops scalable, cost-effective wastewater solutions. He is the founder of <strong class="text-academic-accent font-semibold">AMSH Endeavours</strong>, a government grant-supported start-up designed to bridge the gap between academic research and real-world environmental applications. His work has resulted in multiple patents and high-impact publications focused on a "waste-to-wealth" approach.',
      'With over seven years of academic experience, Dr. Sharma is an active member of the Royal Society of Chemistry (RSC). He contributes to the broader scientific community by organizing conferences, securing government research grants, and conducting training outreach for fellow educators.',
      'Outside the laboratory and the lecture hall, Dr. Sharma values multidisciplinary collaboration and impactful science communication. He unwinds through cooking, badminton, and Netflix, maintaining a balanced approach to a rigorous academic career.'
    ].join('\n\n');

    await client.query(`
      UPDATE biography
      SET text = $1
      WHERE id = 'about';
    `, [bioText]);

    console.log('Database updated successfully!');
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();
