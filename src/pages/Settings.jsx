import { useState } from 'react'
import { useApp } from '../store/AppContext'
import { AD_ACCOUNTS } from '../utils/constants'
import { formatCurrency } from '../utils/format'
import { Save, CheckCircle, Bell, AlertTriangle } from 'lucide-react'
import Header from '../components/Header'

function ThresholdRow({ account, liveData, threshold, onSave }) {
  const [value, setValue] = useState(threshold?.toString() || '')
  const [saved, setSaved] = useState(false)

  const balance = liveData?.balance ?? null
  const currency = liveData?.currency || 'BRL'
  const isLow = balance != null && parseFloat(value) > 0 && balance < parseFloat(value)
  const isCritical = isLow && balance < parseFloat(value) * 0.5

  function handleSave() {
    onSave(account.id, value)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="card-glass px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors"
      style={isCritical
        ? { border: '1px solid rgba(248,113,113,0.3)' }
        : isLow
        ? { border: '1px solid rgba(251,191,36,0.3)' }
        : {}}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: isCritical ? 'rgba(248,113,113,0.12)' : isLow ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.1)',
          }}>
          <span className="text-xs font-bold"
            style={{ color: isCritical ? '#F87171' : isLow ? '#FBBF24' : 'var(--text-secondary)' }}>
            {account.name[0].toUpperCase()}
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{account.name}</p>
            {isLow && <AlertTriangle size={13} style={{ color: isCritical ? '#F87171' : '#FBBF24', flexShrink: 0 }} />}
          </div>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>act_{account.id}</p>
          {balance != null && (
            <p className="text-xs mt-0.5">
              Saldo atual:{' '}
              <span className="font-semibold"
                style={{ color: isCritical ? '#F87171' : isLow ? '#FBBF24' : '#4ADE80' }}>
                {formatCurrency(balance, currency)}
              </span>
            </p>
          )}
          {liveData?.error && <p className="text-[11px] mt-0.5" style={{ color: '#F87171' }}>{liveData.error}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}>R$</span>
          <input
            type="number" min="0" step="10"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Sem limite"
            className="input w-36 pl-8 text-sm"
          />
        </div>
        <button onClick={handleSave}
          className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? '' : 'btn-accent'}`}
          style={saved ? { background: 'rgba(74,222,128,0.12)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' } : {}}>
          {saved ? <CheckCircle size={14} /> : <Save size={14} />}
          {saved ? 'Salvo!' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

export default function Settings() {
  const { thresholds, saveThreshold, accounts, alertAccounts } = useApp()

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Configurações de Alerta"
        subtitle="Defina o saldo mínimo por conta para receber alertas automáticos"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-5">

          {/* Info card */}
          <div className="card-glass px-5 py-4 flex items-start gap-3"
            style={{ border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: 'rgba(74,222,128,0.12)' }}>
              <Bell size={16} style={{ color: '#4ADE80' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Como funciona</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Defina um valor mínimo de saldo para cada conta. Quando o saldo cair abaixo do limite,
                um alerta em destaque aparecerá no topo do dashboard. Os limites são salvos no seu navegador.
              </p>
            </div>
          </div>

          {/* Active alerts */}
          {alertAccounts.length > 0 && (
            <div className="card-glass px-5 py-4 flex items-start gap-3"
              style={{ border: '1px solid rgba(248,113,113,0.3)' }}>
              <AlertTriangle size={16} style={{ color: '#F87171', flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {alertAccounts.length} conta{alertAccounts.length > 1 ? 's' : ''} com saldo abaixo do limite
                </p>
                <ul className="space-y-1">
                  {alertAccounts.map((a) => (
                    <li key={a.id} className="text-xs" style={{ color: '#F87171' }}>
                      • {a.name} — {formatCurrency(a.balance, a.currency)} (limite: {formatCurrency(thresholds[a.id], a.currency)})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {AD_ACCOUNTS.map((account) => (
              <ThresholdRow
                key={account.id}
                account={account}
                liveData={accounts.find((a) => a.id === account.id)}
                threshold={thresholds[account.id]}
                onSave={saveThreshold}
              />
            ))}
          </div>

          <p className="text-xs text-center pt-2" style={{ color: 'var(--text-subtle)' }}>
            Deixe em branco para desativar o alerta de uma conta específica
          </p>
        </div>
      </div>
    </div>
  )
}
