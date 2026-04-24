import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { formatCurrency } from '../utils/format'

export default function AlertBanner() {
  const { alertAccounts } = useApp()
  const [dismissed, setDismissed] = useState([])
  const visible = alertAccounts.filter((a) => !dismissed.includes(a.id))
  if (!visible.length) return null

  return (
    <div className="space-y-2 mb-5 animate-fade-in">
      {visible.map((acc) => (
        <div key={acc.id} className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
          style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background: 'rgba(248,113,113,0.12)' }}>
            <AlertTriangle size={15} style={{ color: '#F87171' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              🚨 OLHA O SALDO DA CONTA{' '}
              <span style={{ color: '#4ADE80' }}>{acc.name.toUpperCase()}</span>{' '}
              TA ACABANDO — FICA DE OLHO!
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Saldo atual:{' '}
              <span className="font-semibold" style={{ color: '#F87171' }}>
                {formatCurrency(acc.balance, acc.currency)}
              </span>
            </p>
          </div>
          <button onClick={() => setDismissed((d) => [...d, acc.id])}
            className="p-1 rounded-lg shrink-0 transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
