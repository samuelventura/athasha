import db from '../../tools/database'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  const query = req.body.query
  const filter = query.indexOf("@") < 0 ? "aid" : "email"
  db.all(`SELECT dt, qty, email, aid, license FROM payments WHERE ${filter} = ?`, query, (err, rows) => {
    if (!err) {
      rows.forEach(row => row.license = JSON.parse(row.license))
      res.status(200).json({ rows })
    }
  })
}
