export default function LoadingSpinner({ message = 'Carregando dados do Meta Ads...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--border-hover)' }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: '#4ADE80' }} />
        <div className="absolute inset-2 rounded-full flex items-center justify-center"
          style={{ background: 'var(--card-bg)' }}>
          <span className="font-black text-sm" style={{ color: '#4ADE80' }}>G</span>
        </div>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  )
}
