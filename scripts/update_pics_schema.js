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

    // 1. Add profilePicUrl to general_settings if not exists
    console.log('Adding "profilePicUrl" column to general_settings...');
    await client.query(`
      ALTER TABLE general_settings
      ADD COLUMN IF NOT EXISTS "profilePicUrl" text DEFAULT '';
    `).catch(err => console.log('profilePicUrl column notice:', err.message));

    // 2. Add photoUrl to startup if not exists
    console.log('Adding "photoUrl" column to startup...');
    await client.query(`
      ALTER TABLE startup
      ADD COLUMN IF NOT EXISTS "photoUrl" text DEFAULT '';
    `).catch(err => console.log('photoUrl column notice:', err.message));

    // 3. Recreate storage RLS policies with fully permissive scopes for the public 'Photos' bucket
    console.log('Configuring permissive storage policies for the "Photos" bucket...');
    
    // Drop existing policies
    await client.query(`DROP POLICY IF EXISTS "Allow public select to Photos" ON storage.objects;`).catch(() => {});
    await client.query(`DROP POLICY IF EXISTS "Allow auth insert to Photos" ON storage.objects;`).catch(() => {});
    await client.query(`DROP POLICY IF EXISTS "Allow auth delete from Photos" ON storage.objects;`).catch(() => {});
    await client.query(`DROP POLICY IF EXISTS "Allow public insert to Photos" ON storage.objects;`).catch(() => {});
    await client.query(`DROP POLICY IF EXISTS "Allow public update to Photos" ON storage.objects;`).catch(() => {});
    await client.query(`DROP POLICY IF EXISTS "Allow public delete from Photos" ON storage.objects;`).catch(() => {});

    // Create new highly permissive storage policies
    await client.query(`
      CREATE POLICY "Allow public select to Photos" ON storage.objects 
      FOR SELECT USING (bucket_id = 'Photos');
    `);

    await client.query(`
      CREATE POLICY "Allow public insert to Photos" ON storage.objects 
      FOR INSERT WITH CHECK (bucket_id = 'Photos');
    `);

    await client.query(`
      CREATE POLICY "Allow public update to Photos" ON storage.objects 
      FOR UPDATE USING (bucket_id = 'Photos') WITH CHECK (bucket_id = 'Photos');
    `);

    await client.query(`
      CREATE POLICY "Allow public delete from Photos" ON storage.objects 
      FOR DELETE USING (bucket_id = 'Photos');
    `);

    console.log('Database updates successfully applied!');
  } catch (err) {
    console.error('Error during database update:', err);
  } finally {
    await client.end();
  }
}

main();
