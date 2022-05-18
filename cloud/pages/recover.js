import { useRouter } from 'next/router'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { useEffect, useState } from 'react'
import Jumbo from '../components/jumbo'
import download from '../tools/download'

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
    const date = new Date(`${dt} UTC`);
    return date.toLocaleString()
  }
  function tableRows(rows) {
    function onClick(row) {
      download(row.license.identity, [row.license])
    }
    return rows.map((row, index) => {
      return <tr key={index} className="align-middle">
        <td>{index + 1}</td>
        <td>{localDate(row.dt)}</td>
        <td>{row.qty}</td>
        <td>{row.email}</td>
        <td>{row.aid}</td>
        <td><Button onClick={() => onClick(row)} variant="link">Download</Button></td>
      </tr>
    })
  }
  function licensesTable() {
    return rows ? (<Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Timestamp</th>
          <th>Qty</th>
          <th>Email</th>
          <th>Identity</th>
          <th>Actions</th>
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
        <p className="col-md-8 fs-4">Search by Email or by Identity Key</p>
      </Jumbo>

      <div className="row align-items-md-stretch">
        <Form.Group as={Row} className="mb-3" controlId="formPlaintextEmail">
          <Form.Label column sm="3">
            Email or Identity Key
          </Form.Label>
          <Col sm="7">
            <Form.Control type="text" placeholder="Type or Paste your Email or Identity Key Here"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </Col>
          <Col sm="2" className="d-flex justify-content-start">
            <Button onClick={() => search(query)} variant="primary"
              title="Search">Search</Button>
          </Col>
        </Form.Group>

        {licensesTable()}
      </div>
    </>
  )
}
