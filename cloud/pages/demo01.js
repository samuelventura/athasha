import Link from 'next/link'
import Head from 'next/head'
import Image from 'next/image'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Jumbo from '../components/jumbo'
import YoutubeEmbed from "../components/youtube";

export default function Demo01() {
  return (
    <>
      <Head>
        <title>Athasha.IO - Demo01</title>
      </Head>
      <Jumbo title="Allen-Bradley Micro850 Demo">
        <ul>
          <li>
            <Link href="/demo01-quick.pdf"><a target="_blank">Quick Start</a></Link>
          </li>
          <li>
            <Link href="/demo01-guide.pdf"><a target="_blank">User Guide</a></Link>
          </li>
          <li>
            <Link href="/demo01.athasha.backup.json"><a target="_blank" download>Demo Backup</a></Link>
          </li>
        </ul>
        <Tabs defaultActiveKey="overview" id="tabs">
          <Tab eventKey="overview" title="Overview">
            <Image src="/demo01.png" alt="Athasha AllenBradley Micro850"
              layout="responsive" width={960} height={540} priority="lazy" />
          </Tab>
          <Tab eventKey="live-screen-testing" title="Live Screen Testing">
            <YoutubeEmbed embedId="Qwzs0qlyGEI" />
          </Tab>
        </Tabs>
      </Jumbo>
    </>
  )
}
