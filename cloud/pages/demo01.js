import Link from 'next/link'
import Image from 'next/image'
import Jumbo from '../components/jumbo'

export default function Demo01() {
  return (
    <>
      <Jumbo title="Allen-Bradley Micro850 Demo">
        <ul>
          <li>
            <Link href="/demo01.pdf"><a target="_blank">Documentation</a></Link>
          </li>
          <li>
            <Link href="/demo01.athasha.backup.json"><a target="_blank" download>Download Backup</a></Link>
          </li>
        </ul>
        <Image src="/demo01.png" alt="Athasha AllenBradley Micro850" layout="responsive" width={960} height={540} />
      </Jumbo>
    </>
  )
}
