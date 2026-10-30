const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
const DIAS_JS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']

export const DIAS_SEMANA = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
export const NOMES_DIAS = {
  MONDAY: 'Segunda', TUESDAY: 'Terça', WEDNESDAY: 'Quarta', THURSDAY: 'Quinta',
  FRIDAY: 'Sexta', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
}
export const NOMES_DIAS_CURTOS = {
  MONDAY: 'Seg', TUESDAY: 'Ter', WEDNESDAY: 'Qua', THURSDAY: 'Qui',
  FRIDAY: 'Sex', SATURDAY: 'Sáb', SUNDAY: 'Dom',
}

/** "2026-10-22" -> Date local (evita o deslocamento de fuso do new Date(string)). */
export function parseData(str) {
  if (!str) return null
  const [a, m, d] = str.split('-').map(Number)
  return new Date(a, m - 1, d)
}

export function hojeISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function diaDaSemanaHoje() {
  return DIAS_JS[new Date().getDay()]
}

/** Diferenca em dias entre a data e hoje (negativo = atrasada). */
export function diasAte(str) {
  const alvo = parseData(str)
  if (!alvo) return null
  const hoje = parseData(hojeISO())
  return Math.round((alvo - hoje) / 86400000)
}

export function formatarData(str) {
  const d = parseData(str)
  return d ? `${d.getDate()} ${MESES[d.getMonth()]}` : ''
}

/** Rotulo humano do prazo + tom visual. */
export function rotuloPrazo(str) {
  const n = diasAte(str)
  if (n === null) return null
  if (n < 0) return { texto: n === -1 ? 'Atrasada desde ontem' : `Atrasada há ${-n} dias`, tom: 'atrasada' }
  if (n === 0) return { texto: 'Vence hoje', tom: 'urgente' }
  if (n === 1) return { texto: 'Vence amanhã', tom: 'urgente' }
  if (n <= 7) return { texto: `Em ${n} dias`, tom: 'proxima' }
  return { texto: formatarData(str), tom: 'normal' }
}

export const hhmm = (t) => (t ? t.slice(0, 5) : '')

/** "08:30" -> minutos desde a meia-noite. */
export const minutos = (t) => {
  const [h, m] = hhmm(t).split(':').map(Number)
  return h * 60 + m
}

export function dataPorExtenso(date = new Date()) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}
