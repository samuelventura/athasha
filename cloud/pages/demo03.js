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
        <title>Athasha.IO - Demo02</title>
      </Head>
      <Jumbo title="Laurel Electronics Meter Demo">
        <ul>
          <li>
            <Link href="/demo03-laurels.pdf"><a target="_blank">Introduction</a></Link>
          </li>
          <li>
            <Link href="/demo03.athasha.backup.json"><a target="_blank" download>Demo Backup</a></Link>
          </li>
        </ul>
        <Tabs defaultActiveKey="overview">
          <Tab eventKey="overview" title="Overview">
            <Image src="/demo03.png" alt="Laurel Electronics Meter"
              layout="responsive" width={960} height={540} />
          </Tab>
          <Tab eventKey="live-screen-testing" title="Live Screen Testing">
            <YoutubeEmbed embedId="SqVAubYEc8c" />
          </Tab>
        </Tabs>
      </Jumbo>
    </>
  )
}
