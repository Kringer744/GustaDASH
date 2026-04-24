import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Megaphone, Image as ImageIcon,
  Settings, Wallet,
} from 'lucide-react'
import { useApp } from '../store/AppContext'

const NAV_MAIN = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/balances',   icon: Wallet,          label: 'Saldos',          showAlerts: true },
  { to: '/campaigns',  icon: Megaphone,       label: 'Campanhas' },
  { to: '/ads',        icon: ImageIcon,       label: 'Anúncios Ativos' },
]
const NAV_OTHER = [
  { to: '/settings', icon: Settings, label: 'Configurações' },
]

export default function Sidebar() {
  const { alertAccounts } = useApp()

  return (
    <aside style={{
      width: '13rem', flexShrink: 0,
      display: 'flex', flexDirection: 'column', height: '100%',
      background: 'var(--sidebar-bg)',
      borderRight: '1px solid var(--border)',
      position: 'relative',
    }}>
      {/* Subtle right gradient */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '1px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(74,222,128,0.1) 40%, rgba(74,222,128,0.08) 60%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '0.75rem', flexShrink: 0,
            background: 'linear-gradient(135deg, #4ADE80, #16A34A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(74,222,128,0.35), 0 2px 8px rgba(0,0,0,0.3)',
          }}>
            <span style={{ color: '#071510', fontWeight: 900, fontSize: '0.9rem' }}>G</span>
          </div>
          <div>
            <p style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>GustaDash</p>
            <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Meta Ads KPIs</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '0.875rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
        <p className="section-label" style={{ marginBottom: '0.5rem' }}>Principal</p>
        {NAV_MAIN.map(({ to, icon: Icon, label, showAlerts }) => (
          <NavLink key={to} to={to} end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={15} />
            <span style={{ flex: 1 }}>{label}</span>
            {showAlerts && alertAccounts.length > 0 && (
              <span style={{
                minWidth: 18, height: 18, background: '#EF4444',
                borderRadius: '9999px', color: '#fff',
                fontSize: '0.55rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                boxShadow: '0 0 8px rgba(239,68,68,0.5)',
              }}>
                {alertAccounts.length}
              </span>
            )}
          </NavLink>
        ))}

        <p className="section-label" style={{ marginTop: '1.25rem', marginBottom: '0.5rem' }}>Outros</p>
        {NAV_OTHER.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ADE80', boxShadow: '0 0 6px #4ADE80' }} />
          <p style={{ fontSize: '0.58rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Atualiza a cada 5 min</p>
        </div>
      </div>
    </aside>
  )
}
