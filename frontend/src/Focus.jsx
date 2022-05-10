import { useEffect, useRef } from 'react'

function useFocus() {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      setTimeout(() => ref.current.focus(), 0)
    }
  }, [ref.current])
  return ref
}

export { useFocus }
