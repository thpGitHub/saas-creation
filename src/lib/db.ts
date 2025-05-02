import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'database.sqlite');
const db = new Database(dbPath);

// Création des tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    scheduled_time DATETIME,
    published_at DATETIME,
    network TEXT NOT NULL DEFAULT 'linkedin',
    status TEXT CHECK(status IN ('draft', 'scheduled', 'published', 'failed')) DEFAULT 'draft',
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

export default db; 