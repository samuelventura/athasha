import React, { useEffect, useMemo, useState } from 'react'

function Title({ title }) {
    console.log("Title")
    return <h1>{title}</h1>
}

function Zero({ onClick }) {
    console.log("Zero")
    return <input type="button" value="Zero" onClick={onClick} />
}

function Timer({ name }) {
    console.log("Timer", name)
    const [count, setCount] = useState(0)
    function onZero() { setCount(0) }
    useEffect(() => {
        console.log("Timer useEffect []", name)
        const interval = setInterval(() => {
            setCount((prev) => prev + 1)
        }, 1000)
        return () => { clearInterval(interval) }
    }, [])
    useEffect(() => {
        console.log("Timer useEffect count", name, count)
    }, [count])
    return <div>
        Timer {count}
        <Zero onClick={onZero} />
    </div>
}

function App() {
    console.log("App")
    const [title, setTitle] = useState("React 17 App")
    const MemoTimer = React.memo(Timer)
    function onClick() {
        console.log("onClick")
        setTitle("React 17 App " + new Date().toISOString())
    }
    return <div>
        <Title title={title} />
        <Timer name="normal" />
        <MemoTimer name="memo" />
        <input type="button" value="Timestamp" onClick={onClick} />
    </div>
}

export default App
