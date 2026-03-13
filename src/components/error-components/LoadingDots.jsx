export default function LoadingDots() {
  return (
    <div className="flex items-center justify-center gap-1.5 text-sm italic mb-6"
         style={{ color: '#4a5270' }}>
      <span>Trying to reconnect</span>
      <span className="flex items-center gap-0.5 ml-1">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className={`inline-block w-1 h-1 rounded-full bg-accent animate-bounce-dot dot-${i + 1}`}
            style={{ background: '#4f8ef7' }}
          />
        ))}
      </span>
    </div>
  )
}
