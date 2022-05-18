import 'bootstrap/dist/css/bootstrap.css'
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image'
import Toast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

function MyApp({ Component, pageProps }) {
  function CookieConsent() {
    const privacyPolicyVersion = "1" //update privacy policy version here
    const privacyPolicyItem = "privacyPolicyConsent"
    const [privacyPolicyConsent, setPrivacyPolicyOk] = useState(privacyPolicyVersion)
    function onClick() {
      window.localStorage.setItem(privacyPolicyItem, privacyPolicyVersion)
      setPrivacyPolicyOk(privacyPolicyVersion)
    }
    function isValid() {
      return privacyPolicyConsent === privacyPolicyVersion
    }
    useEffect(() => {
      setPrivacyPolicyOk(localStorage.getItem(privacyPolicyItem) || "")
    }, [])
    return <ToastContainer className="p-3" position="bottom-start">
      <Toast show={!isValid()}>
        <Toast.Header closeButton={false}>Privacy Policy Consent Required</Toast.Header>
        <Toast.Body>Usage of this site requires you to consent to our&nbsp;
          <Link href="/privacy"><a className="ml-1 text-decoration-none">Privacy Policy</a></Link>
          &nbsp;regarding cookies and data collection.
        </Toast.Body>
        <div className="border-top d-flex justify-content-end">
          <button onClick={onClick} type="button" className="m-2 btn btn-primary">
            Consent To Privacy Policy
          </button>
        </div>
      </Toast>
    </ToastContainer>
  }

  return <>
    {/* Do not put this scripts within or below head */}
    <Script
      strategy="lazyOnload"
      src={`https://www.googletagmanager.com/gtag/js?id=G-TMPGXYK1VB`}
    />
    <Script id="google-analytics" strategy="lazyOnload">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-TMPGXYK1VB', {
          page_path: window.location.pathname,
        });
      `}
    </Script>
    <Head>
      <title>Athasha</title>
      <meta name="description" content="Link OT devices to IT services in no time." />
      <link rel="icon" href="/favicon.svg" />
    </Head>
    <main>
      <div className="container py-4">
        <header className="pb-3 mb-4 border-bottom">
          <Link href="/"><a className="d-flex align-items-center text-dark text-decoration-none">
            <Image src="/logo.svg" alt="Athasha" height={48} width={48 * 4} />
          </a></Link>
        </header>

        <Component {...pageProps} />

        <footer className="pt-3 mt-4 text-muted border-top">
          <div className="row">
            <div className="col-12 col-md">
              &copy; Athasha.IO 2022
            </div>
            <div className="col-6 col-md">
              <h5>Resources</h5>
              <ul className="list-unstyled text-small">
                <li className="mb-1"><Link href="/"><a className="link-secondary text-decoration-none">Home</a></Link></li>
                <li className="mb-1"><Link href="/recover"><a className="link-secondary text-decoration-none">Recover</a></Link></li>
                <li className="mb-1"><Link href="/download"><a className="link-secondary text-decoration-none">Download</a></Link></li>
                <li className="mb-1"><Link href="/buy"><a className="link-secondary text-decoration-none">Buy</a></Link></li>
              </ul>
            </div>
            <div className="col-6 col-md">
              <h5>Contact Us</h5>
              <ul className="list-unstyled text-small">
                <li className="mb-1"><a className="link-secondary text-decoration-none" href="mailto:sales@athasha.io">sales@athasha.io</a></li>
                <li className="mb-1"><a className="link-secondary text-decoration-none" href="mailto:support@athasha.io">support@athasha.io</a></li>
              </ul>
            </div>
            <div className="col-6 col-md">
              <h5>About</h5>
              <ul className="list-unstyled text-small">
                <li className="mb-1"><Link href="/privacy"><a className="link-secondary text-decoration-none">Privacy Policy</a></Link></li>
              </ul>
            </div>
          </div>
        </footer>
        <CookieConsent />
      </div>
    </main>
  </>
}

export default MyApp
