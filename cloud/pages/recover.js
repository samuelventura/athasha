import { useRouter } from 'next/router'
import Link from 'next/link'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { useEffect, useState } from 'react'
import Jumbo from '../components/jumbo'
import download from '../tools/download'
import moment from 'moment'

export default function Home() {
  const router = useRouter()
  const [rows, setRows] = useState(null)
  const [query, setQuery] = useState("")
  function search(query) {
    setRows(null)
    fetch("/api/get", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    })
      .then(r => r.json())
      .then(r => { setRows(r.rows) })
  }
  useEffect(() => {
    if (router.query.query) {
      setQuery(router.query.query)
      search(router.query.query)
    }
  }, [router.query])
  function localDate(dt) {
    const format = "YYYY-MM-DD hh:mm:ss"
    const date = moment.utc(dt, format)
    return date.local().format(format)
  }
  function tableRows(rows) {
    function onClick(row) {
      const file = `${row.license.identity}-${row.license.purchase}`
      download(file, [row.license])
    }
    return rows.map((row, index) => {
      //adding copy on click is unreliable and make manually 
      //selecting the text for copying impossible
      //text-break for smartphone fluid rendering
      return <tr key={index} className="align-middle">
        <td>{index + 1}</td>
        <td className='text-break'>{localDate(row.dt)}</td>
        <td>{row.qty}</td>
        <td className='text-break'>{row.email}</td>
        <td className='text-break'>{row.aid}</td>
        <td className='text-break'><Button onClick={() => onClick(row)}
          variant="link" title="Download One">Download</Button></td>
      </tr>
    })
  }
  function licensesTable() {
    function onClickAll() {
      const list = rows.map((row) => row.license)
      download(query, list)
    }
    return rows ? (<Table striped bordered hover>
      <thead>
        <tr className="align-middle">
          <th>#</th>
          <th>Timestamp</th>
          <th>Qty</th>
          <th>Email</th>
          <th>Identity</th>
          <th>Actions <Button onClick={() => onClickAll()} className="mb-1"
            variant="link" title="Download All">All</Button></th>
        </tr>
      </thead>
      <tbody>
        {tableRows(rows)}
      </tbody>
    </Table>) : null
  }
  return (
    <>
      <Jumbo title="License Recovery">
        <p className="col-md-8 fs-4">Search by Email or by Identity</p>
      </Jumbo>

      <div className="row align-items-md-stretch">
        <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
          <Form.Label column sm="3">
            Email or Identity
          </Form.Label>
          <Col sm="7">
            <Form.Control type="text" placeholder="Type or Paste your Email or Identity Here"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </Col>
          <Col sm="2" className="d-flex justify-content-start">
            <Link href={`/recover?query=${query}`}>
              <Button variant="primary" title="Search">Search</Button>
            </Link>
          </Col>
        </Form.Group>

        {licensesTable()}
      </div>
    </>
  )
}
