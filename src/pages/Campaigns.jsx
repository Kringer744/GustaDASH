import { useApp } from '../store/AppContext'
import Header from '../components/Header'
import CampaignTable from '../components/CampaignTable'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Campaigns() {
  const { selectedAccount, loading, accounts } = useApp()

  if (loading && accounts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Campanhas" subtitle="Resultados detalhados por campanha" />
        <div className="flex-1 flex items-center justify-center"><LoadingSpinner /></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Campanhas"
        subtitle={selectedAccount ? `${selectedAccount.name} · últimos 30 dias` : 'Selecione uma conta no Dashboard'}
      />
      <div className="flex-1 overflow-y-auto p-6">
        {selectedAccount && !selectedAccount.error ? (
          <CampaignTable campaigns={selectedAccount.campaigns} currency={selectedAccount.currency} />
        ) : (
          <div className="card-glass p-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            {selectedAccount?.error || 'Selecione uma conta no Dashboard para ver as campanhas'}
          </div>
        )}
      </div>
    </div>
  )
}
