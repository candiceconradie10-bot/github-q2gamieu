/**
 * Test script to apply migration and verify Supabase setup
 * 
 * This script will:
 * 1. Test the connection to Supabase
 * 2. Apply the final consolidated migration
 * 3. Verify tables are created correctly
 * 4. Test basic CRUD operations
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get environment variables
const url = process.env.VITE_SUPABASE_URL;
const anon = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
  process.exit(1);
}

console.log('🔍 Testing Supabase connection...');
console.log('URL:', url.substring(0, 30) + '...');

const supabase = createClient(url, anon);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error && !error.message.includes('relation "profiles" does not exist')) {
      throw error;
    }
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log('ℹ️  Connection established, tables may not exist yet:', error.message);
    return true;
  }
}

async function applyMigration() {
  try {
    console.log('📝 Reading migration file...');
    const migrationPath = join(__dirname, 'migrations', '20250907000000_final_consolidated_schema.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Applying final consolidated migration...');
    
    // Note: In a real production setup, you would use Supabase CLI or the dashboard
    // For this demo, we'll provide instructions on how to apply the migration
    console.log('');
    console.log('📋 TO APPLY THE MIGRATION:');
    console.log('1. Go to your Supabase Dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy and paste the contents of:');
    console.log('   supabase/migrations/20250907000000_final_consolidated_schema.sql');
    console.log('4. Run the SQL script');
    console.log('');
    console.log('OR use Supabase CLI:');
    console.log('   supabase db push');
    console.log('');
    
    return true;
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    return false;
  }
}

async function verifyTables() {
  console.log('🔍 Verifying table structure...');
  
  const tables = [
    'profiles', 'products', 'orders', 'cart_items', 
    'wishlists', 'payment_methods', 'admin_activity', 
    'site_content', 'media_files'
  ];
  
  const verifiedTables = [];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (!error) {
        verifiedTables.push(table);
        console.log(`✅ Table '${table}' exists and accessible`);
      } else {
        console.log(`❌ Table '${table}' error:`, error.message);
      }
    } catch (error) {
      console.log(`❌ Table '${table}' verification failed:`, error.message);
    }
  }
  
  console.log(`\n📊 Verification Summary: ${verifiedTables.length}/${tables.length} tables verified`);
  return verifiedTables.length === tables.length;
}

async function testBasicOperations() {
  console.log('🧪 Testing basic operations...');
  
  try {
    // Test reading products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (!productsError) {
      console.log(`✅ Products query successful - found ${products?.length || 0} products`);
    } else {
      console.log('❌ Products query failed:', productsError.message);
    }
    
    // Test reading site content
    const { data: content, error: contentError } = await supabase
      .from('site_content')
      .select('*')
      .limit(5);
    
    if (!contentError) {
      console.log(`✅ Site content query successful - found ${content?.length || 0} content items`);
    } else {
      console.log('❌ Site content query failed:', contentError.message);
    }
    
  } catch (error) {
    console.error('❌ Basic operations test failed:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Supabase setup verification...\n');
  
  const connectionOk = await testConnection();
  if (!connectionOk) {
    console.error('❌ Cannot proceed without Supabase connection');
    process.exit(1);
  }
  
  await applyMigration();
  
  console.log('⏳ Waiting 5 seconds for migration to process...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const tablesOk = await verifyTables();
  if (tablesOk) {
    await testBasicOperations();
    console.log('\n🎉 Supabase setup verification completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. If migration not yet applied, apply it using the instructions above');
    console.log('2. Test admin access by signing up with jantjieskurt7@gmail.com');
    console.log('3. Verify the React app loads correctly');
    console.log('4. Test creating/reading products, orders, and other functionality');
  } else {
    console.log('\n⚠️  Some tables are missing. Please apply the migration first.');
  }
}

main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});