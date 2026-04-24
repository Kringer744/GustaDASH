import { useState, useRef, useEffect } from 'react'
import { RefreshCw, Search, Sun, Moon, X } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useTheme } from '../store/ThemeContext'
import { timeAgo, formatCurrency } from '../utils/format'
import NotificationBell from './NotificationBell'

function AccountSearch({ accounts, searchAccount, setSearchAccount }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = searchAccount.trim()
    ? accounts.filter(a => a.name.toLowerCase().includes(searchAccount.toLowerCase()))
    : []

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  return (
    <div style={{ position: 'relative' }} ref={ref} className="hidden md:block">
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'var(--input-bg)', border: '1px solid var(--border-hover)',
        borderRadius: '0.75rem', padding: '0.45rem 0.75rem',
        width: '13rem', transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onFocusCapture={e => { e.currentTarget.style.borderColor = '#4ADE80'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(74,222,128,0.1)' }}
      onBlurCapture={e => { e.currentTarget.style.borderColor = 'var(--border-hover)'; e.currentTarget.style.boxShadow = 'none' }}>
        <Search size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          value={searchAccount}
          onChange={e => { setSearchAccount(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar conta..."
          style={{
            flex: 1, background: 'transparent', outline: 'none', border: 'none',
            fontSize: '0.8rem', color: 'var(--text-primary)', minWidth: 0,
          }}
        />
        {searchAccount && (
          <button onClick={() => { setSearchAccount(''); setOpen(false) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <X size={11} style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="animate-slide-down" style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0,
          width: '18rem', borderRadius: '0.875rem', zIndex: 50, overflow: 'hidden',
          background: 'var(--elevated-bg)', border: '1px solid var(--border-hover)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}>
          {filtered.slice(0, 6).map(acc => (
            <button key={acc.id}
              onClick={() => { setSearchAccount(''); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 1rem', textAlign: 'left',
                background: 'none', border: 'none', cursor: 'pointer',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
              <span style={{
                width: 28, height: 28, borderRadius: '0.5rem', flexShrink: 0,
                background: 'rgba(74,222,128,0.12)', color: '#4ADE80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800,
              }}>
                {acc.name[0]}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                {acc.name}
              </span>
              {!acc.error && (
                <span style={{ fontSize: '0.72rem', color: '#4ADE80', fontWeight: 600, flexShrink: 0 }}>
                  {formatCurrency(acc.balance, acc.currency)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header({ title, subtitle }) {
  const { refresh, loading, lastUpdated, accounts, searchAccount, setSearchAccount } = useApp()
  const { isDark, toggle } = useTheme()

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0.875rem 1.5rem', flexShrink: 0,
      background: 'var(--header-bg)',
      borderBottom: '1px solid var(--border)',
      position: 'relative',
    }}>
      {/* Bottom glow line */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(74,222,128,0.12) 50%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '0.75rem', marginTop: '0.1rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {lastUpdated && (
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '0.5rem', display: 'none' }}
            className="lg:block">
            {timeAgo(lastUpdated)}
          </span>
        )}

        <AccountSearch accounts={accounts} searchAccount={searchAccount} setSearchAccount={setSearchAccount} />

        <button onClick={refresh} disabled={loading} className="btn-ghost" style={{ padding: '0.45rem' }} title="Atualizar">
          <RefreshCw size={13} style={{ color: loading ? '#4ADE80' : 'var(--text-secondary)' }}
            className={loading ? 'animate-spin' : ''} />
        </button>

        <button onClick={toggle} className="btn-ghost" style={{ padding: '0.45rem' }} title={isDark ? 'Modo claro' : 'Modo escuro'}>
          {isDark
            ? <Sun size={13} style={{ color: 'var(--text-secondary)' }} />
            : <Moon size={13} style={{ color: 'var(--text-secondary)' }} />
          }
        </button>

        <NotificationBell />

        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #4ADE80, #16A34A)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 14px rgba(74,222,128,0.35)',
          marginLeft: '0.25rem',
        }}>
          <span style={{ color: '#071510', fontSize: '0.7rem', fontWeight: 900 }}>G</span>
        </div>
      </div>
    </div>
  )
}
