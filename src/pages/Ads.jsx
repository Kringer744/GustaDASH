import { useApp } from '../store/AppContext'
import Header from '../components/Header'
import ActiveAdsGrid from '../components/ActiveAdsGrid'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Ads() {
  const { selectedAccount, loading, accounts } = useApp()

  if (loading && accounts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Anúncios Ativos" subtitle="Anúncios em veiculação agora" />
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Anúncios Ativos"
        subtitle={selectedAccount ? `${selectedAccount.name} · em veiculação agora` : 'Selecione uma conta no Dashboard'}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {selectedAccount && !selectedAccount.error ? (
          <ActiveAdsGrid ads={selectedAccount.activeAds} currency={selectedAccount.currency} />
        ) : (
          <div className="card-glass p-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {selectedAccount?.error || 'Selecione uma conta no Dashboard para ver os anúncios'}
          </div>
        )}
      </div>
    </div>
  )
}
