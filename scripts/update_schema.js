import pg from 'pg';

const connectionString = 'postgresql://postgres:1YnynPyptgaU4x9g@db.miyracycsbuwybicljpo.supabase.co:5432/postgres';

async function updateSchema() {
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database to apply schema updates...');
    await client.connect();
    console.log('Connected successfully!');

    // 1. Create contact_submissions table
    console.log('Creating contact_submissions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        email text NOT NULL,
        message text NOT NULL,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);

    // Enable RLS on submissions
    await client.query(`ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;`).catch(() => {});
    
    // Drop and recreate RLS policies
    await client.query(`DROP POLICY IF EXISTS "Allow public insert to contact_submissions" ON contact_submissions;`).catch(() => {});
    await client.query(`CREATE POLICY "Allow public insert to contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);`);

    await client.query(`DROP POLICY IF EXISTS "Allow auth read/delete to contact_submissions" ON contact_submissions;`).catch(() => {});
    await client.query(`CREATE POLICY "Allow auth read/delete to contact_submissions" ON contact_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);`);

    console.log('contact_submissions table and security policies configured!');

    // 2. Add columns to general_settings if they do not exist
    console.log('Adding stats and contact columns to general_settings table...');
    
    const columns = [
      { name: 'experienceValue', type: 'text', defaultVal: "'7+'" },
      { name: 'patentsValue', type: 'text', defaultVal: "'Multiple'" },
      { name: 'publicationsValue', type: 'text', defaultVal: "'15+'" },
      { name: 'grantsValue', type: 'text', defaultVal: "'2'" },
      { name: 'conferencesValue', type: 'text', defaultVal: "'10+'" },
      { name: 'contactEmail', type: 'text', defaultVal: "'amansharmapdh@gmail.com'" },
      { name: 'contactLinkedIn', type: 'text', defaultVal: "'https://www.linkedin.com/in/amansharmaphd/'" },
      { name: 'contactOrcid', type: 'text', defaultVal: "'https://orcid.org/0000-0000-0000-0000'" },
      { name: 'contactWhatsApp', type: 'text', defaultVal: "''" }
    ];

    for (const col of columns) {
      await client.query(`
        ALTER TABLE general_settings 
        ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type} DEFAULT ${col.defaultVal};
      `).catch(err => console.log(`Notice: Column ${col.name} already exists or error:`, err.message));
    }

    // Initialize existing default values if settings row exists
    await client.query(`
      UPDATE general_settings 
      SET 
        "experienceValue" = COALESCE("experienceValue", '7+'),
        "patentsValue" = COALESCE("patentsValue", 'Multiple'),
        "publicationsValue" = COALESCE("publicationsValue", '15+'),
        "grantsValue" = COALESCE("grantsValue", '2'),
        "conferencesValue" = COALESCE("conferencesValue", '10+'),
        "contactEmail" = COALESCE("contactEmail", 'amansharmapdh@gmail.com'),
        "contactLinkedIn" = COALESCE("contactLinkedIn", 'https://www.linkedin.com/in/amansharmaphd/'),
        "contactOrcid" = COALESCE("contactOrcid", 'https://orcid.org/0000-0000-0000-0000'),
        "contactWhatsApp" = COALESCE("contactWhatsApp", '')
      WHERE id = 'settings';
    `);

    console.log('Fixing storage bucket RLS policies in the storage schema...');
    // Create bucket policies directly in storage.objects if bucket exists
    // This allows authenticated uploads to 'Photos' bucket
    await client.query(`
      CREATE POLICY "Allow public select to Photos" ON storage.objects 
      FOR SELECT TO public USING (bucket_id = 'Photos');
    `).catch(() => console.log('Public select policy already exists.'));

    await client.query(`
      CREATE POLICY "Allow auth insert to Photos" ON storage.objects 
      FOR INSERT TO authenticated WITH CHECK (bucket_id = 'Photos');
    `).catch(() => console.log('Auth insert policy already exists.'));

    await client.query(`
      CREATE POLICY "Allow auth delete from Photos" ON storage.objects 
      FOR DELETE TO authenticated USING (bucket_id = 'Photos');
    `).catch(() => console.log('Auth delete policy already exists.'));

    console.log('Database updates completed successfully!');
  } catch (err) {
    console.error('Error during schema updates:', err);
  } finally {
    await client.end();
  }
}

updateSchema();
