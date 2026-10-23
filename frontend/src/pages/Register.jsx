import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/authService'

export default function Register() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const nav = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await register(form.nome, form.email, form.senha)
      nav('/login')
    } catch (err) {
      setErro(err.response?.data || 'Erro ao registrar')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Registrar</h1>
        {erro && <p className="text-red-500 text-sm mb-4">{erro}</p>}
        <input type="text" placeholder="Nome" value={form.nome}
          onChange={e => setForm({ ...form, nome: e.target.value })} required
          className="w-full p-2 border rounded mb-3" />
        <input type="email" placeholder="E-mail" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} required
          className="w-full p-2 border rounded mb-3" />
        <input type="password" placeholder="Senha" value={form.senha}
          onChange={e => setForm({ ...form, senha: e.target.value })} required
          className="w-full p-2 border rounded mb-4" />
        <button className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Criar conta
        </button>
        <p className="text-center text-sm mt-4">
          Já tem conta? <Link to="/login" className="text-blue-600">Entrar</Link>
        </p>
      </form>
    </div>
  )
}