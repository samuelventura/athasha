import React, { useEffect, useState } from 'react'

function Timer() {
    console.log("Timer")
    const [count, setCount] = useState(0)
    useEffect(() => {
        console.log("Timer useEffect")
        const interval = setInterval(() => {
            setCount((prev) => prev + 1)
        }, 1000)
        return () => { clearInterval(interval) }
    }, [])
    return <div>
        Timer {count}
    </div>
}

export default Timer
