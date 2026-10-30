import { h, icone } from '../dom.js'
import { Segmentado } from './segmentado.js'

const MODOS = {
  foco: { rotulo: 'Foco', minutos: 25, cor: '#FFD04A' },
  pausa: { rotulo: 'Pausa curta', minutos: 5, cor: '#5EE0B5' },
  longa: { rotulo: 'Pausa longa', minutos: 15, cor: '#5EE0B5' },
}
const OPCOES = Object.entries(MODOS).map(([chave, m]) => [chave, m.rotulo])
const SVG_NS = 'http://www.w3.org/2000/svg'
const R = 54
const CIRC = 2 * Math.PI * R

const fmt = (ms) => {
  const total = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Devolve { el, destruir }. onFocoConcluido(n) roda a cada foco completo. */
export function PomodoroTimer({ onFocoConcluido, classe = '' } = {}) {
  let modo = 'foco'
  let restante = MODOS.foco.minutos * 60000
  let ativo = false
  let ciclos = 0 // focos concluidos
  let fim = 0
  let intervalo = null

  // --- elementos ---
  const segmentado = Segmentado({ opcoes: OPCOES, valor: modo, onChange: (m) => irPara(m), rotulo: 'Modo', variante: 'escuro', compacto: true })

  const trilho = document.createElementNS(SVG_NS, 'circle')
  const arco = document.createElementNS(SVG_NS, 'circle')
  for (const c of [trilho, arco]) {
    c.setAttribute('cx', '60'); c.setAttribute('cy', '60'); c.setAttribute('r', R)
    c.setAttribute('fill', 'none'); c.setAttribute('stroke-width', '6')
  }
  trilho.setAttribute('stroke', 'rgb(255 255 255 / .1)')
  arco.setAttribute('stroke-linecap', 'round')
  arco.setAttribute('stroke-dasharray', CIRC)
  arco.style.transition = 'stroke-dashoffset .3s linear, stroke .4s ease'
  const anel = document.createElementNS(SVG_NS, 'svg')
  anel.setAttribute('viewBox', '0 0 120 120'); anel.setAttribute('class', 'pomodoro__svg'); anel.setAttribute('aria-hidden', 'true')
  anel.append(trilho, arco)

  // cada dígito ocupa largura fixa, então o relógio não "pula" a cada segundo
  const digitos = [0, 1, 3, 4].map(() => h('span', { class: 'pomodoro__digito', 'aria-hidden': 'true' }))
  const relogio = h('span', { class: 'pomodoro__relogio', role: 'timer', 'aria-live': 'off' },
    digitos[0], digitos[1], h('span', { class: 'pomodoro__dois-pontos', 'aria-hidden': 'true' }, ':'), digitos[2], digitos[3])
  const pontos = [0, 1, 2, 3].map(() => h('span', { class: 'pomodoro__ponto' }))
  const contagem = h('span', { class: 'pomodoro__contagem' })

  const btnPlay = h('button', { class: 'pomodoro__play', onClick: () => alternar() })
  const btnReiniciar = h('button', { class: 'pomodoro__aux', 'aria-label': 'Reiniciar', onClick: () => irPara(modo) }, icone('rotate-ccw', { tamanho: 18 }))
  const btnPular = h('button', { class: 'pomodoro__aux', 'aria-label': 'Pular para a próxima etapa',
    onClick: () => irPara(modo === 'foco' ? 'pausa' : 'foco') }, icone('skip-forward', { tamanho: 18 })) // pular não conta como foco

  const el = h('section', { class: `pomodoro ${classe}`.trim(), 'aria-label': 'Timer Pomodoro' },
    segmentado.el,
    h('div', { class: 'pomodoro__anel' }, anel,
      h('div', { class: 'pomodoro__centro' }, relogio,
        h('div', { class: 'pomodoro__rodape' }, h('span', { class: 'pomodoro__pontos', 'aria-hidden': 'true' }, pontos), contagem))),
    h('div', { class: 'pomodoro__controles' }, btnReiniciar, btnPlay, btnPular))

  // --- estado -> tela ---
  function desenhar() {
    const total = MODOS[modo].minutos * 60000
    const cor = MODOS[modo].cor
    const texto = fmt(restante)
    relogio.setAttribute('aria-label', texto)
    ;[texto[0], texto[1], texto[3], texto[4]].forEach((c, i) => { digitos[i].textContent = c })

    arco.setAttribute('stroke', cor)
    arco.setAttribute('stroke-dashoffset', CIRC * (restante / total)) // 1 - progresso
    arco.style.filter = `drop-shadow(0 0 6px ${cor}88)`

    const naRodada = modo === 'longa' ? 4 : ciclos % 4
    pontos.forEach((p, i) => { p.style.backgroundColor = i < naRodada ? cor : 'rgb(255 255 255 / .22)' })
    contagem.textContent = `${ciclos} ${ciclos === 1 ? 'foco concluído' : 'focos concluídos'}`

    const rotuloPlay = ativo ? 'Pausar' : restante < total ? 'Continuar' : 'Iniciar'
    btnPlay.style.backgroundColor = cor
    btnPlay.style.boxShadow = `0 10px 28px -10px ${cor}`
    btnPlay.replaceChildren(icone(ativo ? 'pause' : 'play', { tamanho: 20, preencher: true }), ` ${rotuloPlay}`)

    document.title = ativo ? `${texto} · ${MODOS[modo].rotulo}` : 'Study Planner'
  }

  function parar() { clearInterval(intervalo); intervalo = null }

  function irPara(novo) {
    parar()
    modo = novo
    restante = MODOS[novo].minutos * 60000
    ativo = false
    segmentado.definir(novo)
    desenhar()
  }

  function concluir() {
    if (modo === 'foco') {
      ciclos += 1
      onFocoConcluido?.(ciclos)
      irPara(ciclos % 4 === 0 ? 'longa' : 'pausa')
    } else irPara('foco')
  }

  // Conta pelo horario de termino: nao "desliza" mesmo se a aba ficar em segundo plano
  function alternar() {
    if (ativo) { ativo = false; parar(); desenhar(); return }
    ativo = true
    fim = Date.now() + restante
    intervalo = setInterval(() => {
      const falta = fim - Date.now()
      if (falta <= 0) { parar(); concluir() } else { restante = falta; desenhar() }
    }, 250)
    desenhar()
  }

  desenhar()
  return { el, destruir: () => { parar(); document.title = 'Study Planner' } }
}
