const initSqlJs = require('sql.js');
const fs = require('fs');

initSqlJs().then(SQL => {
  const db = new SQL.Database(fs.readFileSync('.questions_db_cache.bin'));

  // Check topics for jee-main physics gravitation
  const r1 = db.exec("SELECT DISTINCT topic FROM questions WHERE subject='physics' AND chapter='gravitation' AND topic!='' LIMIT 10");
  console.log('JEE Main Physics Gravitation topics:', r1[0]);

  // Check some topics across all data
  const r2 = db.exec("SELECT DISTINCT topic FROM questions WHERE topic!='' LIMIT 5");
  console.log('Sample topics:', r2[0]);

  // Check with NEET physics Gravitation (proper case)
  const r3 = db.exec("SELECT DISTINCT topic FROM questions WHERE exam='neet' AND LOWER(chapter)='gravitation' AND topic!='' LIMIT 10");
  console.log('NEET Gravitation topics:', r3[0]);

  // Count how many questions have a non-empty topic
  const r4 = db.exec("SELECT COUNT(*) FROM questions WHERE topic!=''");
  console.log('Questions with topics:', r4[0].values[0][0]);
});
