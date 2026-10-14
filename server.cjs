// server.cjs - PaperGen Backend API Server
// Builds a unified SQLite DB from all question datasets, then serves them via REST API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '3001', 10);
const DB_CACHE_PATH = path.resolve(__dirname, process.env.DB_CACHE_FILE || '.questions_db_cache.bin');
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const app = express();
app.use(cors(CORS_ORIGIN === '*' ? undefined : { origin: CORS_ORIGIN }));
app.use(express.json());

let db = null; // sql.js DB instance

// ─── Schema ───────────────────────────────────────────────────────────────────
const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  exam TEXT,
  subject TEXT,
  chapter TEXT,
  topic TEXT,
  year INTEGER,
  paper_title TEXT,
  difficulty TEXT,
  type TEXT,
  question_text TEXT,
  option_a TEXT,
  option_b TEXT,
  option_c TEXT,
  option_d TEXT,
  correct_answer TEXT,
  explanation TEXT,
  is_pyq INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_exam ON questions(exam);
CREATE INDEX IF NOT EXISTS idx_subject ON questions(subject);
CREATE INDEX IF NOT EXISTS idx_chapter ON questions(chapter);
CREATE INDEX IF NOT EXISTS idx_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_year ON questions(year);
`;

// ─── Data Sources ─────────────────────────────────────────────────────────────
const DATA_SOURCES = [
  // PYQs
  { file: 'jee_mains_pyqs_data/jee_mains_physics.json',    exam: 'jee-main',     isPyq: true },
  { file: 'jee_mains_pyqs_data/jee_mains_chemistry.json',  exam: 'jee-main',     isPyq: true },
  { file: 'jee_mains_pyqs_data/jee_mains_mathematics.json',exam: 'jee-main',     isPyq: true },
  { file: 'jee_advanced_pyqs_data/jee_advanced_questions.json', exam: 'jee-advanced', isPyq: true },
  { file: 'neet_pyqs_data/neet_physics.json',    exam: 'neet',    isPyq: true },
  { file: 'neet_pyqs_data/neet_chemistry.json',  exam: 'neet',    isPyq: true },
  { file: 'neet_pyqs_data/neet_biology.json',    exam: 'neet',    isPyq: true },
  { file: 'mhtcet_pyqs_data/mhtcet_physics.json',    exam: 'mhtcet', isPyq: true },
  { file: 'mhtcet_pyqs_data/mhtcet_chemistry.json',  exam: 'mhtcet', isPyq: true },
  { file: 'mhtcet_pyqs_data/mhtcet_mathematics.json',exam: 'mhtcet', isPyq: true },
  { file: 'mhtcet_pyqs_data/mhtcet_biology.json',    exam: 'mhtcet', isPyq: true },
  // Practice
  { file: 'jee_mains_pyqs_data/jee_mains_practice_physics.json',    exam: 'jee-main',  isPyq: false },
  { file: 'jee_mains_pyqs_data/jee_mains_practice_chemistry.json',  exam: 'jee-main',  isPyq: false },
  { file: 'jee_mains_pyqs_data/jee_mains_practice_mathematics.json',exam: 'jee-main',  isPyq: false },
  { file: 'jee_advanced_pyqs_data/jee_advanced_practice_physics.json',    exam: 'jee-advanced', isPyq: false },
  { file: 'jee_advanced_pyqs_data/jee_advanced_practice_chemistry.json',  exam: 'jee-advanced', isPyq: false },
  { file: 'jee_advanced_pyqs_data/jee_advanced_practice_mathematics.json',exam: 'jee-advanced', isPyq: false },
  { file: 'neet_pyqs_data/neet_practice_physics.json',    exam: 'neet', isPyq: false },
  { file: 'neet_pyqs_data/neet_practice_chemistry.json',  exam: 'neet', isPyq: false },
  { file: 'neet_pyqs_data/neet_practice_biology.json',    exam: 'neet', isPyq: false },
  { file: 'mhtcet_pyqs_data/mhtcet_practice_physics.json',    exam: 'mhtcet', isPyq: false },
  { file: 'mhtcet_pyqs_data/mhtcet_practice_chemistry.json',  exam: 'mhtcet', isPyq: false },
  { file: 'mhtcet_pyqs_data/mhtcet_practice_mathematics.json',exam: 'mhtcet', isPyq: false },
  { file: 'mhtcet_pyqs_data/mhtcet_practice_biology.json',    exam: 'mhtcet', isPyq: false },
];

// ─── Row Normalizer ───────────────────────────────────────────────────────────
function normalizeRow(raw, exam, isPyq) {
  // Handle both JEE (question field) and NEET/MHT-CET (questionText field)
  const text = raw.question || raw.questionText || '';
  const subject = (raw.subject || raw.category || '').toLowerCase();
  const chapter = raw.chapter || '';
  const topic = raw.topic || raw.subtopic || '';
  const difficulty = (raw.difficulty || 'medium').toLowerCase();
  const type = (raw.type || 'mcq').toLowerCase();
  const optA = raw.optionA || (raw.options && raw.options[0]) || '';
  const optB = raw.optionB || (raw.options && raw.options[1]) || '';
  const optC = raw.optionC || (raw.options && raw.options[2]) || '';
  const optD = raw.optionD || (raw.options && raw.options[3]) || '';
  const correct = raw.correctAnswer || (raw.correctOptions && raw.correctOptions[0]) || '';
  const explanation = raw.explanation || '';
  const year = raw.year || 0;
  const paperTitle = raw.paperTitle || '';
  const id = raw.id || (exam + '_' + Math.random().toString(36).substr(2, 9));

  return {
    id, exam, subject, chapter, topic, year, paper_title: paperTitle,
    difficulty, type,
    question_text: text, option_a: optA, option_b: optB, option_c: optC, option_d: optD,
    correct_answer: correct, explanation,
    is_pyq: isPyq ? 1 : 0
  };
}

// ─── Build DB ─────────────────────────────────────────────────────────────────
async function buildDatabase(SQL) {
  console.log('Building unified question database...');
  const newDb = new SQL.Database();
  newDb.run(CREATE_TABLE);

  let totalInserted = 0;

  for (const source of DATA_SOURCES) {
    const filePath = path.join(__dirname, source.file);
    if (!fs.existsSync(filePath)) {
      console.log(`  SKIP (not found): ${source.file}`);
      continue;
    }

    console.log(`  Loading: ${source.file}`);
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const rows = Array.isArray(raw) ? raw : [];
      console.log(`    ${rows.length} questions found`);

      // Batch insert
      const stmt = newDb.prepare(`
        INSERT OR IGNORE INTO questions
        (id, exam, subject, chapter, topic, year, paper_title, difficulty, type,
         question_text, option_a, option_b, option_c, option_d,
         correct_answer, explanation, is_pyq)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `);

      newDb.run('BEGIN TRANSACTION');
      let batchCount = 0;
      for (const raw of rows) {
        const r = normalizeRow(raw, source.exam, source.isPyq);
        if (!r.question_text || r.question_text.trim().length < 5) continue;
        stmt.run([
          r.id, r.exam, r.subject, r.chapter, r.topic, r.year, r.paper_title,
          r.difficulty, r.type,
          r.question_text, r.option_a, r.option_b, r.option_c, r.option_d,
          r.correct_answer, r.explanation, r.is_pyq
        ]);
        batchCount++;
        totalInserted++;
        if (batchCount % 10000 === 0) {
          newDb.run('COMMIT');
          newDb.run('BEGIN TRANSACTION');
          process.stdout.write(`    Inserted ${batchCount}...\r`);
        }
      }
      newDb.run('COMMIT');
      stmt.free();
      console.log(`    Done: ${batchCount} inserted`);
    } catch (e) {
      console.error(`  ERROR loading ${source.file}:`, e.message);
    }
  }

  console.log(`\nTotal questions in DB: ${totalInserted}`);
  return newDb;
}

// ─── Load or Build DB ─────────────────────────────────────────────────────────
async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_CACHE_PATH)) {
    console.log('Loading cached database...');
    try {
      const buf = fs.readFileSync(DB_CACHE_PATH);
      db = new SQL.Database(buf);
      const count = db.exec('SELECT COUNT(*) FROM questions')[0]?.values[0][0];
      console.log(`Loaded ${count} questions from cache.`);
      return;
    } catch (e) {
      console.log('Cache invalid, rebuilding...');
    }
  }

  db = await buildDatabase(SQL);

  // Save cache
  console.log('Saving database cache...');
  const data = db.export();
  fs.writeFileSync(DB_CACHE_PATH, Buffer.from(data));
  console.log('Cache saved to', DB_CACHE_PATH);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function queryDb(sql, params = []) {
  try {
    const result = db.exec(sql, params);
    if (!result[0]) return [];
    const { columns, values } = result[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  } catch (e) {
    console.error('Query error:', e.message, sql);
    return [];
  }
}

function scalarQuery(sql, params = []) {
  const result = db.exec(sql, params);
  return result[0]?.values[0][0] ?? 0;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/status
app.get('/api/status', (req, res) => {
  if (!db) return res.status(503).json({ ready: false });
  const count = scalarQuery('SELECT COUNT(*) FROM questions');
  res.json({ ready: true, totalQuestions: count });
});

// GET /api/questions - search, filter, paginate
app.get('/api/questions', (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB not ready' });

  const {
    exam = '',
    subject = '',
    chapter = '',
    difficulty = '',
    type = '',
    search = '',
    pyq_only = '',
    year = '',
    page = '1',
    limit = '50',
  } = req.query;

  const conditions = [];
  const params = [];

  const { topic = '', source = '' } = req.query;
  if (exam) { conditions.push('exam = ?'); params.push(exam); }
  if (subject) { conditions.push('LOWER(subject) = LOWER(?)'); params.push(subject); }
  if (chapter) { conditions.push('LOWER(chapter) = LOWER(?)'); params.push(chapter); }
  if (topic) { conditions.push('LOWER(topic) = LOWER(?)'); params.push(topic); }
  if (difficulty) { conditions.push('LOWER(difficulty) = LOWER(?)'); params.push(difficulty); }
  if (type) { conditions.push('LOWER(type) = LOWER(?)'); params.push(type); }
  // source: 'pyq' = PYQs only, 'practice' = practice only, '' = all
  if (source === 'pyq') { conditions.push('is_pyq = 1'); }
  else if (source === 'practice') { conditions.push('is_pyq = 0'); }
  if (year) { conditions.push('year = ?'); params.push(parseInt(year)); }
  if (search) {
    conditions.push('question_text LIKE ?');
    params.push('%' + search + '%');
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * pageSize;

  const total = scalarQuery(`SELECT COUNT(*) FROM questions ${where}`, params);
  const rows = queryDb(
    `SELECT id, exam, subject, chapter, topic, year, paper_title, difficulty, type,
            question_text, option_a, option_b, option_c, option_d,
            correct_answer, explanation, is_pyq
     FROM questions ${where} LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  res.json({ total, page: pageNum, limit: pageSize, questions: rows });
});

// GET /api/chapters - get chapters for an exam+subject
app.get('/api/chapters', (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  const { exam = '', subject = '' } = req.query;
  const conditions = [];
  const params = [];
  if (exam) { conditions.push('exam = ?'); params.push(exam); }
  if (subject) { conditions.push('LOWER(subject) = LOWER(?)'); params.push(subject); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const rows = queryDb(
    `SELECT chapter, COUNT(*) as count FROM questions ${where} GROUP BY chapter ORDER BY chapter`,
    params
  );
  res.json(rows);
});

// GET /api/topics - get topics for exam+subject+chapter
app.get('/api/topics', (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  const { exam = '', subject = '', chapter = '' } = req.query;
  const conditions = ["topic != ''"];
  const params = [];
  if (exam) { conditions.push('exam = ?'); params.push(exam); }
  if (subject) { conditions.push('LOWER(subject) = LOWER(?)'); params.push(subject); }
  if (chapter) { conditions.push('LOWER(chapter) = LOWER(?)'); params.push(chapter); }
  const where = 'WHERE ' + conditions.join(' AND ');
  const rows = queryDb(
    `SELECT topic, COUNT(*) as count FROM questions ${where} GROUP BY topic ORDER BY topic`,
    params
  );
  res.json(rows);
});

// GET /api/stats - aggregated stats by exam + user papers
app.get('/api/stats', (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  const byExam = queryDb(`SELECT exam, COUNT(*) as count FROM questions GROUP BY exam ORDER BY exam`);
  const bySubject = queryDb(`SELECT subject, COUNT(*) as count FROM questions GROUP BY subject ORDER BY count DESC`);
  const totalQuestions = scalarQuery('SELECT COUNT(*) FROM questions');
  const papers = getPapers();
  const totalPapers = papers.length;
  const publishedPapers = papers.filter(p => p.status === 'published').length;
  const draftPapers = papers.filter(p => p.status === 'draft').length;
  const totalDownloads = papers.reduce((s, p) => s + (p.downloadCount || 0), 0);
  const userQuestionsCount = getUserQuestions().length;

  res.json({
    total: totalQuestions,
    totalQuestions,
    byExam,
    bySubject,
    totalPapers,
    publishedPapers,
    draftPapers,
    totalDownloads,
    userQuestionsCount
  });
});

// GET /api/years - get years for an exam
app.get('/api/years', (req, res) => {
  if (!db) return res.status(503).json({ error: 'DB not ready' });
  const { exam = '' } = req.query;
  const conditions = exam ? ['exam = ?'] : [];
  const params = exam ? [exam] : [];
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const rows = queryDb(`SELECT DISTINCT year FROM questions ${where} WHERE year > 0 ORDER BY year DESC`, params);
  res.json(rows.map(r => r.year));
});

// ─── Persistent Server Storage (Online User Data) ─────────────────────────────
const STORAGE_DIR = path.resolve(__dirname, process.env.STORAGE_DIR || 'server_storage');
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

const PAPERS_FILE = path.join(STORAGE_DIR, 'papers.json');
const USER_QUESTIONS_FILE = path.join(STORAGE_DIR, 'user_questions.json');
const PROFILE_FILE = path.join(STORAGE_DIR, 'profile.json');

function readJsonFile(file, fallback) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
  return fallback;
}

function writeJsonFile(file, data) {
  try {
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmp, file);
  } catch (err) {
    console.error(`Error writing ${file}:`, err.message);
  }
}

function getPapers() {
  return readJsonFile(PAPERS_FILE, []);
}

function savePapers(papers) {
  writeJsonFile(PAPERS_FILE, papers);
}

function getUserQuestions() {
  return readJsonFile(USER_QUESTIONS_FILE, []);
}

function saveUserQuestions(questions) {
  writeJsonFile(USER_QUESTIONS_FILE, questions);
}

function getProfile() {
  return readJsonFile(PROFILE_FILE, {
    name: 'Teacher',
    email: '',
    institution: '',
    avatar: 'T'
  });
}

function saveProfile(profile) {
  writeJsonFile(PROFILE_FILE, profile);
}

// ─── Online Papers Endpoints ──────────────────────────────────────────────────
app.get('/api/papers', (req, res) => {
  res.json(getPapers());
});

app.get('/api/papers/:id', (req, res) => {
  const papers = getPapers();
  const paper = papers.find(p => p.id === req.params.id);
  if (!paper) return res.status(404).json({ error: 'Paper not found' });
  res.json(paper);
});

app.post('/api/papers', (req, res) => {
  const paper = req.body;
  if (!paper) return res.status(400).json({ error: 'Paper body required' });
  const papers = getPapers();
  const now = new Date().toISOString();
  
  const id = paper.id || ('paper_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
  const existingIndex = papers.findIndex(p => p.id === id);
  
  const savedPaper = {
    ...paper,
    id,
    createdAt: paper.createdAt || now,
    updatedAt: now,
    downloadCount: paper.downloadCount || 0,
    status: paper.status || 'draft'
  };

  if (existingIndex >= 0) {
    papers[existingIndex] = savedPaper;
  } else {
    papers.unshift(savedPaper);
  }

  savePapers(papers);
  res.status(201).json(savedPaper);
});

app.put('/api/papers/:id', (req, res) => {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Paper not found' });
  
  const updated = {
    ...papers[index],
    ...req.body,
    id: req.params.id,
    updatedAt: new Date().toISOString()
  };
  papers[index] = updated;
  savePapers(papers);
  res.json(updated);
});

app.delete('/api/papers/:id', (req, res) => {
  let papers = getPapers();
  const initialLength = papers.length;
  papers = papers.filter(p => p.id !== req.params.id);
  if (papers.length === initialLength) return res.status(404).json({ error: 'Paper not found' });
  savePapers(papers);
  res.json({ success: true, id: req.params.id });
});

app.delete('/api/papers', (req, res) => {
  savePapers([]);
  res.json({ success: true, count: 0 });
});

app.post('/api/papers/:id/duplicate', (req, res) => {
  const papers = getPapers();
  const paper = papers.find(p => p.id === req.params.id);
  if (!paper) return res.status(404).json({ error: 'Paper not found' });
  
  const now = new Date().toISOString();
  const cloned = {
    ...paper,
    id: 'paper_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    details: {
      ...paper.details,
      title: (paper.details?.title || 'Paper') + ' (Copy)'
    },
    downloadCount: 0,
    createdAt: now,
    updatedAt: now
  };
  papers.unshift(cloned);
  savePapers(papers);
  res.status(201).json(cloned);
});

app.post('/api/papers/:id/download', (req, res) => {
  const papers = getPapers();
  const paper = papers.find(p => p.id === req.params.id);
  if (!paper) return res.status(404).json({ error: 'Paper not found' });
  paper.downloadCount = (paper.downloadCount || 0) + 1;
  paper.updatedAt = new Date().toISOString();
  savePapers(papers);
  res.json(paper);
});

// ─── Online User Saved Questions Endpoints ────────────────────────────────────
app.get('/api/user-questions', (req, res) => {
  res.json(getUserQuestions());
});

app.post('/api/user-questions', (req, res) => {
  const q = req.body;
  if (!q) return res.status(400).json({ error: 'Question body required' });
  const questions = getUserQuestions();
  const id = q.id || ('q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6));
  const existingIndex = questions.findIndex(item => item.id === id);
  
  const savedQ = {
    ...q,
    id,
    createdAt: q.createdAt || new Date().toISOString()
  };

  if (existingIndex >= 0) {
    questions[existingIndex] = savedQ;
  } else {
    questions.unshift(savedQ);
  }

  saveUserQuestions(questions);
  res.status(201).json(savedQ);
});

app.put('/api/user-questions/:id', (req, res) => {
  const questions = getUserQuestions();
  const index = questions.findIndex(q => q.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Question not found' });
  questions[index] = { ...questions[index], ...req.body, id: req.params.id };
  saveUserQuestions(questions);
  res.json(questions[index]);
});

app.delete('/api/user-questions/:id', (req, res) => {
  let questions = getUserQuestions();
  questions = questions.filter(q => q.id !== req.params.id);
  saveUserQuestions(questions);
  res.json({ success: true, id: req.params.id });
});

app.delete('/api/user-questions', (req, res) => {
  saveUserQuestions([]);
  res.json({ success: true, count: 0 });
});

// ─── Online Teacher Profile Endpoints ─────────────────────────────────────────
app.get('/api/profile', (req, res) => {
  res.json(getProfile());
});

app.put('/api/profile', (req, res) => {
  const current = getProfile();
  const updated = { ...current, ...req.body };
  saveProfile(updated);
  res.json(updated);
});

// ─── Start ────────────────────────────────────────────────────────────────────
async function main() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`\nPaperGen API Server running at http://localhost:${PORT}`);
    console.log('Endpoints:');
    console.log('  GET /api/status');
    console.log('  GET /api/questions?exam=jee-main&subject=physics&chapter=...&search=...&page=1&limit=50');
    console.log('  GET /api/chapters?exam=jee-main&subject=physics');
    console.log('  GET /api/topics?exam=jee-main&subject=physics&chapter=...');
    console.log('  GET /api/stats');
    console.log('  GET /api/years?exam=jee-main');
  });
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
