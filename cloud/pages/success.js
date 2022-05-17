import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Jumbo from '../components/jumbo'
import download from '../tools/download'

export default function Home() {
  const router = useRouter()
  const [license, setLicense] = useState(null)
  useEffect(() => {
    if (router.query.sid) {
      const sid = router.query.sid
      fetch('/api/gen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sid }),
      })
        .then(r => r.json())
        .then(r => {
          setLicense(r.license)
          download(r.license.identity, [r.license])
        })
    }
  }, [router.query])
  function options() {
    return license ? <ul>
      <li>You can <Link href={`/recover?id=${license.identity}`}>recover</Link> your licenses at any time.</li>
    </ul> : null
  }
  return (
    <>
      <Jumbo title="Thank you for your business!">
        <p className="col-md-8 fs-4">Your license download will start shortly.</p>
        {options()}
      </Jumbo>
    </>
  )
}
