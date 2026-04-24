import { TrendingUp, TrendingDown } from 'lucide-react'

function DeltaBadge({ delta }) {
  if (delta == null || isNaN(delta)) return null
  const up = delta >= 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.25rem',
        padding: '0.15rem 0.5rem',
        borderRadius: '9999px',
        background: up ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
        border: `1px solid ${up ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
      }}>
        {up
          ? <TrendingUp size={9} style={{ color: '#4ADE80' }} />
          : <TrendingDown size={9} style={{ color: '#F87171' }} />
        }
        <span style={{
          fontSize: '0.65rem', fontWeight: 700,
          color: up ? '#4ADE80' : '#F87171',
          letterSpacing: '0.02em',
        }}>
          {up ? '+' : ''}{delta.toFixed(1)}%
        </span>
      </div>
      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>vs mês anterior</span>
    </div>
  )
}

export default function MetricCard({ label, value, sub, icon: Icon, highlight, small, delta }) {
  if (highlight) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(10,30,18,0.95) 0%, rgba(6,20,12,0.9) 100%)',
        border: '1px solid rgba(74,222,128,0.35)',
        borderRadius: '1.125rem',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 0 40px rgba(74,222,128,0.1), 0 8px 32px rgba(0,0,0,0.4)',
      }}>
        {/* Top glow line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.8) 50%, transparent 100%)',
        }} />
        {/* Corner blob */}
        <div style={{
          position: 'absolute', top: '-30px', right: '-30px',
          width: '100px', height: '100px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.18), transparent)',
          filter: 'blur(20px)', pointerEvents: 'none',
        }} />
        {/* Bottom left subtle */}
        <div style={{
          position: 'absolute', bottom: '-20px', left: '-20px',
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(74,222,128,0.06), transparent)',
          filter: 'blur(20px)', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem', position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(74,222,128,0.6)' }}>
            {label}
          </span>
          {Icon && (
            <div style={{
              width: 36, height: 36, borderRadius: '0.75rem',
              background: 'rgba(74,222,128,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(74,222,128,0.2)',
            }}>
              <Icon size={16} style={{ color: '#4ADE80' }} />
            </div>
          )}
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '1.875rem', fontWeight: 800, color: '#4ADE80', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            {value}
          </p>
          {sub && (
            <p style={{ fontSize: '0.72rem', marginTop: '0.35rem', color: 'rgba(74,222,128,0.5)', fontWeight: 500 }}>
              {sub}
            </p>
          )}
          <DeltaBadge delta={delta} />
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid var(--glass-border)',
      borderRadius: '1.125rem',
      padding: '1.25rem',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: 'var(--glass-shadow), inset 0 1px 0 var(--glass-highlight)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(74,222,128,0.18)'
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(74,222,128,0.08), inset 0 1px 0 var(--glass-highlight)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'var(--glass-border)'
      e.currentTarget.style.boxShadow = 'var(--glass-shadow), inset 0 1px 0 var(--glass-highlight)'
    }}>
      {/* Top glow line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, var(--glass-highlight) 40%, rgba(74,222,128,0.1) 60%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 34, height: 34, borderRadius: '0.625rem',
            background: 'var(--glass-highlight)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)',
          }}>
            <Icon size={14} style={{ color: 'var(--text-secondary)' }} />
          </div>
        )}
      </div>
      <p style={{
        fontSize: small ? '1.25rem' : '1.875rem',
        fontWeight: 800,
        color: 'var(--text-primary)',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '0.72rem', marginTop: '0.35rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          {sub}
        </p>
      )}
      <DeltaBadge delta={delta} />
    </div>
  )
}
