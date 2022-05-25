import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
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
      <Head>
        <title>Athasha.IO - Home</title>
      </Head>
      <Jumbo title="Automation Now">
        <p className="col-md-8 fs-4 cursor-pointer">Link plant floor devices to IT services in minutes, not months.</p>
        <ul>
          <li>
            <Link href="/demo01"><a>Allen-Bradley Micro850 Demo</a></Link>
          </li>
        </ul>
        <Link href="/demo01">
          <a className="slide" title="Click to access the Demo">
            <Image src="/demo01.png" alt="Athasha AllenBradley Micro850" layout="responsive" width={960} height={540} />
          </a>
        </Link>
      </Jumbo>

      <div className="row align-items-md-stretch">
        <Form.Group as={Row} className="mb-3">
          <Form.Label column sm="1">
            Identity
          </Form.Label>
          <Col sm="7">
            <Form.Control type="text" placeholder="Type or Paste your Identity Here"
              value={id} onChange={(e) => setId(e.target.value)} />
          </Col>
          <Col sm="4">
            <Link href={`/buy?id=${id}`}>
              <Button disabled={disabled} variant="link" title="Buy License">Buy</Button>
            </Link>
            <Link href={`/recover?query=${id}`}>
              <Button disabled={disabled} variant="link" title="Recover License">Recover</Button>
            </Link>
          </Col>
        </Form.Group>
      </div>
    </>
  )
}
