import { useEffect, useState } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

export default function NotificationToast() {
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/topic/notifications', (frame) => {
          setMsg(frame.body)
          setTimeout(() => setMsg(null), 8000)
        })
      },
    })
    client.activate()
    return () => client.deactivate()
  }, [])

  if (!msg) return null
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow-lg max-w-sm">
      {msg}
    </div>
  )
}