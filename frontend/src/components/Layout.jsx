import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, CheckSquare, Calendar, LayoutDashboard, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NotificationListener from './NotificationListener'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { iniciais } from '../lib/cores'

const links = [
  { to: '/', rotulo: 'Início', Icone: LayoutDashboard, end: true },
  { to: '/tarefas', rotulo: 'Tarefas', Icone: CheckSquare },
  { to: '/cronograma', rotulo: 'Cronograma', Icone: Calendar },
  { to: '/materias', rotulo: 'Matérias', Icone: BookOpen },
]

const ALTURA_ITEM = 44 // px (h-11) + 4 de espaço entre itens

export default function Layout() {
  const { logout, usuario } = useAuth()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const sair = () => { logout(); nav('/login') }

  const ativo = links.findIndex(l => (l.end ? pathname === l.to : pathname.startsWith(l.to)))

  const desktopCls = ({ isActive }) =>
    `relative z-10 flex h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-semibold transition-colors duration-300 ${
      isActive ? 'text-brand-700' : 'text-ink-soft hover:text-ink'}`
  const mobileCls = ({ isActive }) =>
    `relative z-10 flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-semibold transition-colors duration-300 ${
      isActive ? 'text-brand-700' : 'text-ink-mute'}`

  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 p-3 md:block">
        <div className="flex h-full flex-col rounded-3xl border border-line bg-surface p-4 shadow-panel">
          <Logo className="mb-8 px-2 pt-1" />
          <nav className="relative flex flex-col gap-1" aria-label="Principal">
            {ativo >= 0 && (
              <span aria-hidden="true"
                className="absolute left-0 top-0 h-11 w-full rounded-xl bg-brand-50 transition-transform duration-500 ease-fluid"
                style={{ transform: `translateY(${ativo * ALTURA_ITEM + ativo * 4}px)` }}>
                <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-brand-600" />
              </span>
            )}
            {links.map(({ to, rotulo, Icone, end }) => (
              <NavLink key={to} to={to} end={end} className={desktopCls}>
                <Icone size={19} aria-hidden="true" /> {rotulo}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl bg-sunken p-3">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700" aria-hidden="true">
                {iniciais(usuario?.nome)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{usuario?.nome}</p>
                <p className="truncate text-xs text-ink-mute">{usuario?.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <button onClick={sair} className="btn-ghost flex-1 justify-start px-3 py-2"><LogOut size={16} aria-hidden="true" /> Sair</button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-paper/80 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-xl md:hidden">
          <Logo />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button onClick={sair} className="icon-btn" aria-label="Sair"><LogOut size={18} /></button>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 md:px-8 md:pb-12 md:pt-10">
          <div key={pathname} className="animate-page-in">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-3 z-30 md:hidden" aria-label="Principal"
           style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
        <div className="relative flex rounded-2xl border border-line bg-surface/85 p-1.5 shadow-pop backdrop-blur-xl">
          {ativo >= 0 && (
            <span aria-hidden="true"
              className="absolute inset-y-1.5 left-1.5 rounded-xl bg-brand-50 transition-transform duration-500 ease-fluid"
              style={{ width: 'calc((100% - 0.75rem) / 4)', transform: `translateX(${ativo * 100}%)` }} />
          )}
          {links.map(({ to, rotulo, Icone, end }) => (
            <NavLink key={to} to={to} end={end} className={mobileCls}>
              <Icone size={20} aria-hidden="true" /> {rotulo}
            </NavLink>
          ))}
        </div>
      </nav>

      <NotificationListener />
    </div>
  )
}
