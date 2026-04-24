export const META_TOKEN = import.meta.env.VITE_META_TOKEN || 'EAAVpkVdNDs8BRWEb7aZAuZCZBssqq3scnE83BP5wuCNJqxn9Vz70bf4DXeopiZCNzX5jZCD6X9yK19SS46fzVq1PZAJvBzq72uUiTopZCbnG1ev6HZBw0sn5WGOQOLQsFQ33KRd76nWy9Rsp7jUrLKuvFFbu29EZC6glk8WpWm2SID0MxdBVzMG9NVDmbcbpluubI'

export const AD_ACCOUNTS = [
  { name: 'Abihto Suplementos', id: '892013219638816' },
  { name: 'Ae Virtual', id: '1628986774598556' },
  { name: 'All Beefs Santos', id: '1489245389283252' },
  { name: 'All Beefs PG', id: '6994991470562597' },
  { name: 'IMPERIO FITNESS', id: '206276071547845' },
  { name: 'Caio Passeio de Cães', id: '1618135212805210' },
  { name: 'CA 01 - Confiatta', id: '1595353108381362' },
  { name: 'Corretora Luzia', id: '2458491964589198' },
  { name: 'Corretora Silvana', id: '941049445195575' },
  { name: 'Edisley Bastos', id: '1478882097224606' },
  { name: 'CA1 | Evoluc Construtora', id: '607105764151649' },
  { name: 'Evoluc Vendas', id: '780023591096157' },
  { name: 'CT - Filhos do Rei Variedades', id: '920414951932633' },
  { name: 'CA 01 - Julio Machado', id: '26584253644539994' },
  { name: 'CA W GUIMARÃES BANKING', id: '2683197831880145' },
  { name: 'Joy Variedades', id: '2082050112405588' },
]

export const META_API_VERSION = 'v19.0'
export const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`
export const REFRESH_INTERVAL = 5 * 60 * 1000
export const THRESHOLDS_KEY = 'meta_balance_thresholds'

export const ACCOUNT_STATUS_MAP = {
  1: { label: 'Ativa', color: 'success' },
  2: { label: 'Desativada', color: 'danger' },
  3: { label: 'Pendente', color: 'warning' },
  7: { label: 'Revisão', color: 'warning' },
  9: { label: 'Período de Graça', color: 'warning' },
  101: { label: 'Encerrada', color: 'danger' },
}
