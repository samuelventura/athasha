import Link from 'next/link'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'
import Jumbo from '../components/jumbo'

export default function Home() {
  const [id, setId] = useState("")
  const disabled = id.trim().length == 0
  return (
    <>
      <Jumbo title="Lean Automation Software">
        <p className="col-md-8 fs-4">We hate bloated and over-restricting software as much as you do.
          Our mission is to create lean, reliable, and affordable automation software tools.</p>
      </Jumbo>

      <div className="row align-items-md-stretch">
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="1">
            Identity
          </Form.Label>
          <Col sm="7">
            <Form.Control type="text" placeholder="Type or Paste your Identity Key Here"
              value={id} onChange={(e) => setId(e.target.value)} />
          </Col>
          <Col sm="4">
            <Link href={`/buy?id=${id}`}>
              <Button disabled={disabled} variant="link" title="Buy License">Buy</Button>
            </Link>
            <Link href={`/recover?id=${id}`}>
              <Button disabled={disabled} variant="link" title="Recover License">Recover</Button>
            </Link>
          </Col>
        </Form.Group>
      </div>
    </>
  )
}
