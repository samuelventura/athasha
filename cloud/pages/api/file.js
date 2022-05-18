const fs = require('fs')
const path = require('path')

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  const file = path.normalize(path.join(process.env.DOWNLOAD, req.query.f))
  if (file.startsWith(process.env.DOWNLOAD) && file.endsWith(".exe")) {
    const stat = fs.statSync(file);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size,
    })
    fs.createReadStream(file).pipe(res)
  }
}
