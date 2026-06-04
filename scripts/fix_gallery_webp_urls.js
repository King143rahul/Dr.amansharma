import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://miyracycsbuwybicljpo.supabase.co';
const supabaseAnonKey = 'sb_publishable_uxXgnPU8WMRZYSqSZDtXxg_nrEqIs1P';
const connectionString = 'postgresql://postgres:1YnynPyptgaU4x9g@db.miyracycsbuwybicljpo.supabase.co:5432/postgres';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const toWebPUrl = (url) => url.replace(/\.(jpe?g|png)(?=($|\?))/i, '.webp');

async function main() {
  const listed = await supabase.storage.from('Photos').list('media', { limit: 1000 });
  if (listed.error) throw listed.error;

  const storageNames = new Set((listed.data ?? []).map((item) => item.name));

  const rows = await supabase
    .from('media_gallery')
    .select('id,url');
  if (rows.error) throw rows.error;

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  let updated = 0;
  for (const row of rows.data ?? []) {
    const currentUrl = row.url ?? '';
    if (!/\/media\/.+\.(jpe?g|png)(\?|$)/i.test(currentUrl)) continue;

    const storageName = decodeURIComponent(currentUrl.split('/media/')[1].split('?')[0]);
    const webpStorageName = storageName.replace(/\.(jpe?g|png)$/i, '.webp');
    if (!storageNames.has(webpStorageName)) continue;

    const nextUrl = toWebPUrl(currentUrl);
    if (nextUrl === currentUrl) continue;

    await client.query('UPDATE media_gallery SET url = $1 WHERE id = $2', [nextUrl, row.id]);
    updated += 1;
  }

  await client.end();
  console.log(`Updated ${updated} gallery image URL(s).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
