export function exportCampaignsCSV(campaigns, filename) {
  const BOM = '\uFEFF'
  const headers = 'Conta,Campanha,Status,Gasto (R$),Impressões,Cliques,CTR (%),CPC (R$),CPM (R$)'
  const rows = campaigns.map(c => [
    c.accountName || '',
    '"' + (c.name || '').replace(/"/g, '""') + '"',
    c.status,
    c.spend.toFixed(2),
    c.impressions,
    c.clicks,
    c.ctr.toFixed(2),
    c.cpc.toFixed(2),
    c.cpm.toFixed(2),
  ].join(','))
  const csv = BOM + [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `campanhas_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
