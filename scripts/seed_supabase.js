import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = 'postgresql://postgres:1YnynPyptgaU4x9g@db.miyracycsbuwybicljpo.supabase.co:5432/postgres';

async function seed() {
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to Supabase PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Creating database tables...');

    // 1. general_settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS general_settings (
        id text PRIMARY KEY DEFAULT 'settings',
        "heroSubtitle" text,
        "heroRoles" text,
        "heroDesc" text,
        "aboutSubheading" text
      );
    `);

    // Insert default settings
    await client.query(`
      INSERT INTO general_settings (id, "heroSubtitle", "heroRoles", "heroDesc", "aboutSubheading")
      VALUES (
        'settings',
        'Sustainability Innovator & Researcher',
        'Assistant Professor of Chemistry in Bengaluru (Bangalore) | Materials Chemist | Founder, AMSH Endeavours',
        'Transforming bio-waste into advanced functional materials for sustainable water treatment and environmental remediation at the intersection of nanotechnology and green chemistry.',
        'Pioneering the intersection of nanotechnology and green chemistry.'
      ) ON CONFLICT (id) DO NOTHING;
    `);

    // 2. biography
    await client.query(`
      CREATE TABLE IF NOT EXISTS biography (
        id text PRIMARY KEY DEFAULT 'about',
        text text
      );
    `);

    // Insert default bio text if empty
    await client.query(`
      INSERT INTO biography (id, text)
      VALUES (
        'about',
        'Dr. Aman Sharma, PhD, is an Assistant Professor of Chemistry at S-VYASA University Bengaluru, and a materials chemist working on green chemistry, nanotechnology, wastewater remediation, and waste-to-wealth research. He is the founder of AMSH Endeavours, a government-grant supported startup focused on eco-friendly water treatment solutions.'
      ) ON CONFLICT (id) DO NOTHING;
    `);

    // 3. research_interests
    await client.query(`
      CREATE TABLE IF NOT EXISTS research_interests (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        text text NOT NULL
      );
    `);

    // Seed default research interests if empty
    const { rows: currentInterests } = await client.query('SELECT count(*) FROM research_interests');
    if (parseInt(currentInterests[0].count) === 0) {
      console.log('Seeding default research interests...');
      const defaultInterests = [
        'Materials Chemistry',
        'Nanotechnology',
        'Environmental Sustainability',
        'Water Treatment',
        'Membrane Technology',
        'Waste-to-Wealth Approach',
        'Carbon Functional Materials',
        'Wastewater Remediation'
      ];
      for (const interest of defaultInterests) {
        await client.query('INSERT INTO research_interests (text) VALUES ($1)', [interest]);
      }
    }

    // 4. startup
    await client.query(`
      CREATE TABLE IF NOT EXISTS startup (
        id text PRIMARY KEY DEFAULT 'section',
        title text,
        description text,
        "externalLinks" jsonb DEFAULT '[]'::jsonb
      );
    `);

    // Insert default startup settings
    await client.query(`
      INSERT INTO startup (id, title, description, "externalLinks")
      VALUES (
        'section',
        'AMSH Endeavours',
        'A government grant-supported startup dedicated to developing eco-friendly and cost-efficient wastewater treatment solutions.',
        '[]'::jsonb
      ) ON CONFLICT (id) DO NOTHING;
    `);

    // 5. teaching_courses
    await client.query(`
      CREATE TABLE IF NOT EXISTS teaching_courses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text
      );
    `);

    // 6. publications
    await client.query(`
      CREATE TABLE IF NOT EXISTS publications (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        authors text,
        venue text,
        year text,
        link text
      );
    `);

    // 7. media_gallery
    await client.query(`
      CREATE TABLE IF NOT EXISTS media_gallery (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        url text NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    console.log('Tables created successfully!');
    console.log('Configuring Row Level Security (RLS) and policies...');

    // Enable RLS
    const tables = ['general_settings', 'biography', 'research_interests', 'startup', 'teaching_courses', 'publications', 'media_gallery'];
    for (const table of tables) {
      await client.query(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`).catch(() => {});
      
      // Drop and recreate RLS policies to be fully idempotent
      await client.query(`DROP POLICY IF EXISTS "Allow public read access to ${table}" ON ${table};`).catch(() => {});
      await client.query(`CREATE POLICY "Allow public read access to ${table}" ON ${table} FOR SELECT USING (true);`);

      await client.query(`DROP POLICY IF EXISTS "Allow auth write access to ${table}" ON ${table};`).catch(() => {});
      await client.query(`CREATE POLICY "Allow auth write access to ${table}" ON ${table} FOR ALL TO authenticated USING (true) WITH CHECK (true);`);
    }

    console.log('RLS and Policies configured successfully!');

    // Read publications.json
    const jsonPath = path.join(__dirname, '../src/publications.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const publications = JSON.parse(rawData);

    console.log(`Found ${publications.length} publications to import.`);

    // Clear existing publications first to avoid duplicates
    console.log('Clearing any existing publications...');
    await client.query('DELETE FROM publications');

    // Batch insert publications
    console.log('Inserting publications...');
    for (const pub of publications) {
      await client.query(
        'INSERT INTO publications (title, authors, venue, year, link) VALUES ($1, $2, $3, $4, $5)',
        [pub.title, pub.authors, pub.venue, pub.year, pub.link]
      );
    }

    console.log('Database setup and seeding completed successfully!');
  } catch (err) {
    console.error('Error during database setup/seeding:', err);
  } finally {
    await client.end();
  }
}

seed();
