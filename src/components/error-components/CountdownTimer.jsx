import { useState, useEffect } from 'react'

const TOTAL = 30

export default function CountdownTimer() {
  const [remaining, setRemaining] = useState(TOTAL)

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(id)
          window.location.reload()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const pct = (remaining / TOTAL) * 100

  return (
    <div className="w-full mb-6">
      {/* Track */}
      <div className="w-full h-1 rounded-full mb-2"
           style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div className="countdown-bar" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-center text-xs" style={{ color: '#4a5270' }}>
        Auto-refreshing in{' '}
        <span style={{ color: '#4f8ef7', fontWeight: 500 }}>{remaining}s</span>
      </p>
    </div>
  )
}
