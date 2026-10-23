import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BookOpen, CheckSquare, Calendar, LayoutDashboard, LogOut } from 'lucide-react'
import NotificationToast from './NotificationToast'

export default function Layout() {
  const { logout } = useAuth()
  const nav = useNavigate()
  const handleLogout = () => { logout(); nav('/login') }

  const linkCls = 'flex items-center gap-2 p-2 rounded hover:bg-blue-600'

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-blue-700 text-white p-4 space-y-2">
        <h1 className="text-xl font-bold mb-6">📚 Study Planner</h1>
        <Link to="/" className={linkCls}><LayoutDashboard size={18}/> Dashboard</Link>
        <Link to="/materias" className={linkCls}><BookOpen size={18}/> Matérias</Link>
        <Link to="/tarefas" className={linkCls}><CheckSquare size={18}/> Tarefas</Link>
        <Link to="/cronograma" className={linkCls}><Calendar size={18}/> Cronograma</Link>
        <button onClick={handleLogout} className={`${linkCls} w-full mt-8`}>
          <LogOut size={18}/> Sair
        </button>
      </aside>
      <main className="flex-1 p-6"><Outlet /></main>
      <NotificationToast />
    </div>
  )
}