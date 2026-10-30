import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '' }) {
  const { tema, alternar } = useTheme()
  const escuro = tema === 'dark'
  return (
    <button type="button" onClick={alternar} className={`icon-btn ${className}`}
      aria-label={escuro ? 'Ativar tema claro' : 'Ativar tema escuro'}>
      <span className="relative grid h-[18px] w-[18px] place-items-center">
      <Sun size={18} aria-hidden="true"
        className={`absolute transition-all duration-500 ease-fluid ${escuro ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'}`} />
      <Moon size={18} aria-hidden="true"
        className={`absolute transition-all duration-500 ease-fluid ${escuro ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      </span>
    </button>
  )
}
