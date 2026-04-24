import axios from 'axios'
import { META_TOKEN, META_API_BASE } from '../utils/constants'

const api = axios.create({ baseURL: META_API_BASE })

function actId(id) { return `act_${id}` }

const DEFAULT_RANGE = { preset: 'last_30d', since: null, until: null }

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
    const until = new Date(today.getTime() - (days + 1) * 86400000)
    const since = new Date(today.getTime() - days * 2 * 86400000)
    return { since: fmt(since), until: fmt(until) }
  }
  const sinceDate = new Date(dr.since)
  const untilDate = new Date(dr.until)
  const duration = Math.round((untilDate - sinceDate) / 86400000) || 30
  const prevUntil = new Date(sinceDate.getTime() - 86400000)
  const prevSince = new Date(sinceDate.getTime() - (duration + 1) * 86400000)
  return { since: fmt(prevSince), until: fmt(prevUntil) }
}

export async function getAccountInfo(id) {
  const { data } = await api.get(`/${actId(id)}`, {
    params: { fields: 'id,name,balance,currency,account_status,spend_cap,amount_spent', access_token: META_TOKEN },
  })
  return data
}

export async function getCampaigns(id, dr = DEFAULT_RANGE) {
  const { data } = await api.get(`/${actId(id)}/campaigns`, {
    params: {
      fields: `id,name,status,effective_status,objective,${insightsField(dr)}{spend,impressions,clicks,ctr,cpc,cpm,reach}`,
      limit: 50,
      access_token: META_TOKEN,
    },
  })
  return data.data || []
}

export async function getActiveAds(id, dr = DEFAULT_RANGE) {
  const { data } = await api.get(`/${actId(id)}/ads`, {
    params: {
      effective_status: JSON.stringify(['ACTIVE']),
      fields: `id,name,status,creative{title,body,thumbnail_url},${insightsField(dr)}{spend,impressions,clicks,ctr}`,
      limit: 20,
      access_token: META_TOKEN,
    },
  })
  return data.data || []
}

export async function getDailySpend(id, dr = DEFAULT_RANGE) {
  const { data } = await api.get(`/${actId(id)}/insights`, {
    params: { fields: 'spend,impressions,clicks', time_increment: 1, ...dateParams(dr), access_token: META_TOKEN },
  })
  return data.data || []
}

export async function getPrevPeriodMetrics(id, dr = DEFAULT_RANGE) {
  const prev = getPrevRange(dr)
  try {
    const { data } = await api.get(`/${actId(id)}/insights`, {
      params: {
        fields: 'spend,impressions,clicks',
        time_range: JSON.stringify({ since: prev.since, until: prev.until }),
        access_token: META_TOKEN,
      },
    })
    const d = data.data?.[0] || {}
    return { spend: parseFloat(d.spend) || 0, impressions: parseInt(d.impressions) || 0, clicks: parseInt(d.clicks) || 0 }
  } catch {
    return { spend: 0, impressions: 0, clicks: 0 }
  }
}

export async function fetchAccountData(account, dr = DEFAULT_RANGE) {
  try {
    const [info, campaigns, activeAds, dailyData, prevMetrics] = await Promise.all([
      getAccountInfo(account.id),
      getCampaigns(account.id, dr),
      getActiveAds(account.id, dr),
      getDailySpend(account.id, dr),
      getPrevPeriodMetrics(account.id, dr),
    ])

    const normalizedCampaigns = campaigns.map((c) => {
      const ins = c.insights?.data?.[0] || {}
      return {
        id: c.id, name: c.name,
        status: c.effective_status || c.status,
        objective: c.objective,
        spend: parseFloat(ins.spend) || 0,
        impressions: parseInt(ins.impressions) || 0,
        clicks: parseInt(ins.clicks) || 0,
        ctr: parseFloat(ins.ctr) || 0,
        cpc: parseFloat(ins.cpc) || 0,
        cpm: parseFloat(ins.cpm) || 0,
        reach: parseInt(ins.reach) || 0,
      }
    })

    const normalizedAds = activeAds.map((a) => {
      const ins = a.insights?.data?.[0] || {}
      return {
        id: a.id, name: a.name, status: a.status,
        title: a.creative?.title || a.name,
        body: a.creative?.body || '',
        thumbnail: a.creative?.thumbnail_url || null,
        spend: parseFloat(ins.spend) || 0,
        impressions: parseInt(ins.impressions) || 0,
        clicks: parseInt(ins.clicks) || 0,
        ctr: parseFloat(ins.ctr) || 0,
      }
    })

    const totals = normalizedCampaigns.reduce(
      (acc, c) => { acc.spend += c.spend; acc.impressions += c.impressions; acc.clicks += c.clicks; return acc },
      { spend: 0, impressions: 0, clicks: 0 }
    )
    totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
    totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0
    totals.cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0

    return {
      id: account.id, name: account.name,
      balance: (parseFloat(info.balance) || 0) / 100,
      currency: info.currency || 'BRL',
      accountStatus: info.account_status,
      amountSpent: (parseFloat(info.amount_spent) || 0) / 100,
      metrics: totals,
      prevMetrics,
      campaigns: normalizedCampaigns,
      activeAds: normalizedAds,
      dailyData: dailyData.map((d) => ({
        date: d.date_start,
        spend: parseFloat(d.spend) || 0,
        impressions: parseInt(d.impressions) || 0,
        clicks: parseInt(d.clicks) || 0,
        ctr: parseInt(d.impressions) > 0 ? (parseInt(d.clicks) / parseInt(d.impressions)) * 100 : 0,
      })),
      error: null,
    }
  } catch (err) {
    console.error(`Erro ao buscar conta ${account.name}:`, err)
    return {
      id: account.id, name: account.name,
      balance: 0, currency: 'BRL', accountStatus: null, amountSpent: 0,
      metrics: { spend: 0, impressions: 0, clicks: 0, ctr: 0, cpc: 0, cpm: 0 },
      prevMetrics: { spend: 0, impressions: 0, clicks: 0 },
      campaigns: [], activeAds: [], dailyData: [],
      error: err?.response?.data?.error?.message || 'Erro ao carregar dados',
    }
  }
}
