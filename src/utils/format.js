export function formatCurrency(value, currency = 'BRL') {
  const num = parseFloat(value) || 0
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    return `${currency} ${num.toFixed(2)}`
  }
}

export function formatNumber(value, decimals = 0) {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

export function formatPercent(value, decimals = 2) {
  const num = parseFloat(value) || 0
  return `${num.toFixed(decimals)}%`
}

// kept for backward compat but now always returns full number
export function formatCompact(value) {
  return formatNumber(parseFloat(value) || 0)
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

export function timeAgo(date) {
  if (!date) return ''
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return `${diff}s atrás`
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`
  return `${Math.floor(diff / 3600)}h atrás`
}
