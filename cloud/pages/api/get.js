import db from '../../tools/database'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  const query = req.body.query
  const filter = query.indexOf("@") < 0 ? "aid" : "email"
  return new Promise(function (resolve, reject) {
    db.all(`SELECT dt, qty, email, aid, license FROM payments WHERE ${filter} = ? ORDER BY dt DESC`, [query], (err, rows) => {
      if (!err) {
        rows.forEach(row => row.license = JSON.parse(row.license))
        res.status(200).json({ rows })
        resolve()
      } else {
        console.log(err)
        reject()
      }
    })
  })
}
