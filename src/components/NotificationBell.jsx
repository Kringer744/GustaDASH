import { useState, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, ChevronRight, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { formatCurrency } from '../utils/format'
import { Link } from 'react-router-dom'

export default function NotificationBell() {
  const { alertAccounts, thresholds } = useApp()
  const [open, setOpen] = useState(false)
  const [dismissed, setDismissed] = useState([])
  const ref = useRef(null)
  const visible = alertAccounts.filter((a) => !dismissed.includes(a.id))
  const count = visible.length

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const dropdownBg = 'var(--elevated-bg)'
  const borderColor = 'var(--border-hover)'

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((v) => !v)}
        className="btn-ghost p-2 relative"
        style={open ? { background: 'var(--row-hover)' } : {}}>
        <Bell size={15} style={{ color: 'var(--text-secondary)' }} />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
            style={{ boxShadow: '0 0 0 2px var(--header-bg)' }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl z-50 animate-slide-down overflow-hidden"
          style={{ background: dropdownBg, border: `1px solid ${borderColor}`, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid var(--border)` }}>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Notificações</p>
              {count > 0 && (
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {count} alerta{count > 1 ? 's' : ''} de saldo
                </p>
              )}
            </div>
            {count > 0 && (
              <button onClick={() => setDismissed(alertAccounts.map(a => a.id))}
                className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                Limpar tudo
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(74,222,128,0.1)' }}>
                  <Bell size={16} style={{ color: '#4ADE80' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tudo certo!</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Nenhuma conta com saldo baixo</p>
              </div>
            ) : (
              visible.map((acc) => {
                const threshold = thresholds[acc.id] || 0
                const isCritical = acc.balance < threshold * 0.5
                return (
                  <div key={acc.id} className="flex items-start gap-3 px-4 py-3.5"
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: isCritical ? 'rgba(248,113,113,0.05)' : 'rgba(251,191,36,0.04)',
                    }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: isCritical ? 'rgba(248,113,113,0.12)' : 'rgba(251,191,36,0.1)' }}>
                      <AlertTriangle size={14} style={{ color: isCritical ? '#F87171' : '#FBBF24' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {isCritical ? '🚨' : '⚠️'} {acc.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        Saldo:{' '}
                        <span className="font-semibold" style={{ color: isCritical ? '#F87171' : '#FBBF24' }}>
                          {formatCurrency(acc.balance, acc.currency)}
                        </span>
                        {threshold > 0 && (
                          <span style={{ color: 'var(--text-muted)' }}> · limite: {formatCurrency(threshold, acc.currency)}</span>
                        )}
                      </p>
                      <p className="text-[10px] mt-1 font-bold uppercase tracking-wide"
                        style={{ color: isCritical ? '#F87171' : '#FBBF24' }}>
                        {isCritical ? 'CRÍTICO — FICA DE OLHO!' : 'TA ACABANDO — FICA DE OLHO!'}
                      </p>
                    </div>
                    <button onClick={() => setDismissed((d) => [...d, acc.id])}
                      className="p-1 rounded-lg shrink-0 transition-colors" style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                      <X size={12} />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.1)' }}>
            <Link to="/balances" onClick={() => setOpen(false)}
              className="flex items-center justify-between text-xs font-semibold transition-colors"
              style={{ color: '#4ADE80' }}>
              Ver gestão de saldos <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
