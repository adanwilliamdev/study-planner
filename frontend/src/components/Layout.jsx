import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { BookOpen, CheckSquare, Calendar, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NotificationListener from './NotificationListener'
import Logo from './Logo'

const links = [
  { to: '/', rotulo: 'Início', Icone: LayoutDashboard, end: true },
  { to: '/tarefas', rotulo: 'Tarefas', Icone: CheckSquare },
  { to: '/cronograma', rotulo: 'Cronograma', Icone: Calendar },
  { to: '/materias', rotulo: 'Matérias', Icone: BookOpen },
]

export default function Layout() {
  const { logout, usuario } = useAuth()
  const nav = useNavigate()
  const sair = () => { logout(); nav('/login') }

  const desktopCls = ({ isActive }) =>
    `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
      isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-paper hover:text-ink'}`
  const mobileCls = ({ isActive }) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold ${
      isActive ? 'text-brand-700' : 'text-ink-mute'}`

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-white p-4 md:flex">
        <Logo className="mb-8 px-2" />
        <nav className="flex flex-1 flex-col gap-1" aria-label="Principal">
          {links.map(({ to, rotulo, Icone, end }) => (
            <NavLink key={to} to={to} end={end} className={desktopCls}>
              <Icone size={18} aria-hidden="true" /> {rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line pt-3">
          <p className="truncate px-2 text-sm font-semibold">{usuario?.nome}</p>
          <p className="mb-2 truncate px-2 text-xs text-ink-mute">{usuario?.email}</p>
          <button onClick={sair} className="btn-ghost w-full justify-start"><LogOut size={16} /> Sair</button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-line bg-white px-4 py-3 md:hidden">
          <Logo />
          <button onClick={sair} className="icon-btn" aria-label="Sair"><LogOut size={18} /></button>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-10 md:pt-8">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-white md:hidden" aria-label="Principal">
        {links.map(({ to, rotulo, Icone, end }) => (
          <NavLink key={to} to={to} end={end} className={mobileCls}>
            <Icone size={20} aria-hidden="true" /> {rotulo}
          </NavLink>
        ))}
      </nav>

      <NotificationListener />
    </div>
  )
}
