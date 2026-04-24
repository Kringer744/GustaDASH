import { formatCurrency, formatCompact, formatPercent } from '../utils/format'
import { Image as ImageIcon, Eye, MousePointer } from 'lucide-react'

function AdCard({ ad, currency }) {
  return (
    <div className="card-hover p-4 flex flex-col gap-3 cursor-default rounded-2xl">
      {/* Thumbnail */}
      <div className="w-full h-28 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ background: 'var(--glass-highlight)' }}>
        {ad.thumbnail
          ? <img src={ad.thumbnail} alt={ad.name} className="w-full h-full object-cover" />
          : <ImageIcon size={22} style={{ color: 'var(--text-muted)' }} />
        }
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="badge badge-success flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Ativo
        </span>
        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
          {formatCurrency(ad.spend, currency)}
        </span>
      </div>

      {/* Name */}
      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }} title={ad.name}>
        {ad.name}
      </p>
      {ad.body && (
        <p className="text-[11px] line-clamp-2 -mt-2" style={{ color: 'var(--text-secondary)' }}>{ad.body}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1.5 pt-2.5" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="text-center">
          <Eye size={11} className="mx-auto mb-0.5" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{formatCompact(ad.impressions)}</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Imp.</p>
        </div>
        <div className="text-center">
          <MousePointer size={11} className="mx-auto mb-0.5" style={{ color: 'var(--text-muted)' }} />
          <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{formatCompact(ad.clicks)}</p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Cliques</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] mb-0.5 mt-0.5" style={{ color: 'var(--text-muted)' }}>CTR</p>
          <p className="text-xs font-bold"
            style={{ color: ad.ctr >= 2 ? '#4ADE80' : ad.ctr >= 1 ? '#FBBF24' : 'var(--text-secondary)' }}>
            {formatPercent(ad.ctr)}
          </p>
          <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Taxa</p>
        </div>
      </div>
    </div>
  )
}

export default function ActiveAdsGrid({ ads = [], currency = 'BRL' }) {
  if (!ads.length) {
    return (
      <div className="card-glass p-10 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
        Nenhum anúncio ativo nesta conta
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Anúncios Ativos</h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Em veiculação agora</p>
        </div>
        <span className="badge badge-success">{ads.length} ativos</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {ads.map((ad) => <AdCard key={ad.id} ad={ad} currency={currency} />)}
      </div>
    </div>
  )
}
