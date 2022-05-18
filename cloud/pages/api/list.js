const fs = require('fs');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  const files = fs.readdirSync(process.env.DOWNLOAD).
    filter(file => file.endsWith(".exe")).sort().reverse()
  res.status(200).json({ files })
}
