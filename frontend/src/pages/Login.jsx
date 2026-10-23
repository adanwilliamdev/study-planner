import { useState } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { login } from '../services/authService'
import { useAuth } from '../context/AuthContext'
import { mensagemDeErro } from '../lib/erros'
import AuthShell from '../components/AuthShell'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const { login: salvarSessao, isAuth } = useAuth()
  const nav = useNavigate()

  if (isAuth) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    try {
      salvarSessao(await login(email.trim(), senha))
      nav('/')
    } catch (err) {
      setErro(mensagemDeErro(err, 'E-mail ou senha inválidos'))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <AuthShell
      titulo="Entrar"
      subtitulo="Acesse seu planejador de estudos."
      rodape={<>Não tem conta? <Link to="/register" className="font-semibold text-brand-600 hover:underline">Criar conta</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
        <div>
          <label htmlFor="email" className="field-label">E-mail</label>
          <input id="email" type="email" autoComplete="email" value={email} required autoFocus
            onChange={e => setEmail(e.target.value)} className="field" />
        </div>
        <div>
          <label htmlFor="senha" className="field-label">Senha</label>
          <input id="senha" type="password" autoComplete="current-password" value={senha} required
            onChange={e => setSenha(e.target.value)} className="field" />
        </div>
        <button className="btn-primary w-full" disabled={enviando}>
          {enviando && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </AuthShell>
  )
}
