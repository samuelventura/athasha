import sqlite3 from 'sqlite3'

const db = new sqlite3.Database(process.env.DATABASE)

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS payments (pid TEXT, sid TEXT, aid TEXT, qty NUMERIC, amount NUMERIC, email TEXT, license TEXT, json TEXT, dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
    db.run("CREATE UNIQUE INDEX IF NOT EXISTS payments_pid ON payments (pid)")
    db.run("CREATE UNIQUE INDEX IF NOT EXISTS payments_sid ON payments (sid)")
    db.run("CREATE INDEX IF NOT EXISTS payments_aid ON payments (aid)")
    db.run("CREATE INDEX IF NOT EXISTS payments_email ON payments (email)")
})

export default db
