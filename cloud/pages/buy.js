import { useRouter } from 'next/router'
import Link from 'next/link'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { useEffect, useState } from 'react'
import numeral from 'numeral'
import Jumbo from '../components/jumbo'

export default function Buy() {
  const router = useRouter()
  const cost = "58"
  const [id, setId] = useState("")
  const [qty, setQty] = useState("0")
  const [ro, setRo] = useState(false)
  const disabled = qty <= 0 || id.trim().length == 0
  function total() {
    return numeral(cost * qty).format('0,0.00')
  }
  function checkout() {
    fetch('/api/buy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ qty, id }),
    })
      .then(r => r.json())
      .then(r => { window.location.href = r.url })
  }
  useEffect(() => {
    if (router.query.id) {
      setId(router.query.id)
      setRo(true)
    }
    if (router.query.qty) {
      setQty(router.query.qty)
    }
  }, [router.query])
  function fixQty(value) {
    value = Number(value)
    if (Number.isInteger(value) && value >= 0 && value <= 100) {
      setQty(`${value}`)
    } else {
      setQty(qty)
    }
  }
  function onIncrease(q) { setQty(qty - (-q)) } //autoconvert from string
  function onReset() { setQty(0) }
  return (
    <>
      <Jumbo title="Transparent Princing">
        <p className="col-md-8 fs-4">{`Flat USD $${cost} per item license.`}</p>
        <ul>
          <li><Link href="/download">Download</Link> and evaluate at your convenience, for as long as needed.</li>
          <li>Lifetime free upgrades.</li>
          <li>Purchases are final.</li>
        </ul>
      </Jumbo>

      <div className="row align-items-md-stretch">
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="1">
            Identity
          </Form.Label>
          <Col sm="7">
            <Form.Control type="text" placeholder="Type or Paste your Identity Here"
              value={id} onChange={(e) => setId(e.target.value)} disabled={ro} required />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="1">
            Quantity
          </Form.Label>
          <Col sm="7">
            <InputGroup className="mb-3">
              {/* min=1 left for useful HTML validation tooltip */}
              <Form.Control type="number" min="1" step="1"
                value={qty} onChange={(e) => fixQty(e.target.value)} />
              <Button variant="primary" onClick={() => onIncrease(1)}>+1</Button>
              <Button variant="primary" onClick={() => onIncrease(5)}>+5</Button>
              <Button variant="primary" onClick={() => onIncrease(10)}>+10</Button>
              <Button variant="secondary" onClick={onReset}>Reset</Button>
            </InputGroup>
          </Col>
        </Form.Group>
        <Row>
          <Col sm="1">Total</Col>
          <Col sm="5"><span className='fw-bold'>USD ${total()}</span></Col>
          <Col sm="2" className="d-flex justify-content-end">
            <Button onClick={checkout} disabled={disabled} variant="primary"
              title="Pay Now">Pay Now</Button>
          </Col>
        </Row>
      </div>
    </>
  )
}
