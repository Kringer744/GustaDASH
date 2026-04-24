import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const GREEN  = [74, 222, 128]
const DARK   = [7, 8, 15]
const NAVY   = [15, 22, 35]
const GRAY   = [123, 141, 176]
const WHITE  = [237, 242, 247]
const RED    = [248, 113, 113]
const AMBER  = [251, 191, 36]

function fmtBRL(value, currency = 'BRL') {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value)
  } catch {
    return `R$ ${value.toFixed(2)}`
  }
}
function fmtNum(v) { return new Intl.NumberFormat('pt-BR').format(Math.round(v)) }
function fmtPct(v) { return `${v.toFixed(2)}%` }
function fmtDate() {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())
}

function drawHeader(doc, accountName, isAll) {
  const W = doc.internal.pageSize.getWidth()

  // Dark bg header
  doc.setFillColor(...DARK)
  doc.rect(0, 0, W, 40, 'F')

  // Green accent left strip
  doc.setFillColor(...GREEN)
  doc.rect(0, 0, 4, 40, 'F')

  // Logo circle
  doc.setFillColor(...GREEN)
  doc.circle(22, 20, 10, 'F')
  doc.setFontSize(11)
  doc.setTextColor(...DARK)
  doc.setFont('helvetica', 'bold')
  doc.text('G', 22, 24, { align: 'center' })

  // Title
  doc.setFontSize(16)
  doc.setTextColor(...WHITE)
  doc.setFont('helvetica', 'bold')
  doc.text('GustaDash', 38, 16)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text('Relatório de Performance · Meta Ads', 38, 23)

  // Account name top-right
  doc.setFontSize(9)
  doc.setTextColor(...GREEN)
  doc.setFont('helvetica', 'bold')
  doc.text(isAll ? 'Todas as Contas' : accountName, W - 14, 16, { align: 'right' })

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(fmtDate(), W - 14, 23, { align: 'right' })

  // Period label
  doc.setFontSize(7)
  doc.setTextColor(74, 222, 128)
  doc.text('Período: Últimos 30 dias', W - 14, 30, { align: 'right' })
}

function drawKpiRow(doc, metrics, currency, startY) {
  const W = doc.internal.pageSize.getWidth()
  const margin = 14
  const cardW = (W - margin * 2 - 9) / 4
  const cardH = 28

  const kpis = [
    { label: 'Gasto Total',    value: fmtBRL(metrics.spend, currency), color: GREEN },
    { label: 'Impressões',     value: fmtNum(metrics.impressions),      color: [56, 189, 248] },
    { label: 'Cliques',        value: fmtNum(metrics.clicks),           color: [167, 139, 250] },
    { label: 'CTR Médio',      value: fmtPct(metrics.ctr),             color: [251, 146, 60] },
  ]

  kpis.forEach((kpi, i) => {
    const x = margin + i * (cardW + 3)

    // Card bg
    doc.setFillColor(...NAVY)
    doc.roundedRect(x, startY, cardW, cardH, 3, 3, 'F')

    // Top accent line
    doc.setFillColor(...kpi.color)
    doc.roundedRect(x, startY, cardW, 1.5, 0.5, 0.5, 'F')

    // Label
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(kpi.label.toUpperCase(), x + 6, startY + 9)

    // Value
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...kpi.color)
    doc.text(kpi.value, x + 6, startY + 21)
  })

  return startY + cardH + 8
}

function drawSectionTitle(doc, title, y) {
  const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(...NAVY)
  doc.rect(14, y, W - 28, 9, 'F')
  doc.setFillColor(...GREEN)
  doc.rect(14, y, 3, 9, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...WHITE)
  doc.text(title, 21, y + 6)
  return y + 14
}

export function generateAccountPDF(account) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()

  drawHeader(doc, account.name, false)

  let y = 48

  // Account info row
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  doc.text(`Conta: act_${account.id}`, 14, y)
  doc.text(`Moeda: ${account.currency}`, 80, y)

  // Balance badge
  doc.setFillColor(...NAVY)
  doc.roundedRect(100, y - 5, 60, 8, 2, 2, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...GREEN)
  doc.text(`Saldo: ${fmtBRL(account.balance, account.currency)}`, 130, y, { align: 'center' })

  y += 10

  // KPIs
  y = drawKpiRow(doc, account.metrics, account.currency, y)

  // Campaign table
  y = drawSectionTitle(doc, `CAMPANHAS (${account.campaigns.length})`, y)

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Campanha', 'Status', 'Gasto', 'Impressões', 'Cliques', 'CTR', 'CPC', 'CPM']],
    body: account.campaigns.sort((a, b) => b.spend - a.spend).map(c => [
      c.name.length > 40 ? c.name.slice(0, 38) + '…' : c.name,
      c.status === 'ACTIVE' ? 'Ativa' : c.status.includes('PAUSED') ? 'Pausada' : c.status,
      fmtBRL(c.spend, account.currency),
      fmtNum(c.impressions),
      fmtNum(c.clicks),
      fmtPct(c.ctr),
      fmtBRL(c.cpc, account.currency),
      fmtBRL(c.cpm, account.currency),
    ]),
    styles: {
      fontSize: 7.5, cellPadding: 3,
      fillColor: NAVY, textColor: WHITE,
      lineColor: [20, 30, 50], lineWidth: 0.1,
    },
    headStyles: {
      fillColor: DARK, textColor: GRAY,
      fontSize: 6.5, fontStyle: 'bold',
      cellPadding: { top: 4, bottom: 4, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: [10, 14, 26] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'center' },
      2: { halign: 'right', textColor: GREEN },
      3: { halign: 'right' }, 4: { halign: 'right' },
      5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' },
    },
    didDrawCell(data) {
      if (data.section === 'body' && data.column.index === 1) {
        const status = data.cell.raw
        const color = status === 'Ativa' ? GREEN : AMBER
        doc.setFillColor(...color)
        doc.circle(
          data.cell.x + 2.5,
          data.cell.y + data.cell.height / 2,
          1.2, 'F'
        )
      }
    },
    didParseCell(data) {
      if (data.section === 'body' && data.column.index === 1) {
        const status = data.cell.raw
        data.cell.styles.textColor = status === 'Ativa' ? GREEN : AMBER
      }
    },
  })

  // Footer
  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFillColor(...DARK)
    doc.rect(0, pageH - 8, W, 8, 'F')
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(`GustaDash · Gerado em ${fmtDate()} · Página ${p} de ${pages}`, W / 2, pageH - 2.5, { align: 'center' })
  }

  doc.save(`relatorio_${account.name.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export function generateAllAccountsPDF(accounts, totals) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()

  drawHeader(doc, 'Todas as Contas', true)

  let y = 48

  // Summary metrics
  y = drawKpiRow(doc, totals, 'BRL', y)

  // Accounts overview table
  y = drawSectionTitle(doc, `VISÃO GERAL — ${accounts.filter(a => !a.error).length} CONTAS`, y)

  autoTable(doc, {
    startY: y,
    margin: { left: 14, right: 14 },
    head: [['Conta', 'Saldo', 'Gasto 30d', 'Impressões', 'Cliques', 'CTR', 'Anúncios Ativos']],
    body: accounts.filter(a => !a.error).sort((a, b) => b.metrics.spend - a.metrics.spend).map(a => [
      a.name,
      fmtBRL(a.balance, a.currency),
      fmtBRL(a.metrics.spend, a.currency),
      fmtNum(a.metrics.impressions),
      fmtNum(a.metrics.clicks),
      fmtPct(a.metrics.ctr),
      a.activeAds.length,
    ]),
    styles: { fontSize: 8, cellPadding: 3, fillColor: NAVY, textColor: WHITE, lineColor: [20, 30, 50], lineWidth: 0.1 },
    headStyles: { fillColor: DARK, textColor: GRAY, fontSize: 6.5, fontStyle: 'bold', cellPadding: { top: 4, bottom: 4, left: 3, right: 3 } },
    alternateRowStyles: { fillColor: [10, 14, 26] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { halign: 'right', textColor: GREEN, fontStyle: 'bold' },
      2: { halign: 'right', textColor: [251, 146, 60] },
      3: { halign: 'right' }, 4: { halign: 'right' },
      5: { halign: 'right' }, 6: { halign: 'center' },
    },
  })

  // Individual account pages
  accounts.filter(a => !a.error && a.campaigns.length > 0).forEach(account => {
    doc.addPage()
    drawHeader(doc, account.name, false)

    let ay = 48

    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(`Conta: act_${account.id}  ·  Saldo: ${fmtBRL(account.balance, account.currency)}  ·  ${account.activeAds.length} anúncios ativos`, 14, ay)
    ay += 8

    ay = drawKpiRow(doc, account.metrics, account.currency, ay)
    ay = drawSectionTitle(doc, `CAMPANHAS (${account.campaigns.length})`, ay)

    autoTable(doc, {
      startY: ay,
      margin: { left: 14, right: 14 },
      head: [['Campanha', 'Status', 'Gasto', 'Impressões', 'Cliques', 'CTR', 'CPC', 'CPM']],
      body: account.campaigns.sort((a, b) => b.spend - a.spend).map(c => [
        c.name.length > 40 ? c.name.slice(0, 38) + '…' : c.name,
        c.status === 'ACTIVE' ? 'Ativa' : c.status.includes('PAUSED') ? 'Pausada' : c.status,
        fmtBRL(c.spend, account.currency),
        fmtNum(c.impressions), fmtNum(c.clicks),
        fmtPct(c.ctr), fmtBRL(c.cpc, account.currency), fmtBRL(c.cpm, account.currency),
      ]),
      styles: { fontSize: 7.5, cellPadding: 3, fillColor: NAVY, textColor: WHITE, lineColor: [20, 30, 50], lineWidth: 0.1 },
      headStyles: { fillColor: DARK, textColor: GRAY, fontSize: 6.5, fontStyle: 'bold', cellPadding: { top: 4, bottom: 4, left: 3, right: 3 } },
      alternateRowStyles: { fillColor: [10, 14, 26] },
      columnStyles: {
        0: { cellWidth: 70 },
        1: { cellWidth: 20, halign: 'center' },
        2: { halign: 'right', textColor: GREEN },
        3: { halign: 'right' }, 4: { halign: 'right' },
        5: { halign: 'right' }, 6: { halign: 'right' }, 7: { halign: 'right' },
      },
      didParseCell(data) {
        if (data.section === 'body' && data.column.index === 1) {
          data.cell.styles.textColor = data.cell.raw === 'Ativa' ? GREEN : AMBER
        }
      },
    })
  })

  // Footer all pages
  const pages = doc.getNumberOfPages()
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p)
    const pageH = doc.internal.pageSize.getHeight()
    doc.setFillColor(...DARK)
    doc.rect(0, pageH - 8, W, 8, 'F')
    doc.setFontSize(6)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(`GustaDash · Gerado em ${fmtDate()} · Página ${p} de ${pages}`, W / 2, pageH - 2.5, { align: 'center' })
  }

  doc.save(`relatorio_todas_contas_${new Date().toISOString().slice(0, 10)}.pdf`)
}
