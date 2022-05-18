import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ message: '404 Not Found' })
    return
  }
  const stripe = new Stripe(process.env.SECRET_KEY)
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${process.env.URL_BASE}/success?sid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.URL_BASE}/buy?qty=${req.body.qty}&id=${req.body.id}`,
    line_items: [
      {
        price: process.env.PRICE_KEY,
        quantity: Number(req.body.qty),
        //tax_rates: ['txr_1L0fV6J3rkKRlXZWgw1bJHfH', 'txr_1L0erYJ3rkKRlXZWB6s4LrsW'],
      },
    ],
    metadata: {
      athasha_id: req.body.id,
      quantity: Number(req.body.qty),
    },
  })
  res.status(200).json({ url: session.url })
}

//to test stripe region auto detection
//ssh -N -D 9090 athasha.io
//google-chrome --proxy-server="socks5://localhost:9090"
