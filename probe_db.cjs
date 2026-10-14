const initSqlJs = require('sql.js');
const fs = require('fs');

async function probe() {
  const SQL = await initSqlJs();
  const buf = fs.readFileSync('jee_mains_pyqs_data/jee_mains_pyqs.db');
  const db = new SQL.Database(buf);

  const tables = db.exec("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables:', JSON.stringify(tables[0]?.values));

  if (tables[0]?.values[0]) {
    const t = tables[0].values[0][0];
    const schema = db.exec('PRAGMA table_info(' + t + ')');
    console.log('Columns:', schema[0].values.map(r => r[1]).join(', '));
    const count = db.exec('SELECT COUNT(*) FROM ' + t);
    console.log('Row count in', t + ':', count[0].values[0][0]);
    const sample = db.exec('SELECT * FROM ' + t + ' LIMIT 1');
    console.log('Sample cols:', sample[0].columns);
    console.log('Sample values:', JSON.stringify(sample[0].values[0]).slice(0, 500));
  }

  // Check if there are more tables
  if (tables[0]?.values.length > 1) {
    console.log('All tables:', tables[0].values.map(r => r[0]));
  }
}

probe().catch(console.error);
