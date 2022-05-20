import fetch from 'node-fetch'
import escape from 'escape-html'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  //ssh athasha.io -L 31650:localhost:31650
  const email = escape(req.body.email)
  const message = escape(req.body.message)
  const body = `<pre>From: ${email}</pre><pre>Message: ${message}</pre>`
  const response = await fetch('http://127.0.0.1:31650/api/mail', {
    method: 'POST',
    body: body,
    headers: {
      'Mail-From': 'portal@athasha.io',
      'Mail-To': 'athasha@yeico.com',
      'Mail-Subject': "Leave Us a Message",
      'Mail-Mime': "text/html",
    }
  })
  const result = await response.json()
  res.status(200).json({ res: "ok" })
}
