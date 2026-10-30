import { createContext, useCallback, useContext, useState } from 'react'
import Modal from '../components/Modal'

const ConfirmContext = createContext(null)

/** Uso: const confirmar = useConfirm(); if (await confirmar({ titulo, mensagem, acao })) ... */
export function ConfirmProvider({ children }) {
  const [estado, setEstado] = useState(null)

  const confirmar = useCallback((opcoes) => new Promise((resolve) => {
    setEstado({ ...opcoes, resolve })
  }), [])

  const fechar = (resultado) => {
    estado?.resolve(resultado)
    setEstado(null)
  }

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {estado && (
        <Modal titulo={estado.titulo} onClose={() => fechar(false)} largura="max-w-sm">
          <p className="text-sm text-ink-soft">{estado.mensagem}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => fechar(false)}>Cancelar</button>
            <button className="btn-danger" onClick={() => fechar(true)}>{estado.acao || 'Confirmar'}</button>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  )
}

export const useConfirm = () => useContext(ConfirmContext)
