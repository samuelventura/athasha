import { useRouter } from 'next/router'
import Link from 'next/link'
import Table from 'react-bootstrap/Table'
import { useEffect, useState } from 'react'
import Jumbo from '../components/jumbo'

export default function Home() {
  const router = useRouter()
  const [files, setFiles] = useState(null)
  function search() {
    setFiles(null)
    fetch("/api/list", {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(r => r.json())
      .then(r => { setFiles(r.files) })
  }
  useEffect(() => {
    search()
  }, [])
  useEffect(() => {
    if (router.query.file) {
      const element = document.createElement('a')
      element.setAttribute('href', `/api/file?f=${router.query.file}`)
      element.setAttribute('download', router.query.file)
      element.style.display = 'none'
      element.click()
    }
  }, [router.query])
  function tableRows(files) {
    return files.map((file, index) => {
      return <tr key={index} className="align-middle">
        <td>{index + 1}</td>
        <td>{file}</td>
        <td><Link href={`/download?file=${file}`}>Download</Link></td>
      </tr>
    })
  }
  function filesTable() {
    return files ? (<Table striped bordered hover>
      <thead>
        <tr>
          <th>#</th>
          <th>Release</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {tableRows(files)}
      </tbody>
    </Table>) : null
  }
  return (
    <>
      <Jumbo title="Download Area">
        <p className="col-md-8 fs-4">Evaluate at your own pace.</p>
      </Jumbo>

      <div className="file align-items-md-stretch">
        {filesTable()}
      </div>
    </>
  )
}
