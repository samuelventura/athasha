import Stripe from 'stripe'
import signer from '../../tools/signer'
import db from '../../tools/database'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  const stripe = new Stripe(process.env.SECRET_KEY)
  const session = await stripe.checkout.sessions.retrieve(req.body.sid)
  if (session.status === "complete") {
    const sid = session.id
    const pid = session.payment_intent
    const aid = session.metadata.athasha_id
    const qty = Number(session.metadata.quantity)
    const email = session.customer_details.email
    const license = signer({ pid, qty, aid })
    db.serialize(() => {
      db.run("INSERT INTO payments (pid, sid, aid, qty, email, license, json) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [pid, sid, aid, qty, email, JSON.stringify(license), JSON.stringify(session)])
    })
    res.status(200).json({ license })
  }
}
