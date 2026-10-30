import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

/** Campo de senha com botão para mostrar/ocultar. Repassa as demais props ao <input>. */
export default function CampoSenha({ className = '', ...props }) {
  const [ver, setVer] = useState(false)
  return (
    <div className="relative">
      <input {...props} type={ver ? 'text' : 'password'} className={`field pr-11 ${className}`} />
      <button type="button" onClick={() => setVer(v => !v)} aria-pressed={ver}
        aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}
        className="icon-btn absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2">
        {ver ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
      </button>
    </div>
  )
}
