import Database from 'better-sqlite3'

export class Persistence {
  constructor(dbPath = 'rootspace.db') {
    this.db = new Database(dbPath)
    this.init()
  }

  init() {
    // Create messages table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        peer_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        data TEXT NOT NULL,
        signature TEXT,
        public_key TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS peers (
        peer_id TEXT PRIMARY KEY,
        reputation INTEGER DEFAULT 100,
        last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `)
    console.log('Persistence: SQLite database initialized.')
  }

  saveMessage({ peerId, topic, data, signature, publicKey }) {
    const stmt = this.db.prepare(`
      INSERT INTO messages (peer_id, topic, data, signature, public_key)
      VALUES (?, ?, ?, ?, ?)
    `)
    return stmt.run(peerId, topic, JSON.stringify(data), signature, publicKey)
  }

  getHistory(limit = 100) {
    const stmt = this.db.prepare('SELECT * FROM messages ORDER BY timestamp DESC LIMIT ?')
    return stmt.all(limit)
  }

  updateReputation(peerId, delta) {
    // Ensure peer exists
    this.db.prepare('INSERT OR IGNORE INTO peers (peer_id) VALUES (?)').run(peerId)

    const stmt = this.db.prepare(`
      UPDATE peers 
      SET reputation = reputation + ?, last_seen = CURRENT_TIMESTAMP 
      WHERE peer_id = ?
    `)
    return stmt.run(delta, peerId)
  }

  getPeers() {
    return this.db.prepare('SELECT * FROM peers ORDER BY reputation DESC').all()
  }
}
