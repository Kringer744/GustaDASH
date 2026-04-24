import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, Check } from 'lucide-react'
import { useApp } from '../store/AppContext'

const PRESETS = [
  { key: 'today',     label: 'Hoje' },
  { key: 'yesterday', label: 'Ontem' },
  { key: 'last_7d',   label: '7 dias' },
  { key: 'last_14d',  label: '14 dias' },
  { key: 'last_30d',  label: '30 dias' },
  { key: 'last_60d',  label: '60 dias' },
  { key: 'last_90d',  label: '90 dias' },
]

function presetLabel(dr) {
  if (!dr || dr.preset) {
    return PRESETS.find(p => p.key === (dr?.preset || 'last_30d'))?.label || dr?.preset || '30 dias'
  }
  const fmt = s => {
    const [y, m, d] = s.split('-')
    return `${d}/${m}/${y.slice(2)}`
  }
  return `${fmt(dr.since)} – ${fmt(dr.until)}`
}

export default function DateRangePicker() {
  const { dateRange, setDateRange } = useApp()
  const [open, setOpen] = useState(false)
  const [customSince, setCustomSince] = useState('')
  const [customUntil, setCustomUntil] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const today = new Date().toISOString().split('T')[0]

  function applyPreset(preset) {
    setDateRange({ preset, since: null, until: null })
    setOpen(false)
  }

  function applyCustom() {
    if (!customSince || !customUntil) return
    setDateRange({ preset: null, since: customSince, until: customUntil })
    setOpen(false)
  }

  const isCustom = !dateRange.preset

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.45rem 0.875rem', borderRadius: '0.75rem',
          fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
          background: open ? 'rgba(74,222,128,0.1)' : 'var(--glass-bg)',
          border: `1px solid ${open ? 'rgba(74,222,128,0.4)' : 'var(--border-hover)'}`,
          color: open ? '#4ADE80' : 'var(--text-primary)',
          transition: 'all 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(74,222,128,0.08)' : 'none',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = 'rgba(74,222,128,0.3)'; e.currentTarget.style.color = 'var(--text-primary)' } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.color = 'var(--text-primary)' } }}>
        <Calendar size={13} style={{ color: open ? '#4ADE80' : 'var(--text-muted)', flexShrink: 0 }} />
        <span>{presetLabel(dateRange)}</span>
        <ChevronDown size={12} style={{ color: 'var(--text-muted)', transition: 'transform 0.15s', transform: open ? 'rotate(180deg)' : 'none' }} />
      </button>

      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            width: 240, borderRadius: '1rem', zIndex: 200,
            background: 'var(--elevated-bg)',
            border: '1px solid var(--border-hover)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}>

          {/* Preset section */}
          <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.25rem' }}>
              Períodos rápidos
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
              {PRESETS.map(p => {
                const active = dateRange.preset === p.key
                return (
                  <button
                    key={p.key}
                    onClick={() => applyPreset(p.key)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.4rem 0.6rem', borderRadius: '0.5rem',
                      fontSize: '0.75rem', fontWeight: active ? 700 : 500,
                      cursor: 'pointer', textAlign: 'left',
                      background: active ? 'rgba(74,222,128,0.12)' : 'transparent',
                      color: active ? '#4ADE80' : 'var(--text-secondary)',
                      border: `1px solid ${active ? 'rgba(74,222,128,0.25)' : 'transparent'}`,
                      transition: 'all 0.1s',
                    }}
                    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--row-hover)'; e.currentTarget.style.borderColor = 'var(--border-hover)' } }}
                    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}>
                    {p.label}
                    {active && <Check size={11} style={{ color: '#4ADE80', flexShrink: 0 }} />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom date section */}
          <div style={{ padding: '0.75rem' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              Período personalizado
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.375rem' }}>
                <div>
                  <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>De</label>
                  <input
                    type="date"
                    value={customSince || (isCustom ? dateRange.since : '')}
                    max={customUntil || today}
                    onChange={e => setCustomSince(e.target.value)}
                    style={{
                      width: '100%', padding: '0.375rem 0.5rem',
                      borderRadius: '0.5rem', fontSize: '0.72rem',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-hover)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      colorScheme: 'dark',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#4ADE80'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(74,222,128,0.1)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>Até</label>
                  <input
                    type="date"
                    value={customUntil || (isCustom ? dateRange.until : '')}
                    min={customSince}
                    max={today}
                    onChange={e => setCustomUntil(e.target.value)}
                    style={{
                      width: '100%', padding: '0.375rem 0.5rem',
                      borderRadius: '0.5rem', fontSize: '0.72rem',
                      background: 'var(--input-bg)',
                      border: '1px solid var(--border-hover)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      colorScheme: 'dark',
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = '#4ADE80'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(74,222,128,0.1)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.boxShadow = 'none' }}
                  />
                </div>
              </div>

              <button
                onClick={applyCustom}
                disabled={!customSince || !customUntil}
                style={{
                  width: '100%', padding: '0.5rem',
                  borderRadius: '0.625rem', fontSize: '0.75rem', fontWeight: 700,
                  cursor: customSince && customUntil ? 'pointer' : 'not-allowed',
                  background: customSince && customUntil
                    ? 'linear-gradient(135deg, #4ADE80, #22C55E)'
                    : 'var(--glass-bg)',
                  color: customSince && customUntil ? '#071510' : 'var(--text-muted)',
                  border: 'none',
                  transition: 'all 0.15s',
                  opacity: customSince && customUntil ? 1 : 0.5,
                }}>
                Aplicar período
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
