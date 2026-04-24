import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { AD_ACCOUNTS, THRESHOLDS_KEY, REFRESH_INTERVAL } from '../utils/constants'
import { fetchAccountData } from '../api/meta'

const AppContext = createContext(null)

export const DEFAULT_DATE_RANGE = { preset: 'last_30d', since: null, until: null }

export function AppProvider({ children }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAccountId, setSelectedAccountId] = useState(AD_ACCOUNTS[0].id)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [searchAccount, setSearchAccount] = useState('')
  const [dateRange, setDateRange] = useState(DEFAULT_DATE_RANGE)
  const [thresholds, setThresholds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(THRESHOLDS_KEY)) || {} }
    catch { return {} }
  })
  const intervalRef = useRef(null)
  const dateRangeRef = useRef(DEFAULT_DATE_RANGE)

  useEffect(() => { dateRangeRef.current = dateRange }, [dateRange])

  const loadAllAccounts = useCallback(async () => {
    setLoading(true)
    const results = await Promise.all(AD_ACCOUNTS.map(acc => fetchAccountData(acc, dateRangeRef.current)))
    setAccounts(results)
    setLastUpdated(new Date())
    setLoading(false)
  }, [])

  useEffect(() => {
    clearInterval(intervalRef.current)
    loadAllAccounts()
    // Only auto-refresh for preset ranges
    if (dateRange.preset) {
      intervalRef.current = setInterval(loadAllAccounts, REFRESH_INTERVAL)
    }
    return () => clearInterval(intervalRef.current)
  }, [dateRange, loadAllAccounts])

  const saveThreshold = useCallback((accountId, value) => {
    setThresholds((prev) => {
      const next = { ...prev, [accountId]: parseFloat(value) || 0 }
      localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const alertAccounts = accounts.filter((acc) => {
    const threshold = thresholds[acc.id]
    return threshold != null && threshold > 0 && acc.balance < threshold && !acc.error
  })

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId) || null

  return (
    <AppContext.Provider value={{
      accounts, loading, selectedAccountId, selectedAccount,
      setSelectedAccountId, lastUpdated, thresholds, saveThreshold,
      alertAccounts, refresh: loadAllAccounts,
      searchAccount, setSearchAccount,
      dateRange, setDateRange,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
