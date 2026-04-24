import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatDate, formatCurrency, formatNumber, formatPercent } from '../utils/format'
import { useState } from 'react'

const METRICS = [
  { key: 'spend',       label: 'Gasto',      format: (v, c) => formatCurrency(v, c), color: '#4ADE80' },
  { key: 'impressions', label: 'Impressões',  format: (v) => formatNumber(v),         color: '#38BDF8' },
  { key: 'clicks',      label: 'Cliques',     format: (v) => formatNumber(v),         color: '#A78BFA' },
  { key: 'ctr',         label: 'CTR',         format: (v) => formatPercent(v),        color: '#FB923C' },
]

function fmtY(value, key) {
  if (key === 'spend') { return value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toFixed(0) }
  if (key === 'ctr')   return `${value.toFixed(1)}%`
  if (value >= 1000000) return `${(value/1000000).toFixed(1)}M`
  if (value >= 1000)    return `${(value/1000).toFixed(0)}k`
  return value
}

function CustomTooltip({ active, payload, label, metricDef, currency }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'rgba(10,14,26,0.95)',
      border: `1px solid ${metricDef.color}30`,
      borderRadius: '0.75rem',
      padding: '0.75rem 1rem',
      boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${metricDef.color}20`,
    }}>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
        {formatDate(label)}
      </p>
      <p style={{ fontSize: '0.95rem', fontWeight: 700, color: metricDef.color }}>
        {metricDef.format(payload[0].value, currency)}
      </p>
    </div>
  )
}

export default function SpendChart({ data = [], currency = 'BRL' }) {
  const [metricKey, setMetricKey] = useState('spend')
  const metricDef = METRICS.find(m => m.key === metricKey)
  const gradientId = `grad_${metricKey}`

  if (!data.length) {
    return (
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '1.125rem',
        padding: '1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: 256, color: 'var(--text-secondary)', fontSize: '0.875rem',
      }}>
        Sem dados nos últimos 30 dias
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
      position: 'relative', overflow: 'hidden',
      boxShadow: 'var(--glass-shadow), inset 0 1px 0 var(--glass-highlight)',
    }}>
      {/* Top line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: `linear-gradient(90deg, transparent, ${metricDef.color}30, transparent)`,
        transition: 'background 0.3s',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {metricDef.label} Diário
          </h3>
          <p style={{ fontSize: '0.72rem', marginTop: '0.15rem', color: 'var(--text-secondary)' }}>Últimos 30 dias</p>
        </div>

        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {METRICS.map(m => (
            <button key={m.key}
              onClick={() => setMetricKey(m.key)}
              style={{
                padding: '0.25rem 0.65rem',
                borderRadius: '9999px',
                fontSize: '0.68rem', fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${metricKey === m.key ? m.color + '50' : 'var(--border-hover)'}`,
                background: metricKey === m.key ? m.color + '15' : 'transparent',
                color: metricKey === m.key ? m.color : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={metricDef.color} stopOpacity={0.25} />
              <stop offset="75%" stopColor={metricDef.color} stopOpacity={0.02} />
              <stop offset="95%" stopColor={metricDef.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false} tickLine={false} interval={5} />
          <YAxis tickFormatter={v => fmtY(v, metricKey)}
            tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
            axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip metricDef={metricDef} currency={currency} />} cursor={{ stroke: metricDef.color + '30', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey={metricKey}
            stroke={metricDef.color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: metricDef.color, stroke: 'var(--page-bg)', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
