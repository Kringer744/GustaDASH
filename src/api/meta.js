import axios from 'axios'
import { META_TOKEN, META_API_BASE } from '../utils/constants'

const api = axios.create({ baseURL: META_API_BASE })

function actId(id) { return `act_${id}` }

const DEFAULT_RANGE = { preset: 'last_30d', since: null, until: null }

// ── Date helpers ──────────────────────────────────────────────
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

// ── Account info (balance, currency, status) ──────────────────
// Meta returns balance/amount_spent in the currency's minor unit (centavos for BRL).
// currency_offset tells us the divisor: 100 for BRL/USD, 1 for JPY, etc.
export async function getAccountInfo(id) {
  const { data } = await api.get(`/${actId(id)}`, {
    params: {
      fields: 'id,name,balance,currency,currency_offset,account_status,spend_cap,amount_spent',
      access_token: META_TOKEN,
    },
  })
  return data
}

// ── Account-level aggregate insights (accurate totals) ────────
// Using the account insights endpoint gives exact totals for the period,
// regardless of how many campaigns exist — no risk of missing data from paging.
export async function getAccountInsights(id, dr = DEFAULT_RANGE) {
  try {
    const { data } = await api.get(`/${actId(id)}/insights`, {
      params: {
        fields: 'spend,impressions,clicks,ctr,cpc,cpm,reach,frequency',
        ...dateParams(dr),
        access_token: META_TOKEN,
      },
    })
    const d = data.data?.[0] || {}
    return {
      spend:       parseFloat(d.spend)       || 0,
      impressions: parseInt(d.impressions)   || 0,
      clicks:      parseInt(d.clicks)        || 0,
      ctr:         parseFloat(d.ctr)         || 0,
      cpc:         parseFloat(d.cpc)         || 0,
      cpm:         parseFloat(d.cpm)         || 0,
      reach:       parseInt(d.reach)         || 0,
      frequency:   parseFloat(d.frequency)   || 0,
    }
  } catch {
    return { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, reach: 0, frequency: 0 }
  }
}

// ── Campaigns (with full pagination) ─────────────────────────
export async function getCampaigns(id, dr = DEFAULT_RANGE) {
  const results = []
  let after = null

  do {
    const params = {
      fields: `id,name,status,effective_status,objective,${insightsField(dr)}{spend,impressions,clicks,ctr,cpc,cpm,reach}`,
      limit: 100,
      access_token: META_TOKEN,
    }
    if (after) params.after = after

    const { data } = await api.get(`/${actId(id)}/campaigns`, { params })
    results.push(...(data.data || []))
    after = data.paging?.cursors?.after && data.paging?.next ? data.paging.cursors.after : null
  } while (after)

  return results
}

// ── Active ads (higher limit) ─────────────────────────────────
export async function getActiveAds(id, dr = DEFAULT_RANGE) {
  const results = []
  let after = null

  do {
    const params = {
      effective_status: JSON.stringify(['ACTIVE']),
      fields: `id,name,status,creative{title,body,thumbnail_url},${insightsField(dr)}{spend,impressions,clicks,ctr,cpc,cpm}`,
      limit: 100,
      access_token: META_TOKEN,
    }
    if (after) params.after = after

    const { data } = await api.get(`/${actId(id)}/ads`, { params })
    results.push(...(data.data || []))
    // Stop after 200 ads to avoid very slow loads
    after = results.length < 200 && data.paging?.cursors?.after && data.paging?.next
      ? data.paging.cursors.after
      : null
  } while (after)

  return results
}

// ── Daily breakdown ───────────────────────────────────────────
export async function getDailySpend(id, dr = DEFAULT_RANGE) {
  const { data } = await api.get(`/${actId(id)}/insights`, {
    params: {
      fields: 'spend,impressions,clicks,ctr,cpc,cpm',
      time_increment: 1,
      ...dateParams(dr),
      access_token: META_TOKEN,
    },
  })
  return data.data || []
}

// ── Previous period for MoM comparison ───────────────────────
export async function getPrevPeriodMetrics(id, dr = DEFAULT_RANGE) {
  const prev = getPrevRange(dr)
  try {
    const { data } = await api.get(`/${actId(id)}/insights`, {
      params: {
        fields: 'spend,impressions,clicks,ctr',
        time_range: JSON.stringify({ since: prev.since, until: prev.until }),
        access_token: META_TOKEN,
      },
    })
    const d = data.data?.[0] || {}
    return {
      spend:       parseFloat(d.spend)       || 0,
      impressions: parseInt(d.impressions)   || 0,
      clicks:      parseInt(d.clicks)        || 0,
      ctr:         parseFloat(d.ctr)         || 0,
    }
  } catch {
    return { spend: 0, impressions: 0, clicks: 0, ctr: 0 }
  }
}

// ── Main fetch ────────────────────────────────────────────────
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

    // currency_offset: 100 for BRL/USD/EUR, 1 for JPY, etc.
    // balance and amount_spent from account info are in minor units
    const offset = parseInt(info.currency_offset) || 100
    const balance     = (parseFloat(info.balance)      || 0) / offset
    const amountSpent = (parseFloat(info.amount_spent)  || 0) / offset

    const normalizedCampaigns = campaigns.map((c) => {
      const ins = c.insights?.data?.[0] || {}
      return {
        id:          c.id,
        name:        c.name,
        status:      c.effective_status || c.status,
        objective:   c.objective,
        spend:       parseFloat(ins.spend)       || 0,
        impressions: parseInt(ins.impressions)   || 0,
        clicks:      parseInt(ins.clicks)        || 0,
        ctr:         parseFloat(ins.ctr)         || 0,
        cpc:         parseFloat(ins.cpc)         || 0,
        cpm:         parseFloat(ins.cpm)         || 0,
        reach:       parseInt(ins.reach)         || 0,
      }
    })

    const normalizedAds = activeAds.map((a) => {
      const ins = a.insights?.data?.[0] || {}
      return {
        id:          a.id,
        name:        a.name,
        status:      a.status,
        title:       a.creative?.title || a.name,
        body:        a.creative?.body  || '',
        thumbnail:   a.creative?.thumbnail_url || null,
        spend:       parseFloat(ins.spend)     || 0,
        impressions: parseInt(ins.impressions) || 0,
        clicks:      parseInt(ins.clicks)      || 0,
        ctr:         parseFloat(ins.ctr)       || 0,
        cpc:         parseFloat(ins.cpc)       || 0,
        cpm:         parseFloat(ins.cpm)       || 0,
      }
    })

    return {
      id:            account.id,
      name:          account.name,
      balance,
      currency:      info.currency || 'BRL',
      accountStatus: info.account_status,
      amountSpent,
      // Use account-level insights for KPI totals — most accurate
      metrics:       accountInsights,
      prevMetrics,
      campaigns:     normalizedCampaigns,
      activeAds:     normalizedAds,
      dailyData:     dailyData.map((d) => ({
        date:        d.date_start,
        spend:       parseFloat(d.spend)       || 0,
        impressions: parseInt(d.impressions)   || 0,
        clicks:      parseInt(d.clicks)        || 0,
        ctr:         parseFloat(d.ctr)         || 0,
        cpc:         parseFloat(d.cpc)         || 0,
        cpm:         parseFloat(d.cpm)         || 0,
      })),
      error: null,
    }
  } catch (err) {
    console.error(`Erro ao buscar conta ${account.name}:`, err)
    return {
      id: account.id, name: account.name,
      balance: 0, currency: 'BRL', accountStatus: null, amountSpent: 0,
      metrics:     { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0, reach: 0, frequency: 0 },
      prevMetrics: { spend: 0, impressions: 0, clicks: 0, ctr: 0 },
      campaigns: [], activeAds: [], dailyData: [],
      error: err?.response?.data?.error?.message || 'Erro ao carregar dados',
    }
  }
}
