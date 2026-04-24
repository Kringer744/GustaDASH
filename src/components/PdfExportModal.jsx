import { useState } from 'react'
import { FileText, Download, X, ChevronRight, Loader, CheckCircle } from 'lucide-react'
import { generateAccountPDF, generateAllAccountsPDF } from '../utils/pdfReport'

export default function PdfExportModal({ accounts, totals, onClose }) {
  const [loading, setLoading] = useState(null) // null | 'all' | accountId

  async function handleExport(account) {
    const key = account ? account.id : 'all'
    setLoading(key)
    await new Promise(r => setTimeout(r, 100)) // let UI update
    try {
      if (account) generateAccountPDF(account)
      else generateAllAccountsPDF(accounts, totals)
    } finally {
      setLoading(null)
    }
  }

  const validAccounts = accounts.filter(a => !a.error)

  return (
    <div
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{
        width: '90%', maxWidth: 520,
        background: 'var(--elevated-bg)',
        border: '1px solid var(--glass-border)',
        borderRadius: '1.25rem',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,222,128,0.1)',
        position: 'relative',
      }}>
        {/* Top glow */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.5), transparent)' }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 38, height: 38, borderRadius: '0.75rem', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText size={17} style={{ color: '#4ADE80' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>Exportar Relatórios PDF</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>Escolha um cliente ou exporte todos</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.35rem' }}>
            <X size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>

        {/* All accounts option */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={() => handleExport(null)}
            disabled={loading !== null}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem',
              padding: '0.875rem 1rem', borderRadius: '0.875rem', cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(10,30,18,0.8), rgba(6,20,12,0.6))',
              border: '1px solid rgba(74,222,128,0.3)',
              transition: 'all 0.2s', textAlign: 'left',
              boxShadow: '0 0 20px rgba(74,222,128,0.06)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(74,222,128,0.5)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(74,222,128,0.12)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(74,222,128,0.3)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(74,222,128,0.06)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: 'rgba(74,222,128,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {loading === 'all'
                ? <Loader size={18} style={{ color: '#4ADE80' }} className="animate-spin" />
                : <Download size={18} style={{ color: '#4ADE80' }} />
              }
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4ADE80' }}>Relatório Completo</p>
              <p style={{ fontSize: '0.72rem', color: 'rgba(74,222,128,0.6)', marginTop: 2 }}>
                {validAccounts.length} contas · Visão geral + campanhas detalhadas
              </p>
            </div>
            <ChevronRight size={14} style={{ color: 'rgba(74,222,128,0.5)', flexShrink: 0 }} />
          </button>
        </div>

        {/* Per-account list */}
        <div style={{ maxHeight: 340, overflowY: 'auto', padding: '0.75rem 1.5rem' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Por cliente
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {validAccounts.map(acc => {
              const isLoading = loading === acc.id
              return (
                <button
                  key={acc.id}
                  onClick={() => handleExport(acc)}
                  disabled={loading !== null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.625rem 0.875rem', borderRadius: '0.75rem',
                    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    opacity: loading && !isLoading ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.borderColor = 'rgba(74,222,128,0.25)'; e.currentTarget.style.background = 'rgba(74,222,128,0.04)' } }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'var(--glass-bg)' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '0.625rem', flexShrink: 0,
                    background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4ADE80' }}>
                      {acc.name[0]}
                    </span>
                  </div>

                  {/* Name + meta */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {acc.name}
                    </p>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>
                      {acc.campaigns.length} campanhas · {acc.activeAds.length} ativos
                    </p>
                  </div>

                  {/* Balance */}
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#4ADE80', flexShrink: 0 }}>
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: acc.currency }).format(acc.balance)}
                  </span>

                  {/* Action icon */}
                  {isLoading
                    ? <Loader size={13} style={{ color: '#4ADE80', flexShrink: 0 }} className="animate-spin" />
                    : <Download size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  }
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '0.875rem 1.5rem', borderTop: '1px solid var(--border)', background: 'rgba(0,0,0,0.15)' }}>
          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            PDFs gerados localmente no seu navegador · sem envio de dados
          </p>
        </div>
      </div>
    </div>
  )
}
