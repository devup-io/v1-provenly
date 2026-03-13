function RetryIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

export default function ActionButtons() {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        onClick={() => window.location.reload()}
        className="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium text-white transition-all duration-200
                   hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #4f8ef7, #6d7ff0)',
          boxShadow: '0 4px 24px rgba(79,142,247,0.35)',
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(79,142,247,0.55)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(79,142,247,0.35)'}
      >
        <RetryIcon />
        Retry Now
      </button>

      <a
        href="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-200
                   hover:-translate-y-0.5 hover:scale-[1.03] active:scale-95"
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#8892b0',
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.10)'
          e.currentTarget.style.color = '#f0f2ff'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
          e.currentTarget.style.color = '#8892b0'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <HomeIcon />
        Go Home
      </a>
    </div>
  )
}
