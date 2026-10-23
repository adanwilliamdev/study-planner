import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { register } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { mensagemDeErro } from '../lib/erros'
import AuthShell from '../components/AuthShell'
import CampoSenha from '../components/CampoSenha'

export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { isAuth } = useAuth()
  const toast = useToast()
  const nav = useNavigate()

  if (isAuth) return <Navigate to="/" replace />

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      await register(form.nome.trim(), form.email.trim(), form.senha)
      toast.sucesso('Conta criada! Entre com seu e-mail e senha.')
      nav('/login')
    } catch (err) {
      setErro(mensagemDeErro(err, 'Não foi possível criar a conta'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthShell
      titulo="Criar conta"
      subtitulo="Comece a organizar seus estudos."
      rodape={<>Já tem conta? <Link to="/login" className="font-semibold text-link hover:underline">Entrar</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && <p role="alert" className="rounded-xl bg-bad-bg px-3.5 py-2.5 text-sm text-bad-fg">{erro}</p>}
        <div>
          <label htmlFor="nome" className="field-label">Nome</label>
          <input id="nome" autoComplete="name" value={form.nome} required maxLength={100} autoFocus
            onChange={set('nome')} className="field" />
        </div>
        <div>
          <label htmlFor="email" className="field-label">E-mail</label>
          <input id="email" type="email" autoComplete="email" value={form.email} required
            onChange={set('email')} className="field" />
        </div>
        <div>
          <label htmlFor="senha" className="field-label">Senha</label>
          <CampoSenha id="senha" autoComplete="new-password" value={form.senha} required
            minLength={6} maxLength={72} onChange={set('senha')} aria-describedby="dica-senha" />
          <p id="dica-senha" className="mt-1 text-xs text-ink-mute">Mínimo de 6 caracteres.</p>
        </div>
        <button className="btn-primary w-full py-3" disabled={enviando}>
          {enviando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {enviando ? 'Criando…' : 'Criar conta'}
        </button>
      </form>
    </AuthShell>
  )
}
