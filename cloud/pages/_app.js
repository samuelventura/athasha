import 'bootstrap/dist/css/bootstrap.css'
import '../styles/index.css'
import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faComment } from '@fortawesome/free-solid-svg-icons'
import ToastContainer from 'react-bootstrap/ToastContainer'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Toast from 'react-bootstrap/Toast'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'

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
    return <ToastContainer className="position-fixed p-3" position="bottom-start">
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

  function ContactMessage() {
    const [pulse, setPulse] = useState(false)
    const [show, setShow] = useState(false)
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    function isValid() {
      return email.trim().length > 0
        && message.trim().length > 0
        && email.indexOf("@") > 0
    }
    function onClick() { setShow(true) }
    function onCancel() {
      setEmail("")
      setMessage("")
      setShow(false)
    }
    function onAccept() {
      fetch("/api/send", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, message }),
      })
        .then(onCancel)
    }
    useEffect(() => {
      const timer = setInterval(() => { setPulse(!pulse) }, 500)
      return () => clearInterval(timer)
    })
    return <>
      <Modal show={show} onHide={onCancel} centered>
        <Modal.Header closeButton>
          <Modal.Title>Leave Us a Message</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FloatingLabel label="Your Email">
            <Form.Control autoFocus type="email"
              value={email} onChange={e => setEmail(e.target.value)} />
          </FloatingLabel>
          <FloatingLabel label="Your Message">
            <Form.Control type="text" as="textarea" style={{ height: '8em' }}
              value={message} onChange={e => setMessage(e.target.value)} />
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onAccept} disabled={!isValid()}>
            Send
          </Button>
        </Modal.Footer>
      </Modal>
      <ToastContainer className="position-fixed  bg-transparent p-3 leaveMessage" position="bottom-end"
        title="Leave Us a Message" onClick={onClick}>
        <Toast show={true} className="shadow-none border-0 bg-transparent">
          <FontAwesomeIcon icon={faComment} className={pulse && !show ? "icon-up" : "icon-down"} />
        </Toast>
      </ToastContainer>
    </>
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
      <title>Athasha.IO</title>
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
        <ContactMessage />
      </div>
    </main>
  </>
}

export default MyApp
