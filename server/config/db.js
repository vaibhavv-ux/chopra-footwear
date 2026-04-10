const Database = require('better-sqlite3');
const { dbPath } = require('./storage');

console.log('🔄 Connecting to SQLite database at:', dbPath);

const sqlite = new Database(dbPath, { verbose: console.log });
sqlite.pragma('journal_mode = WAL');

// Wrapper for controllers that expect promise-based MySQL-style query result
const db = {
  query: async (sql, params = []) => {
    try {
      // Normalize single value params to array
      const normalizedParams = Array.isArray(params) ? params : [params];
      
      const stmt = sqlite.prepare(sql);
      
      // Check if it's a SELECT query
      const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || 
                       sql.trim().toUpperCase().startsWith('WITH');

      if (isSelect) {
        const rows = stmt.all(...normalizedParams);
        return [rows];
      } else {
        const result = stmt.run(...normalizedParams);
        return [{
          insertId: result.lastInsertRowid,
          affectedRows: result.changes
        }];
      }
    } catch (error) {
      console.error('Database Query Error:', error.message);
      console.error('SQL:', sql);
      throw error;
    }
  },
  // Add direct access to sqlite if needed
  sqlite: sqlite
};

module.exports = db;
