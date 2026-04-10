const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'chopra.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

// Wrapper to make SQLite work like mysql2/promise pool interface
// so all controllers work unchanged
const db = {
  query: async (sql, params = []) => {
    try {
      // Convert MySQL-style ? placeholders - they work in SQLite too
      const stmt = sql.trim();
      
      // Determine if it's a SELECT/read query
      const isSelect = /^\s*(SELECT|SHOW|DESCRIBE|EXPLAIN)/i.test(stmt);
      
      if (isSelect) {
        const prepared = sqlite.prepare(stmt);
        const rows = prepared.all(...(Array.isArray(params) ? params : [params]));
        return [rows];
      } else {
        const prepared = sqlite.prepare(stmt);
        const result = prepared.run(...(Array.isArray(params) ? params : [params]));
        return [{ 
          insertId: result.lastInsertRowid, 
          affectedRows: result.changes,
          changedRows: result.changes 
        }];
      }
    } catch (error) {
      console.error('DB Error:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  },
  
  execute: async (sql, params = []) => {
    return db.query(sql, params);
  },

  getConnection: async () => {
    return {
      release: () => {},
      query: db.query,
    };
  }
};

console.log('✅ SQLite database connected at:', dbPath);

module.exports = db;
module.exports.sqlite = sqlite;
