const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env file manually
const envPath = path.resolve(__dirname, '../.env');
let supabaseUrl = '';
let supabaseServiceKey = '';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const matchUrl = line.match(/^NEXT_PUBLIC_SUPABASE_URL\s*=\s*["']?([^"'\s]+)["']?/);
    const matchKey = line.match(/^SUPABASE_SERVICE_ROLE_KEY\s*=\s*["']?([^"'\s]+)["']?/);
    if (matchUrl) supabaseUrl = matchUrl[1];
    if (matchKey) supabaseServiceKey = matchKey[1];
  });
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  // 1. Check teams
  try {
    const { error } = await supabase.from('teams').select('id').limit(1);
    if (error) {
      console.log('❌ Error querying teams table:', error.message);
    } else {
      console.log('✅ Teams table exists.');
    }
  } catch (err) {
    console.log('❌ Exception querying teams:', err.message);
  }

  // 2. Check games
  try {
    const { error } = await supabase.from('games').select('id').limit(1);
    if (error) {
      console.log('❌ Error querying games table:', error.message);
    } else {
      console.log('✅ Games table exists.');
    }
  } catch (err) {
    console.log('❌ Exception querying games:', err.message);
  }

  // 3. Check stickers
  try {
    const { error } = await supabase.from('stickers').select('id').limit(1);
    if (error) {
      console.log('❌ Error querying stickers table:', error.message);
    } else {
      console.log('✅ Stickers table exists.');
    }
  } catch (err) {
    console.log('❌ Exception querying stickers:', err.message);
  }
}

checkDatabase();
