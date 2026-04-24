import { useState, useMemo } from 'react'
import { useApp } from '../store/AppContext'
import { formatCurrency, formatNumber, formatPercent } from '../utils/format'
import { ACCOUNT_STATUS_MAP } from '../utils/constants'
import Header from '../components/Header'
import AlertBanner from '../components/AlertBanner'
import MetricCard from '../components/MetricCard'
import SpendChart from '../components/SpendChart'
import DonutChart from '../components/DonutChart'
import CampaignTable from '../components/CampaignTable'
import ActiveAdsGrid from '../components/ActiveAdsGrid'
import LoadingSpinner from '../components/LoadingSpinner'
import PdfExportModal from '../components/PdfExportModal'
import DateRangePicker from '../components/DateRangePicker'
import { DollarSign, Eye, MousePointer, Activity, Wallet, ChevronDown, X, FileText } from 'lucide-react'

function pctDelta(curr, prev) {
  if (!prev || prev === 0) return null
  return ((curr - prev) / prev) * 100
}

// ── Filter bar ────────────────────────────────────────────────
function FilterBar({ accounts, selected, onChange, onPdfExport }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const { searchAccount } = useApp()

  const current = selected ? accounts.find((a) => a.id === selected) : null

  const filtered = search
    ? accounts.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
    : accounts

  // Auto-select if header search matches exactly one account
  useMemo(() => {
    if (searchAccount) {
      const match = accounts.find(a => a.name.toLowerCase().includes(searchAccount.toLowerCase()))
      if (match && match.id !== selected) onChange(match.id)
    }
  }, [searchAccount])

  return (
    <div className="flex items-center gap-3 mb-6" style={{ flexWrap: 'wrap' }}>
      <span className="text-sm font-semibold shrink-0" style={{ color: 'var(--text-secondary)' }}>Visualizando:</span>

      <div className="relative">
        <button
          onClick={() => { setOpen((v) => !v); setSearch('') }}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all min-w-[220px]"
          style={{
            background: 'var(--card-bg)',
            border: `1px solid ${open ? 'rgba(74,222,128,0.4)' : 'var(--border-hover)'}`,
            color: 'var(--text-primary)',
            boxShadow: open ? '0 0 0 3px rgba(74,222,128,0.1)' : 'none',
          }}>
          {current ? (
            <>
              <span className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }}>
                {current.name[0]}
              </span>
              <span className="truncate flex-1 text-left">{current.name}</span>
            </>
          ) : (
            <>
              <span className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--glass-highlight)' }}>
                <span className="text-[8px] font-bold" style={{ color: 'var(--text-secondary)' }}>ALL</span>
              </span>
              <span className="flex-1 text-left">Todas as contas</span>
            </>
          )}
          <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }}
            className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute top-full left-0 mt-1 w-80 rounded-xl z-50 overflow-hidden animate-fade-in"
            style={{
              background: 'var(--elevated-bg)',
              border: '1px solid var(--border-hover)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
            {/* Search inside dropdown */}
            <div className="px-3 pt-2 pb-1">
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar conta..."
                className="input text-xs py-2"
              />
            </div>

            <div className="max-h-72 overflow-y-auto pb-1">
              {!search && (
                <button
                  onClick={() => { onChange(null); setOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{
                    background: !selected ? 'rgba(74,222,128,0.08)' : 'transparent',
                    color: !selected ? '#4ADE80' : 'var(--text-secondary)',
                    fontWeight: !selected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (selected) e.currentTarget.style.background = 'var(--row-hover)' }}
                  onMouseLeave={e => { if (selected) e.currentTarget.style.background = 'transparent' }}>
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0"
                    style={{ background: 'var(--glass-highlight)', color: 'var(--text-secondary)' }}>ALL</span>
                  Todas as contas
                  <span className="ml-auto text-xs" style={{ color: 'var(--text-muted)' }}>{accounts.length} contas</span>
                </button>
              )}

              {filtered.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => { onChange(acc.id); setOpen(false); setSearch('') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors"
                  style={{
                    background: acc.id === selected ? 'rgba(74,222,128,0.08)' : 'transparent',
                    color: acc.id === selected ? '#4ADE80' : 'var(--text-secondary)',
                    fontWeight: acc.id === selected ? 600 : 400,
                  }}
                  onMouseEnter={e => { if (acc.id !== selected) e.currentTarget.style.background = 'var(--row-hover)' }}
                  onMouseLeave={e => { if (acc.id !== selected) e.currentTarget.style.background = 'transparent' }}>
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }}>
                    {acc.name[0]}
                  </span>
                  <span className="flex-1 truncate">{acc.name}</span>
                  {!acc.error && (
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
                      {formatCurrency(acc.balance, acc.currency)}
                    </span>
                  )}
                </button>
              ))}

              {filtered.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>
                  Nenhuma conta encontrada
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {current && (
        <button onClick={() => onChange(null)} title="Limpar filtro de conta"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30, borderRadius: '0.625rem', flexShrink: 0,
            background: 'rgba(239,68,68,0.08)', color: '#F87171',
            border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)' }}>
          <X size={13} />
        </button>
      )}

      <DateRangePicker />

      <div>
        <button onClick={onPdfExport}
          className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
          style={{
            background: 'rgba(74,222,128,0.08)', color: '#4ADE80',
            border: '1px solid rgba(74,222,128,0.2)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.14)'; e.currentTarget.style.borderColor = 'rgba(74,222,128,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,222,128,0.08)'; e.currentTarget.style.borderColor = 'rgba(74,222,128,0.2)' }}>
          <FileText size={13} /> Exportar PDF
        </button>
      </div>
    </div>
  )
}

// ── Merged view for "all accounts" ───────────────────────────
function AggregatedView({ accounts }) {
  const totals = useMemo(() => accounts.reduce(
    (acc, a) => {
      if (a.error) return acc
      acc.spend       += a.metrics.spend
      acc.impressions += a.metrics.impressions
      acc.clicks      += a.metrics.clicks
      acc.balance     += a.balance
      acc.activeAds   += a.activeAds.length
      acc.prevSpend   += a.prevMetrics?.spend || 0
      acc.prevImpressions += a.prevMetrics?.impressions || 0
      acc.prevClicks  += a.prevMetrics?.clicks || 0
      return acc
    },
    { spend: 0, impressions: 0, clicks: 0, balance: 0, activeAds: 0, prevSpend: 0, prevImpressions: 0, prevClicks: 0 }
  ), [accounts])

  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  const prevCtr = totals.prevImpressions > 0 ? (totals.prevClicks / totals.prevImpressions) * 100 : 0

  const allCampaigns = useMemo(() =>
    accounts.flatMap((a) => a.error ? [] : a.campaigns.map((c) => ({
      ...c, accountName: a.name, currency: a.currency,
    }))).sort((a, b) => b.spend - a.spend)
  , [accounts])

  const allAds = useMemo(() => accounts.flatMap((a) => a.error ? [] : a.activeAds), [accounts])

  const mergedDaily = useMemo(() => {
    const map = {}
    accounts.forEach((a) => {
      if (a.error) return
      a.dailyData.forEach((d) => {
        if (!map[d.date]) map[d.date] = { date: d.date, spend: 0, impressions: 0, clicks: 0 }
        map[d.date].spend       += d.spend
        map[d.date].impressions += d.impressions
        map[d.date].clicks      += d.clicks
      })
    })
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date))
      .map(d => ({ ...d, ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0 }))
  }, [accounts])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Saldo Total" value={formatCurrency(totals.balance)}
          sub={`${accounts.filter(a => !a.error).length} contas ativas`}
          icon={Wallet} highlight delta={null} />
        <MetricCard label="Gasto Total (30d)" value={formatCurrency(totals.spend)}
          sub={`${totals.activeAds} anúncios ativos`}
          icon={DollarSign} delta={pctDelta(totals.spend, totals.prevSpend)} />
        <MetricCard label="Impressões" value={formatNumber(totals.impressions)}
          icon={Eye} delta={pctDelta(totals.impressions, totals.prevImpressions)} />
        <MetricCard label="Cliques · CTR" value={formatNumber(totals.clicks)}
          sub={`CTR médio: ${formatPercent(ctr)}`}
          icon={MousePointer} delta={pctDelta(totals.clicks, totals.prevClicks)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2"><DonutChart campaigns={allCampaigns} currency="BRL" /></div>
        <div className="lg:col-span-3"><SpendChart data={mergedDaily} currency="BRL" /></div>
      </div>

      <CampaignTable campaigns={allCampaigns} currency="BRL" showAccount />
      <ActiveAdsGrid ads={allAds} currency="BRL" />
    </div>
  )
}

// ── Single account view ───────────────────────────────────────
function AccountView({ account }) {
  const status = ACCOUNT_STATUS_MAP[account.accountStatus] || { label: 'Desconhecido', color: 'gray' }

  if (account.error) {
    return (
      <div className="card-glass p-10 flex flex-col items-center gap-3 text-center">
        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Erro ao carregar dados</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{account.error}</p>
      </div>
    )
  }

  const prev = account.prevMetrics || {}
  const dailyWithCtr = account.dailyData.map(d => ({
    ...d, ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
  }))

  return (
    <div className="space-y-5">
      {/* Account header */}
      <div className="card-glass px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold"
            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ADE80' }}>
            {account.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{account.name}</h2>
              <span className={`badge ${status.color === 'success' ? 'badge-success' : status.color === 'danger' ? 'badge-danger' : 'badge-warning'}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>act_{account.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div>
            <p className="text-[11px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-secondary)' }}>Saldo disponível</p>
            <p className="text-2xl font-bold" style={{ color: '#4ADE80' }}>{formatCurrency(account.balance, account.currency)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide mb-0.5" style={{ color: 'var(--text-secondary)' }}>Gasto histórico</p>
            <p className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(account.amountSpent, account.currency)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Gasto (30d)" value={formatCurrency(account.metrics.spend, account.currency)}
          icon={DollarSign} highlight delta={pctDelta(account.metrics.spend, prev.spend)} />
        <MetricCard label="Impressões" value={formatNumber(account.metrics.impressions)}
          icon={Eye} delta={pctDelta(account.metrics.impressions, prev.impressions)} />
        <MetricCard label="Cliques" value={formatNumber(account.metrics.clicks)}
          icon={MousePointer} delta={pctDelta(account.metrics.clicks, prev.clicks)} />
        <MetricCard label="CTR · CPC"
          value={formatPercent(account.metrics.ctr)}
          sub={`CPC: ${formatCurrency(account.metrics.cpc, account.currency)}`}
          icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2"><DonutChart campaigns={account.campaigns} currency={account.currency} /></div>
        <div className="lg:col-span-3"><SpendChart data={dailyWithCtr} currency={account.currency} /></div>
      </div>

      <CampaignTable campaigns={account.campaigns} currency={account.currency} />
      <ActiveAdsGrid ads={account.activeAds} currency={account.currency} />
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────
export default function Dashboard() {
  const { accounts, loading } = useApp()
  const [filterId, setFilterId] = useState(null)
  const [showPdf, setShowPdf] = useState(false)
  const filteredAccount = filterId ? accounts.find((a) => a.id === filterId) : null

  const pdfTotals = useMemo(() => {
    const t = accounts.filter(a => !a.error).reduce(
      (acc, a) => {
        acc.spend       += a.metrics.spend
        acc.impressions += a.metrics.impressions
        acc.clicks      += a.metrics.clicks
        return acc
      },
      { spend: 0, impressions: 0, clicks: 0 }
    )
    t.ctr = t.impressions > 0 ? (t.clicks / t.impressions) * 100 : 0
    return t
  }, [accounts])

  if (loading && accounts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Painel de Resultados" subtitle="Todos os clientes Meta Ads em tempo real" />
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Painel de Resultados"
        subtitle={filteredAccount ? `Exibindo: ${filteredAccount.name}` : `Todas as ${accounts.length} contas`}
      />
      <div className="flex-1 overflow-y-auto p-6">
        <AlertBanner />
        <FilterBar accounts={accounts} selected={filterId} onChange={setFilterId} onPdfExport={() => setShowPdf(true)} />
        {filteredAccount
          ? <AccountView account={filteredAccount} />
          : <AggregatedView accounts={accounts} />
        }
      </div>

      {showPdf && (
        <PdfExportModal
          accounts={accounts}
          totals={pdfTotals}
          onClose={() => setShowPdf(false)}
        />
      )}
    </div>
  )
}
