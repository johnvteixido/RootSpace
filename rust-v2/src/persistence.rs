use rusqlite::{Connection, Result, params};
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

        conn.execute(
            "CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event_type TEXT NOT NULL,
                actor TEXT NOT NULL,
                action TEXT NOT NULL,
                result TEXT NOT NULL,
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

    pub fn log_audit_event(&self, event_type: &str, actor: &str, action: &str, result: &str) -> Result<()> {
        self.conn.execute(
            "INSERT INTO audit_logs (event_type, actor, action, result) VALUES (?, ?, ?, ?)",
            params![event_type, actor, action, result],
        )?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_audit_logging() -> Result<()> {
        let db = Persistence::new(":memory:")?;
        db.log_audit_event("TEST", "ACTOR", "ACTION", "SUCCESS")?;

        let mut stmt = db.conn.prepare("SELECT event_type, actor, action, result FROM audit_logs")?;
        let mut rows = stmt.query([])?;

        if let Some(row) = rows.next()? {
            let event_type: String = row.get(0)?;
            let actor: String = row.get(1)?;
            let action: String = row.get(2)?;
            let result: String = row.get(3)?;

            assert_eq!(event_type, "TEST");
            assert_eq!(actor, "ACTOR");
            assert_eq!(action, "ACTION");
            assert_eq!(result, "SUCCESS");
        } else {
            panic!("No audit log entry found");
        }

        Ok(())
    }
}
