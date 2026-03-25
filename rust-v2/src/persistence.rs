use rusqlite::{params, Connection, Result};
use std::path::Path;

pub struct Persistence {
    conn: Connection,
}

impl Persistence {
    pub fn new<P: AsRef<Path>>(path: P) -> Result<Self> {
        let conn = Connection::open(path)?;
        Self::init(&conn)?;
        Ok(Self { conn })
    }

    fn init(conn: &Connection) -> Result<()> {
        conn.execute(
            "CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                peer_id TEXT NOT NULL,
                topic TEXT NOT NULL,
                data TEXT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;
        Ok(())
    }

    pub fn save_message(&self, peer_id: &str, topic: &str, data: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO messages (peer_id, topic, data) VALUES (?, ?, ?)",
            params![peer_id, topic, data],
        )?;
        Ok(())
    }
}
