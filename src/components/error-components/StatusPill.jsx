export default function StatusPill() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest font-display"
         style={{
           background: 'rgba(239,68,68,0.12)',
           borderColor: 'rgba(239,68,68,0.25)',
           color: '#f87171',
         }}>
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-blink" />
      Service Disruption
    </div>
  )
}
