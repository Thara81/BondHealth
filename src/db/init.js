const { query } = require('./config');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('🚀 Creating database tables...');
  
  try {
    // Read the schema file - CHANGED FROM schema.sql TO init.sql
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'init.sql'), 'utf8');
    
    // Split into individual statements
    const statements = schemaSQL
      .split(';')
      .filter(statement => statement.trim().length > 0);
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      try {
        await query(statement);
        console.log(`✅ [${i+1}/${statements.length}] Executed: ${statement.substring(0, 50)}...`);
      } catch (err) {
        // Ignore "already exists" errors
        if (err.message.includes('already exists')) {
          console.log(`⚠️  [${i+1}/${statements.length}] Table already exists (skipped)`);
        } else {
          throw err;
        }
      }
    }
    
    console.log('\n✅ All tables created successfully!');
    
    // Verify tables
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables in database:');
    tables.rows.forEach(t => console.log('  -', t.table_name));
    console.log(`\n🎉 Total: ${tables.rows.length} tables created`);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;