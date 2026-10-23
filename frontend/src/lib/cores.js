const luz = (c) => {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
}

/** Escolhe branco ou azul-escuro, o que der mais contraste sobre a cor de fundo (#rrggbb). */
export function textoSobre(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return '#FFFFFF'
  const n = parseInt(m[1], 16)
  const L = 0.2126 * luz((n >> 16) & 255) + 0.7152 * luz((n >> 8) & 255) + 0.0722 * luz(n & 255)
  const comBranco = 1.05 / (L + 0.05)
  const comEscuro = (L + 0.05) / 0.0676
  return comBranco >= comEscuro ? '#FFFFFF' : '#1A1E52'
}

/** "Cálculo Diferencial" -> "CD" */
export function iniciais(nome = '') {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[1][0]).toUpperCase()
}
