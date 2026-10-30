import { h, rotuloBotao } from '../dom.js'
import { AuthShell } from '../componentes/auth-shell.js'
import { CampoSenha } from '../componentes/campo-senha.js'
import { authApi } from '../api.js'
import { navegar } from '../router.js'
import { toast } from '../toast.js'
import { mensagemDeErro } from '../lib/erros.js'

export function Register() {
  const erro = h('p', { role: 'alert', class: 'alerta-erro', hidden: true })
  const nome = h('input', { id: 'nome', autocomplete: 'name', required: true, maxlength: 100, class: 'campo' })
  const email = h('input', { id: 'email', type: 'email', autocomplete: 'email', required: true, class: 'campo' })
  const senha = CampoSenha({ id: 'senha', autocomplete: 'new-password', required: true, minlength: 6, maxlength: 72, 'aria-describedby': 'dica-senha' })
  const botao = h('button', { class: 'btn btn-primario btn-bloco' })
  rotuloBotao(botao, { texto: 'Criar conta' })

  const form = h('form', { class: 'pilha pilha--media', onSubmit: async (e) => {
    e.preventDefault()
    erro.hidden = true
    rotuloBotao(botao, { carregando: true, texto: 'Criando…' })
    try {
      await authApi.register(nome.value.trim(), email.value.trim(), senha.input.value)
      toast.sucesso('Conta criada! Entre com seu e-mail e senha.')
      navegar('/login')
    } catch (err) {
      erro.textContent = mensagemDeErro(err, 'Não foi possível criar a conta')
      erro.hidden = false
      rotuloBotao(botao, { texto: 'Criar conta' })
    }
  } },
    erro,
    h('div', {}, h('label', { for: 'nome', class: 'campo-rotulo' }, 'Nome'), nome),
    h('div', {}, h('label', { for: 'email', class: 'campo-rotulo' }, 'E-mail'), email),
    h('div', {},
      h('label', { for: 'senha', class: 'campo-rotulo' }, 'Senha'), senha.el,
      h('p', { id: 'dica-senha', class: 'campo-dica' }, 'Mínimo de 6 caracteres.')),
    botao)

  requestAnimationFrame(() => nome.focus())
  return { el: AuthShell({
    titulo: 'Criar conta', subtitulo: 'Comece a organizar seus estudos.', filhos: form,
    rodape: ['Já tem conta? ', h('a', { href: '#/login', class: 'link' }, 'Entrar')],
  }) }
}
