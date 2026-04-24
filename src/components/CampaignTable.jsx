import { useState } from 'react'
import { formatCurrency, formatNumber, formatPercent } from '../utils/format'
import { ChevronUp, ChevronDown, Download } from 'lucide-react'
import { exportCampaignsCSV } from '../utils/export'

const STATUS_CONFIG = {
  ACTIVE:          { label: 'Ativa',     color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)' },
  PAUSED:          { label: 'Pausada',   color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
  CAMPAIGN_PAUSED: { label: 'Pausada',   color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
  ADSET_PAUSED:    { label: 'Pausada',   color: '#FBBF24', bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.25)' },
  ARCHIVED:        { label: 'Arquivada', color: 'var(--text-muted)', bg: 'var(--glass-highlight)', border: 'var(--border-hover)' },
  DELETED:         { label: 'Deletada',  color: 'var(--text-muted)', bg: 'var(--glass-highlight)', border: 'var(--border-hover)' },
}

const FILTERS = [
  { key: 'all',    label: 'Todas' },
  { key: 'active', label: 'Ativas' },
  { key: 'paused', label: 'Pausadas' },
]

const isActive = s => s === 'ACTIVE'
const isPaused = s => ['PAUSED','CAMPAIGN_PAUSED','ADSET_PAUSED'].includes(s)

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.ARCHIVED
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      padding: '0.2rem 0.6rem', borderRadius: '9999px',
      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.03em',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, boxShadow: `0 0 4px ${cfg.color}` }} />
      {cfg.label}
    </span>
  )
}

function InitialAvatar({ name }) {
  const letters = name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('')
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '0.625rem', flexShrink: 0,
      background: 'rgba(74,222,128,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1px solid rgba(74,222,128,0.15)',
    }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#4ADE80' }}>{letters}</span>
    </div>
  )
}

export default function CampaignTable({ campaigns = [], currency = 'BRL', showAccount = false }) {
  const [filter, setFilter] = useState('all')
  const [collapsed, setCollapsed] = useState(false)

  const filtered = campaigns.filter(c => {
    if (filter === 'active') return isActive(c.status)
    if (filter === 'paused') return isPaused(c.status)
    return true
  })

  const counts = {
    all: campaigns.length,
    active: campaigns.filter(c => isActive(c.status)).length,
    paused: campaigns.filter(c => isPaused(c.status)).length,
  }

  const headers = ['Campanha', ...(showAccount ? ['Conta'] : []), 'Status', 'Gasto', 'Impressões', 'Cliques', 'CTR', 'CPC', 'CPM']

  return (
    <div style={{
      background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid var(--glass-border)', borderRadius: '1.125rem',
      overflow: 'hidden',
      boxShadow: 'var(--glass-shadow), inset 0 1px 0 var(--glass-highlight)',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
        padding: '1rem 1.25rem',
        borderBottom: collapsed ? 'none' : '1px solid var(--border)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--glass-highlight), rgba(74,222,128,0.12), transparent)', pointerEvents: 'none' }} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Atividade das Campanhas</p>
          <p style={{ fontSize: '0.72rem', marginTop: '0.1rem', color: 'var(--text-secondary)' }}>Resultados dos últimos 30 dias</p>
        </div>

        {!collapsed && (
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {FILTERS.map(f => (
              <button key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  padding: '0.25rem 0.65rem', borderRadius: '9999px',
                  fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                  background: filter === f.key ? 'rgba(74,222,128,0.12)' : 'transparent',
                  color: filter === f.key ? '#4ADE80' : 'var(--text-secondary)',
                  border: `1px solid ${filter === f.key ? 'rgba(74,222,128,0.3)' : 'var(--border-hover)'}`,
                  transition: 'all 0.15s',
                }}>
                {f.label} <span style={{ opacity: 0.6 }}>({counts[f.key]})</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          {!collapsed && (
            <button onClick={() => exportCampaignsCSV(filtered)} className="btn-outline" style={{ fontSize: '0.7rem', gap: '0.35rem', padding: '0.3rem 0.65rem' }}>
              <Download size={11} /> CSV
            </button>
          )}
          <button onClick={() => setCollapsed(v => !v)} className="btn-ghost" style={{ padding: '0.35rem' }}>
            {collapsed
              ? <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
              : <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} />
            }
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={{ overflowX: 'auto' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Nenhuma campanha {filter === 'active' ? 'ativa' : filter === 'paused' ? 'pausada' : ''} encontrada
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {headers.map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '0.75rem 1.25rem',
                      fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.1em', whiteSpace: 'nowrap',
                      color: 'var(--text-muted)',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={`${c.id}-${i}`}
                    style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--row-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <InitialAvatar name={c.name} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }} title={c.name}>
                            {c.name}
                          </p>
                          {c.objective && (
                            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{c.objective}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {showAccount && (
                      <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '0.5rem', background: 'var(--glass-highlight)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                          {c.accountName || '—'}
                        </span>
                      </td>
                    )}

                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={c.status} />
                    </td>

                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(c.spend, c.currency || currency)}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatNumber(c.impressions)}
                    </td>

                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatNumber(c.clicks)}
                    </td>

                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: c.ctr >= 2 ? '#4ADE80' : c.ctr >= 1 ? '#FBBF24' : 'var(--text-secondary)' }}>
                        {formatPercent(c.ctr)}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatCurrency(c.cpc, c.currency || currency)}
                    </td>

                    <td style={{ padding: '0.875rem 1.25rem', whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatCurrency(c.cpm, c.currency || currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
