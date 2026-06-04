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
    console.log('Connected successfully!');

    // 1. Add 'name' to general_settings if not exists
    console.log('Adding "name" column to general_settings...');
    await client.query(`
      ALTER TABLE general_settings
      ADD COLUMN IF NOT EXISTS "name" text DEFAULT 'Dr Aman Sharma, MRSC';
    `).catch(err => console.log('name column notice:', err.message));

    await client.query(`
      ALTER TABLE general_settings
      ADD COLUMN IF NOT EXISTS "heroNameStyle" text DEFAULT 'classic';
    `).catch(err => console.log('heroNameStyle column notice:', err.message));

    await client.query(`
      ALTER TABLE general_settings
      ADD COLUMN IF NOT EXISTS "footerNameStyle" text DEFAULT 'clean';
    `).catch(err => console.log('footerNameStyle column notice:', err.message));

    // Update existing row if name is null
    await client.query(`
      UPDATE general_settings
      SET "name" = COALESCE("name", 'Dr Aman Sharma, MRSC'),
          "heroNameStyle" = COALESCE("heroNameStyle", 'classic'),
          "footerNameStyle" = COALESCE("footerNameStyle", 'clean')
      WHERE id = 'settings';
    `);

    // 2. Add 'caption' to media_gallery if not exists
    console.log('Adding "caption" column to media_gallery...');
    await client.query(`
      ALTER TABLE media_gallery
      ADD COLUMN IF NOT EXISTS "caption" text DEFAULT '';
    `).catch(err => console.log('caption column notice:', err.message));

    // 3. Add 'summary' to publications if not exists
    console.log('Adding "summary" column to publications...');
    await client.query(`
      ALTER TABLE publications
      ADD COLUMN IF NOT EXISTS "summary" text DEFAULT '';
    `).catch(err => console.log('summary column notice:', err.message));

    // 4. Update general_settings email default if needed
    console.log('Verifying default contact email...');
    await client.query(`
      ALTER TABLE general_settings 
      ALTER COLUMN "contactEmail" SET DEFAULT 'AmanSharmaphd@gmail.com';
    `).catch(err => console.log('email column notice:', err.message));

    await client.query(`
      UPDATE general_settings 
      SET "contactEmail" = 'AmanSharmaphd@gmail.com'
      WHERE id = 'settings' AND ("contactEmail" IS NULL OR "contactEmail" = 'amansharmapdh@gmail.com');
    `);

    console.log('All migrations verified and successfully executed!');
  } catch (err) {
    console.error('Error verifying database schema:', err);
  } finally {
    await client.end();
  }
}

main();
