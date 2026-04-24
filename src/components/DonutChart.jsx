import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency, formatPercent } from '../utils/format'

const COLORS = ['#4ADE80','#38BDF8','#A78BFA','#FB923C','#F472B6','#FBBF24']

function CustomTooltip({ active, payload, currency }) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  const color = COLORS[item.payload.index % COLORS.length]
  return (
    <div style={{
      background: 'rgba(10,14,26,0.95)',
      border: `1px solid ${color}30`,
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
    }}>
      <p style={{ fontWeight: 600, color: '#EDF2F7', marginBottom: '0.3rem', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
        {item.name}
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatCurrency(item.value, currency)}</p>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color }}>{formatPercent(item.payload.percent * 100)}</p>
    </div>
  )
}

export default function DonutChart({ campaigns = [], currency = 'BRL' }) {
  const data = campaigns
    .filter((c) => c.spend > 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 6)
    .map((c, i) => ({ name: c.name, value: c.spend, index: i }))

  const total = data.reduce((s, d) => s + d.value, 0)

  if (!data.length) {
    return (
      <div style={{
        background: 'var(--glass-bg)', backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)', borderRadius: '1.125rem',
        padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 256, color: 'var(--text-secondary)', fontSize: '0.875rem',
      }}>
        Sem dados de campanhas
      </div>
    )
  }

  return (
    <div style={{
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid var(--glass-border)',
      borderRadius: '1.125rem', padding: '1.25rem',
      position: 'relative', overflow: 'hidden',
      boxShadow: 'var(--glass-shadow), inset 0 1px 0 var(--glass-highlight)',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, var(--glass-highlight), transparent)', pointerEvents: 'none' }} />

      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Distribuição de Gasto</h3>
        <p style={{ fontSize: '0.72rem', marginTop: '0.15rem', color: 'var(--text-secondary)' }}>Top campanhas · 30 dias</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Donut */}
        <div style={{ position: 'relative', flexShrink: 0, width: 136, height: 136 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={42} outerRadius={62}
                paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip currency={currency} />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center text */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
              {formatCurrency(total, currency)}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.45rem', minWidth: 0 }}>
          {data.map((item, i) => {
            const pct = total > 0 ? (item.value / total) * 100 : 0
            const color = COLORS[i % COLORS.length]
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: `0 0 6px ${color}60` }} />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(item.value, currency)}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: color, fontWeight: 600, minWidth: '1.8rem', textAlign: 'right' }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
