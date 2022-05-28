import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Button from 'react-bootstrap/Button'
import { useState } from 'react'
import Jumbo from '../components/jumbo'
import YoutubeEmbed from "../components/youtube";

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
          <li>
            <Link href="/demo02"><a>Opto22 Learning Center Demo</a></Link>
          </li>
        </ul>
        <Tabs defaultActiveKey="overview">
          <Tab eventKey="overview" title="Overview">
            <Image src="/slides.gif" layout="responsive" width={1024} height={576}
              alt="Athasha Slides" />
          </Tab>
          <Tab eventKey="installation" title="Installation Video">
            <YoutubeEmbed embedId="CyaJckPYIh4" />
          </Tab>
        </Tabs>
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
