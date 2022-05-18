import Stripe from 'stripe'
import signer from '../../tools/signer'
import db from '../../tools/database'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  return new Promise(function (resolve, reject) {
    db.get("SELECT license FROM payments WHERE sid = ?", [req.body.sid], async (err, row) => {
      if (!err) {
        if (row) { //returns undefined if not found
          const license = JSON.parse(row.license)
          // console.log("existing", license)
          res.status(200).json({ license })
          resolve()
        } else {
          const stripe = new Stripe(process.env.SECRET_KEY)
          const session = await stripe.checkout.sessions.retrieve(req.body.sid)
          const livemode = process.env.SECRET_KEY.startsWith("sk_live")
          if (session.status === "complete" && session.livemode === livemode) {
            const sid = session.id
            const pid = session.payment_intent
            const aid = session.metadata.athasha_id
            const qty = Number(session.metadata.quantity)
            const email = session.customer_details.email
            const license = signer({ pid, qty, aid })
            // console.log("new", license)
            db.run("INSERT INTO payments (pid, sid, aid, qty, email, license, json) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [pid, sid, aid, qty, email, JSON.stringify(license), JSON.stringify(session)], (err) => {
                if (!err) {
                  res.status(200).json({ license })
                  resolve()
                } else {
                  console.log(err)
                  reject()
                }
              })
          }
        }
      } else {
        console.log(err)
        reject()
      }
    })
  })
}
