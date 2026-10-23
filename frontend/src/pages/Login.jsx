import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login } from '../services/authService'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const { login: setToken } = useAuth()
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = await login(email, senha)
      setToken(data.token)
      nav('/')
    } catch {
      setErro('Credenciais inválidas')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
        <input type="email" placeholder="E-mail" value={email}
          onChange={e => setEmail(e.target.value)} required
          className="w-full p-2 border rounded mb-3" />
        <input type="password" placeholder="Senha" value={senha}
          onChange={e => setSenha(e.target.value)} required
          className="w-full p-2 border rounded mb-4" />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Entrar
        </button>
        <p className="text-center text-sm mt-4">
          Não tem conta? <Link to="/register" className="text-blue-600">Registre-se</Link>
        </p>
      </form>
    </div>
  )
}