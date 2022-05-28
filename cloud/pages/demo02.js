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
      <Jumbo title="Opto22 Learning Center Demo">
        <ul>
          <li>
            <Link href="/demo02-opto22.pdf"><a target="_blank">Introduction</a></Link>
          </li>
          <li>
            <Link href="/demo02-pacman.otg"><a target="_blank">PacManager Backup</a></Link>
          </li>
          <li>
            <Link href="/demo02.athasha.backup.json"><a target="_blank" download>Demo Backup</a></Link>
          </li>
        </ul>
        <Tabs defaultActiveKey="overview">
          <Tab eventKey="overview" title="Overview">
            <Image src="/demo02.png" alt="Opto22 Learning Center"
              layout="responsive" width={960} height={540} />
          </Tab>
          <Tab eventKey="live-screen-testing" title="Live Screen Testing">
            <YoutubeEmbed embedId="D04rBPwaCxk" />
          </Tab>
        </Tabs>
      </Jumbo>
    </>
  )
}
