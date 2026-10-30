import { h } from '../dom.js'
import { rotuloBotao } from '../dom.js'
import { AuthShell } from '../componentes/auth-shell.js'
import { CampoSenha } from '../componentes/campo-senha.js'
import { authApi } from '../api.js'
import { entrar } from '../auth.js'
import { navegar } from '../router.js'
import { mensagemDeErro } from '../lib/erros.js'

export function Login() {
  const erro = h('p', { role: 'alert', class: 'alerta-erro', hidden: true })
  const email = h('input', { id: 'email', type: 'email', autocomplete: 'email', required: true, class: 'campo' })
  const senha = CampoSenha({ id: 'senha', autocomplete: 'current-password', required: true })
  const botao = h('button', { class: 'btn btn-primario btn-bloco' })
  rotuloBotao(botao, { texto: 'Entrar' })

  const form = h('form', { class: 'pilha pilha--media', onSubmit: async (e) => {
    e.preventDefault()
    erro.hidden = true
    rotuloBotao(botao, { carregando: true, texto: 'Entrando…' })
    try {
      entrar(await authApi.login(email.value.trim(), senha.input.value))
      navegar('/')
    } catch (err) {
      erro.textContent = mensagemDeErro(err, 'E-mail ou senha inválidos')
      erro.hidden = false
      rotuloBotao(botao, { texto: 'Entrar' })
    }
  } },
    erro,
    h('div', {}, h('label', { for: 'email', class: 'campo-rotulo' }, 'E-mail'), email),
    h('div', {}, h('label', { for: 'senha', class: 'campo-rotulo' }, 'Senha'), senha.el),
    botao)

  requestAnimationFrame(() => email.focus())
  return { el: AuthShell({
    titulo: 'Entrar', subtitulo: 'Acesse seu planejador de estudos.', filhos: form,
    rodape: ['Não tem conta? ', h('a', { href: '#/register', class: 'link' }, 'Criar conta')],
  }) }
}
