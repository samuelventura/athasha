import Stripe from 'stripe'
import Cost from '../../tools/cost'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  const stripe = new Stripe(process.env.SECRET_KEY)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${process.env.URL_BASE}/success?sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.URL_BASE}/buy?qty=${req.body.qty}&id=${req.body.id}&email=${req.body.email}`,
    allow_promotion_codes: true,
    payment_method_types: ['card'],
    customer_email: req.body.email,
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: "Athasha per Item License",
        },
        unit_amount: Cost.current * 100,
      },
      quantity: Number(req.body.qty),
    }],
    metadata: {
      athasha_id: req.body.id,
      quantity: Number(req.body.qty),
    },
  })
  res.status(200).json({ url: session.url })
}
