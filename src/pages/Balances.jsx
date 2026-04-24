import { useApp } from '../store/AppContext'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatCurrency } from '../utils/format'
import { ACCOUNT_STATUS_MAP } from '../utils/constants'
import { AlertTriangle, TrendingDown, Wallet, CheckCircle, XCircle } from 'lucide-react'

function BalanceBar({ balance, threshold }) {
  if (!threshold || threshold <= 0) return null
  const pct = Math.min((balance / threshold) * 100, 100)
  const isCritical = balance < threshold * 0.5
  const isLow = balance < threshold

  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-secondary)' }}>
        <span>Saldo vs limite</span>
        <span className="font-semibold"
          style={{ color: isCritical ? '#F87171' : isLow ? '#FBBF24' : '#4ADE80' }}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--glass-highlight)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isCritical ? '#F87171' : isLow ? '#FBBF24' : '#4ADE80',
            boxShadow: isCritical ? '0 0 6px rgba(248,113,113,0.5)' : isLow ? 'none' : '0 0 6px rgba(74,222,128,0.4)',
          }} />
      </div>
    </div>
  )
}

function AccountBalanceCard({ acc, threshold }) {
  const isLow = threshold > 0 && acc.balance < threshold
  const isCritical = threshold > 0 && acc.balance < threshold * 0.5
  const status = ACCOUNT_STATUS_MAP[acc.accountStatus] || { label: 'Desconhecido', color: 'gray' }

  let borderStyle = { border: '1px solid var(--border)' }
  if (isCritical) borderStyle = { border: '1px solid rgba(248,113,113,0.3)', boxShadow: '0 0 16px rgba(248,113,113,0.06)' }
  else if (isLow)  borderStyle = { border: '1px solid rgba(251,191,36,0.3)', boxShadow: '0 0 16px rgba(251,191,36,0.06)' }

  return (
    <div className="card-glass p-5 flex flex-col gap-3 transition-all duration-200" style={borderStyle}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: isCritical ? 'rgba(248,113,113,0.12)' : isLow ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)',
            }}>
            <span className="text-xs font-bold"
              style={{ color: isCritical ? '#F87171' : isLow ? '#FBBF24' : '#4ADE80' }}>
              {acc.name[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{acc.name}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>act_{acc.id}</p>
          </div>
        </div>

        {acc.error ? (
          <span className="badge badge-danger shrink-0"><XCircle size={11} /> Erro</span>
        ) : isCritical ? (
          <span className="badge badge-danger shrink-0 animate-pulse"><AlertTriangle size={11} /> Crítico</span>
        ) : isLow ? (
          <span className="badge badge-warning shrink-0"><AlertTriangle size={11} /> Baixo</span>
        ) : (
          <span className="badge badge-success shrink-0"><CheckCircle size={11} /> OK</span>
        )}
      </div>

      {acc.error ? (
        <p className="text-xs" style={{ color: '#F87171' }}>{acc.error}</p>
      ) : (
        <>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                Saldo disponível
              </p>
              <p className="text-2xl font-bold"
                style={{ color: isCritical ? '#F87171' : isLow ? '#FBBF24' : 'var(--text-primary)' }}>
                {formatCurrency(acc.balance, acc.currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-secondary)' }}>
                Gasto 30d
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                {formatCurrency(acc.metrics.spend, acc.currency)}
              </p>
            </div>
          </div>

          {threshold > 0 && (
            <>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--text-secondary)' }}>Limite de alerta</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(threshold, acc.currency)}
                </span>
              </div>
              <BalanceBar balance={acc.balance} threshold={threshold} />
            </>
          )}

          <div className="pt-2 flex items-center justify-between text-xs"
            style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
            <span>Status: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{status.label}</span></span>
            <span>{acc.activeAds.length} anúncios ativos</span>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value, sub, icon: Icon, accent }) {
  return (
    <div className="card-glass p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18` }}>
        <Icon size={20} style={{ color: accent }} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <p className="text-xl font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
      </div>
    </div>
  )
}

export default function Balances() {
  const { accounts, loading, thresholds } = useApp()

  if (loading && accounts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Gestão de Saldos" subtitle="Acompanhe o saldo de todas as contas" />
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      </div>
    )
  }

  const ok       = accounts.filter(a => !a.error && (!thresholds[a.id] || a.balance >= thresholds[a.id]))
  const low      = accounts.filter(a => !a.error && thresholds[a.id] > 0 && a.balance < thresholds[a.id] && a.balance >= thresholds[a.id] * 0.5)
  const critical = accounts.filter(a => !a.error && thresholds[a.id] > 0 && a.balance < thresholds[a.id] * 0.5)
  const errors   = accounts.filter(a => a.error)
  const totalBalance = accounts.reduce((s, a) => s + (a.error ? 0 : a.balance), 0)
  const sorted = [...critical, ...low, ...ok, ...errors]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Gestão de Saldos" subtitle="Acompanhe e gerencie o saldo de todas as contas de anúncio" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SummaryCard label="Saldo Total" value={formatCurrency(totalBalance)}
            sub={`${accounts.filter(a => !a.error).length} contas`} icon={Wallet} accent="#4ADE80" />
          <SummaryCard label="Contas OK" value={ok.length}
            sub="Saldo acima do limite" icon={CheckCircle} accent="#4ADE80" />
          <SummaryCard label="Saldo Baixo" value={low.length}
            sub="Abaixo do limite" icon={AlertTriangle} accent="#FBBF24" />
          <SummaryCard label="Crítico" value={critical.length}
            sub="Menos de 50% do limite" icon={TrendingDown} accent="#F87171" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sorted.map((acc) => (
            <AccountBalanceCard key={acc.id} acc={acc} threshold={thresholds[acc.id] || 0} />
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="card-glass p-16 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Nenhuma conta carregada ainda
          </div>
        )}
      </div>
    </div>
  )
}
