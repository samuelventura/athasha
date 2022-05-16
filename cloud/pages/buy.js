import { useRouter } from 'next/router'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { useEffect, useState } from 'react'
import numeral from 'numeral'
import Jumbo from '../components/jumbo'

export default function Home() {
  const router = useRouter()
  const cost = "49.99"
  const [id, setId] = useState("")
  const [qty, setQty] = useState("1")
  const [ro, setRo] = useState(false)
  const disabled = id.trim().length == 0
  function total() {
    return numeral(cost * qty).format('0,0.00')
  }
  useEffect(() => {
    if (router.query.id) {
      setId(router.query.id)
      setRo(true)
    }
  }, [router.query])
  return (
    <>
      <Jumbo title="Transparent Princing" text={`$USD ${cost} per item license.
      No hidden fees, no surprises.`} />

      <div className="row align-items-md-stretch">
        <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
          <Form.Label column sm="1">
            Identity
          </Form.Label>
          <Col sm="7">
            <Form.Control type="text" placeholder="Type or Paste your Identity Key Here"
              value={id} onChange={(e) => setId(e.target.value)} disabled={ro} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
          <Form.Label column sm="1">
            Quantity
          </Form.Label>
          <Col sm="7">
            <Form.Select
              value={qty} onChange={(e) => setQty(e.target.value)}>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </Form.Select>
          </Col>
        </Form.Group>
        <Row>
          <Col sm="1">Total</Col>
          <Col sm="5"><span className='fw-bold'>$USD {total()}</span> before VAT</Col>
          <Col sm="2" className="d-flex justify-content-end">
            <Button disabled={disabled} variant="primary" title="Buy License">Buy Now</Button>
          </Col>
        </Row>
      </div>
    </>
  )
}
