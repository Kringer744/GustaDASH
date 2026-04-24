import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './store/AppContext'
import { ThemeProvider } from './store/ThemeContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Campaigns from './pages/Campaigns'
import Ads from './pages/Ads'
import Balances from './pages/Balances'
import Settings from './pages/Settings'

function Background() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      {/* Green glow top-right */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-8%',
        width: '60vw', height: '60vw', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(74,222,128,0.06) 0%, transparent 60%)',
        filter: 'blur(60px)',
      }} />
      {/* Teal glow bottom-left */}
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-8%',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(34,197,94,0.045) 0%, transparent 60%)',
        filter: 'blur(80px)',
      }} />
      {/* Center subtle */}
      <div style={{
        position: 'absolute', top: '35%', left: '25%',
        width: '40vw', height: '40vw', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(74,222,128,0.02) 0%, transparent 60%)',
        filter: 'blur(100px)',
      }} />
    </div>
  )
}

function Layout() {
  return (
    <div className="flex h-screen overflow-hidden relative" style={{ background: 'var(--page-bg)' }}>
      <Background />
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Routes>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/balances"  element={<Balances />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/ads"       element={<Ads />} />
            <Route path="/settings"  element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AppProvider>
          <Layout />
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
