import { useEffect } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { WS_URL } from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

/** Conecta ao WebSocket autenticado e exibe os avisos de prazo enviados so para este usuario. */
export default function NotificationListener() {
  const { token } = useAuth()
  const toast = useToast()

  useEffect(() => {
    if (!token) return
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 10000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (frame) => toast.aviso(frame.body))
      },
    })
    client.activate()
    return () => { client.deactivate() }
  }, [token, toast])

  return null
}
