import axios from 'axios'
import { META_TOKEN, META_API_BASE } from '../utils/constants'

const api = axios.create({ baseURL: META_API_BASE })

function actId(id) { return `act_${id}` }

const DEFAULT_RANGE = { preset: 'last_30d', since: null, until: null }

// ─── Date helpers ────────────────────────────────────────────
function insightsField(dr = DEFAULT_RANGE) {
  if (!dr || dr.preset) return `insights.date_preset(${dr?.preset || 'last_30d'})`
  return `insights.time_range(${JSON.stringify({ since: dr.since, until: dr.until })})`
}

function dateParams(dr = DEFAULT_RANGE) {
  if (!dr || dr.preset) return { date_preset: dr?.preset || 'last_30d' }
  return { time_range: JSON.stringify({ since: dr.since, until: dr.until }) }
}

function getPrevRange(dr = DEFAULT_RANGE) {
  const fmt = d => d.toISOString().split('T')[0]
  if (!dr || dr.preset) {
    const match = (dr?.preset || 'last_30d').match(/last_(\d+)d/)
    const days = match ? parseInt(match[1]) : 30
    const today = new Date()
    return {
      since: fmt(new Date(today.getTime() - days * 2 * 86400000)),
      until: fmt(new Date(today.getTime() - (days + 1) * 86400000)),
    }
  }
  const sinceDate = new Date(dr.since)
  const untilDate = new Date(dr.until)
  const duration = Math.round((untilDate - sinceDate) / 86400000) || 30
  return {
    since: fmt(new Date(sinceDate.getTime() - (duration + 1) * 86400000)),
    until: fmt(new Date(sinceDate.getTime() - 86400000)),
  }
}

// ─── Insight fields that match Meta Ads Manager defaults ─────
// inline_link_clicks = "Cliques" column in Meta Ads Manager
// ctr               = "CTR (taxa de cliques no link)"
// cpc               = "CPC (custo por clique no link)"
// cpm               = "CPM"
// spend             = "Valor gasto"
// impressions       = "Impressões"
const INSIGHT_FIELDS = 'spend,impressions,inline_link_clicks,ctr,cpc,cpm,reach'

// Shared params for all insights calls — matches Meta Ads Manager default attribution
function insightParams(dr) {
  return {
    fields: INSIGHT_FIELDS,
    use_unified_attribution_setting: true,
    ...dateParams(dr),
    access_token: META_TOKEN,
  }
}

// ─── Account info ────────────────────────────────────────────
// balance, amount_spent and spend_cap come in the currency's minor unit (centavos for BRL).
// - Pré-paga: balance > 0 → saldo = balance / 100
// - Pós-paga: balance = 0 e spend_cap > 0 → saldo = (spend_cap - amount_spent) / 100
// - Pós-paga sem cap (spend_cap = 0) → não há "saldo disponível", mostra apenas amount_spent
async function getAccountInfo(id) {
  const { data } = await api.get(`/${actId(id)}`, {
    params: {
      fields: 'id,name,balance,currency,account_status,amount_spent,spend_cap,disable_reason,funding_source_details',
      access_token: META_TOKEN,
    },
  })
  return data
}

// ─── Account-level aggregate metrics ─────────────────────────
// Fetches exact totals from the account insights endpoint.
// This matches the totals row in Meta Ads Manager exactly.
async function getAccountInsights(id, dr) {
  try {
    const { data } = await api.get(`/${actId(id)}/insights`, {
      params: insightParams(dr),
    })
    const d = data.data?.[0] || {}
    return normalize(d)
  } catch {
    return emptyMetrics()
  }
}

// ─── Campaigns ───────────────────────────────────────────────
async function getCampaigns(id, dr) {
  try {
    const insField = insightsField(dr)
    const insFields = 'spend,impressions,inline_link_clicks,ctr,cpc,cpm,reach'
    const { data } = await api.get(`/${actId(id)}/campaigns`, {
      params: {
        fields: `id,name,status,effective_status,objective,${insField}{${insFields}}`,
        limit: 100,
        access_token: META_TOKEN,
      },
    })
    return data.data || []
  } catch {
    return []
  }
}

// ─── Active ads ──────────────────────────────────────────────
async function getActiveAds(id, dr) {
  try {
    const insField = insightsField(dr)
    const insFields = 'spend,impressions,inline_link_clicks,ctr,cpc,cpm'
    const { data } = await api.get(`/${actId(id)}/ads`, {
      params: {
        effective_status: JSON.stringify(['ACTIVE']),
        fields: `id,name,status,creative{title,body,thumbnail_url},${insField}{${insFields}}`,
        limit: 50,
        access_token: META_TOKEN,
      },
    })
    return data.data || []
  } catch {
    return []
  }
}

// ─── Daily breakdown ─────────────────────────────────────────
async function getDailySpend(id, dr) {
  try {
    const { data } = await api.get(`/${actId(id)}/insights`, {
      params: {
        fields: 'spend,impressions,inline_link_clicks,ctr,cpc,cpm',
        time_increment: 1,
        use_unified_attribution_setting: true,
        ...dateParams(dr),
        access_token: META_TOKEN,
      },
    })
    return data.data || []
  } catch {
    return []
  }
}

// ─── Previous period (MoM comparison) ────────────────────────
async function getPrevPeriodMetrics(id, dr) {
  const prev = getPrevRange(dr)
  try {
    const { data } = await api.get(`/${actId(id)}/insights`, {
      params: {
        fields: 'spend,impressions,inline_link_clicks,ctr',
        use_unified_attribution_setting: true,
        time_range: JSON.stringify({ since: prev.since, until: prev.until }),
        access_token: META_TOKEN,
      },
    })
    const d = data.data?.[0] || {}
    return {
      spend:       parseFloat(d.spend)              || 0,
      impressions: parseInt(d.impressions)          || 0,
      clicks:      parseInt(d.inline_link_clicks)   || 0,
      ctr:         parseFloat(d.ctr)                || 0,
    }
  } catch {
    return { spend: 0, impressions: 0, clicks: 0, ctr: 0 }
  }
}

// ─── Helpers ─────────────────────────────────────────────────
function normalize(d) {
  return {
    spend:       parseFloat(d.spend)             || 0,
    impressions: parseInt(d.impressions)         || 0,
    clicks:      parseInt(d.inline_link_clicks)  || 0,  // Link Clicks = Meta "Cliques"
    ctr:         parseFloat(d.ctr)               || 0,  // Link CTR
    cpc:         parseFloat(d.cpc)               || 0,  // Cost per link click
    cpm:         parseFloat(d.cpm)               || 0,
    reach:       parseInt(d.reach)               || 0,
  }
}

// Parse "Saldo disponível (R$30,77 BRL)" → 30.77
function parseFundingBalance(displayString) {
  if (!displayString) return null
  const m = displayString.match(/R\$\s*([\d.]+),(\d{2})/)
  if (!m) return null
  const reais = parseInt(m[1].replace(/\./g, '')) || 0
  const cents = parseInt(m[2]) || 0
  return reais + cents / 100
}

function emptyMetrics() {
  return { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, reach: 0 }
}

// ─── Main fetch ──────────────────────────────────────────────
export async function fetchAccountData(account, dr = DEFAULT_RANGE) {
  try {
    const [info, accountInsights, campaigns, activeAds, dailyData, prevMetrics] = await Promise.all([
      getAccountInfo(account.id),
      getAccountInsights(account.id, dr),
      getCampaigns(account.id, dr),
      getActiveAds(account.id, dr),
      getDailySpend(account.id, dr),
      getPrevPeriodMetrics(account.id, dr),
    ])

    // Meta retorna balance, amount_spent e spend_cap em centavos (minor unit).
    // Saldo disponível depende do tipo da conta:
    //   - Pré-paga (boleto/Pix): balance > 0 → saldo = balance / 100
    //   - Pós-paga com cap: balance = 0 → saldo = (spend_cap - amount_spent) / 100
    //   - Pós-paga sem cap (spend_cap = 0): não há saldo, mostra 0
    const rawBalance   = parseFloat(info.balance)     || 0
    const rawSpent     = parseFloat(info.amount_spent) || 0
    const rawSpendCap  = parseFloat(info.spend_cap)   || 0

    // Fonte de verdade: funding_source_details.display_string traz o "Saldo disponível"
    // exatamente como o Meta Ads Manager mostra (ex: "Saldo disponível (R$30,77 BRL)").
    // Os campos balance/spend_cap da API têm reservas/holds que divergem da UI.
    const displayBalance = parseFundingBalance(info.funding_source_details?.display_string)

    let balance = 0
    if (displayBalance !== null) {
      balance = displayBalance
    } else if (rawBalance > 0) {
      balance = rawBalance / 100
    } else if (rawSpendCap > 0) {
      balance = Math.max(0, (rawSpendCap - rawSpent) / 100)
    }
    const amountSpent = rawSpent / 100
    const spendCap    = rawSpendCap / 100

    const normalizedCampaigns = campaigns.map((c) => {
      const ins = c.insights?.data?.[0] || {}
      return {
        id:          c.id,
        name:        c.name,
        status:      c.effective_status || c.status,
        objective:   c.objective,
        ...normalize(ins),
      }
    })

    const normalizedAds = activeAds.map((a) => {
      const ins = a.insights?.data?.[0] || {}
      return {
        id:        a.id,
        name:      a.name,
        status:    a.status,
        title:     a.creative?.title || a.name,
        body:      a.creative?.body  || '',
        thumbnail: a.creative?.thumbnail_url || null,
        ...normalize(ins),
      }
    })

    return {
      id:            account.id,
      name:          account.name,
      balance,
      currency:      info.currency || 'BRL',
      accountStatus: info.account_status,
      disableReason: info.disable_reason,
      fundingSource: info.funding_source_details?.display_string || null,
      spendCap,
      amountSpent,
      metrics:       accountInsights,
      prevMetrics,
      campaigns:     normalizedCampaigns,
      activeAds:     normalizedAds,
      dailyData:     dailyData.map((d) => ({
        date:        d.date_start,
        spend:       parseFloat(d.spend)            || 0,
        impressions: parseInt(d.impressions)        || 0,
        clicks:      parseInt(d.inline_link_clicks) || 0,
        ctr:         parseFloat(d.ctr)              || 0,
        cpc:         parseFloat(d.cpc)              || 0,
        cpm:         parseFloat(d.cpm)              || 0,
      })),
      error: null,
    }
  } catch (err) {
    console.error(`[GustaDash] Erro conta ${account.name}:`, err?.response?.data || err.message)
    return {
      id: account.id, name: account.name,
      balance: 0, currency: 'BRL', accountStatus: null, amountSpent: 0,
      metrics: emptyMetrics(),
      prevMetrics: { spend: 0, impressions: 0, clicks: 0, ctr: 0 },
      campaigns: [], activeAds: [], dailyData: [],
      error: err?.response?.data?.error?.message || 'Erro ao carregar dados',
    }
  }
}
