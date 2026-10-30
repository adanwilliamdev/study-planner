import { iniciarTema } from './tema.js'
import { sair } from './auth.js'
import { iniciarRouter, navegar } from './router.js'
import { criarLayout } from './componentes/layout.js'
import { Login } from './paginas/login.js'
import { Register } from './paginas/register.js'
import { Dashboard } from './paginas/dashboard.js'
import { Materias } from './paginas/materias.js'
import { Tarefas } from './paginas/tarefas.js'
import { Cronograma } from './paginas/cronograma.js'

iniciarTema()

// api.js avisa quando o servidor responde 401 em rota protegida (sessão expirada)
window.addEventListener('auth:expirada', () => { sair(); navegar('/login') })

iniciarRouter({
  raiz: document.getElementById('raiz'),
  criarLayout,
  tabela: {
    '/login': { publica: true, pagina: Login },
    '/register': { publica: true, pagina: Register },
    '/': { pagina: Dashboard },
    '/materias': { pagina: Materias },
    '/tarefas': { pagina: Tarefas },
    '/cronograma': { pagina: Cronograma },
  },
})
