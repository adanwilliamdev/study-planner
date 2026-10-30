# 📚 Study Planner

Aplicação full-stack para organização da rotina de estudos, com autenticação JWT, gerenciamento de matérias e tarefas, cronograma semanal, timer Pomodoro e notificações em tempo real via WebSocket.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=flat-square&logo=springboot)
![JavaScript](https://img.shields.io/badge/JavaScript-ES_Modules-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-puro-1572B6?style=flat-square&logo=css3)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Funcionalidades

- **Autenticação:** cadastro, login e autorização com JWT e senhas criptografadas com BCrypt.
- **Matérias:** cadastro, edição, exclusão, cores personalizadas e carga horária.
- **Tarefas:** gerenciamento de atividades, prioridades, prazos e status.
- **Cronograma semanal:** organização das sessões de estudo por dia e horário.
- **Pomodoro:** ciclos de 25 minutos de foco e 5 minutos de descanso.
- **Notificações em tempo real:** alertas de tarefas próximas do vencimento via WebSocket.
- **Materiais de estudo:** associação de PDFs, links e resumos às matérias.
- **Dashboard:** visão geral da rotina e das atividades.
- **Tema claro e escuro:** segue o sistema e pode ser trocado pelo botão na barra lateral.

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| Backend | Java 17, Spring Boot 3.2 |
| API e segurança | Spring Web, Spring Security, JWT |
| Persistência | Spring Data JPA, Hibernate, H2 |
| Comunicação em tempo real | Spring WebSocket, STOMP, SockJS |
| Documentação | Springdoc OpenAPI / Swagger |
| Frontend | JavaScript puro (ES modules), HTML5, sem framework e sem etapa de build |
| Estilização | CSS puro (variáveis CSS, tema claro/escuro) |
| Requisições HTTP | Fetch API |
| Tempo real (cliente) | WebSocket nativo com um cliente STOMP mínimo (`js/ws.js`) |
| Build | Maven (backend); o frontend não precisa de build |

## 🏗️ Arquitetura

A aplicação utiliza uma arquitetura em camadas, separando as responsabilidades do backend.

```text
Frontend (JavaScript + CSS puros)
        │
        ├── HTTP / REST
        └── WebSocket / STOMP
                │
                ▼
Backend (Spring Boot)
        │
        ├── Controllers
        ├── Services
        ├── Repositories
        ├── Security / JWT
        └── Notification Scheduler
                │
                ▼
          H2 Database
```

O frontend consome a API REST para operações de cadastro e gerenciamento. O WebSocket permite o recebimento de notificações sem precisar atualizar a página.

## 📁 Estrutura do Projeto

```text
study-planner/
├── backend/
│   ├── src/main/java/com/studyplanner/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── security/
│   │   ├── service/
│   │   └── websocket/
│   └── pom.xml
│
├── frontend/
│   ├── index.html
│   ├── favicon.svg
│   ├── css/
│   │   └── style.css          # todo o estilo (tokens, componentes, layout)
│   └── js/
│       ├── main.js            # ponto de entrada e tabela de rotas
│       ├── config.js          # URLs do backend
│       ├── router.js          # roteador por hash (#/tarefas)
│       ├── api.js             # fetch + serviços da API
│       ├── auth.js · tema.js · toast.js · modal.js · ws.js · dom.js · icones.js
│       ├── componentes/       # layout, pomodoro, segmentado, estados...
│       ├── paginas/           # login, register, dashboard, materias, tarefas, cronograma
│       └── lib/               # cores, datas, erros
│
└── README.md
```

## 🚀 Instalação e Execução

### Pré-requisitos

- JDK 17 ou superior
- Maven 3.9+
- Python 3 (ou qualquer servidor de arquivos estáticos)
- Git

### 1. Clonar o repositório

```bash
git clone https://github.com/adanwilliamdev/study-planner.git
cd study-planner
```

### 2. Executar o backend

```bash
cd backend
mvn spring-boot:run
```

Backend: `http://localhost:8080`

### 3. Executar o frontend

Em outro terminal, na pasta raiz do projeto:

O frontend é só HTML, CSS e JavaScript: não há `npm install` nem build. Basta servir a pasta `frontend` na porta **5173** (a porta liberada no CORS do backend):

```bash
cd frontend
python3 -m http.server 5173
```

Qualquer outro servidor estático serve (extensão Live Server do VS Code, `npx serve -l 5173`, Nginx...). Os módulos ES não funcionam abrindo o `index.html` direto do disco (`file://`), por isso o servidor é necessário.

Frontend: `http://localhost:5173`

### 4. Acessar a aplicação

1. Abra `http://localhost:5173`.
2. Crie uma conta.
3. Faça login.
4. Cadastre matérias, organize tarefas e planeje suas sessões de estudo.

## ⚙️ Configuração

O backend utiliza o banco H2 em memória durante o desenvolvimento.

Exemplo de configuração em `application.properties`:

```properties
server.port=8080

spring.datasource.url=jdbc:h2:mem:studyplanner;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false

app.jwt.secret=${JWT_SECRET:dev-only-secret-change-me-please-0123456789}
app.jwt.expiration-ms=86400000
app.cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173}

springdoc.swagger-ui.path=/swagger-ui.html
```

Variáveis de ambiente:

| Variável | Descrição |
|---|---|
| `JWT_SECRET` | Chave de assinatura do JWT, **mínimo de 32 caracteres**. O valor padrão serve apenas para desenvolvimento local. |
| `CORS_ALLOWED_ORIGINS` | Origens permitidas, separadas por vírgula (padrão: `http://localhost:5173`). |

No frontend, `js/config.js` define `API_URL` e `WS_URL` (substitui o antigo `.env`). Se servir o frontend em outra origem, ajuste também `CORS_ALLOWED_ORIGINS` no backend.

**Documentação da API:**

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## 🔌 Principais Endpoints

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastro de usuário |
| POST | `/api/auth/login` | Autenticação e emissão de JWT |
| GET | `/api/materias` | Listagem de matérias |
| POST | `/api/materias` | Cadastro de matéria |
| PUT / DELETE | `/api/materias/{id}` | Edição / exclusão (remove também tarefas, sessões e materiais da matéria) |
| GET | `/api/tarefas` | Listagem de tarefas |
| POST | `/api/tarefas` | Cadastro de tarefa (`materiaId` opcional no corpo) |
| PUT / DELETE | `/api/tarefas/{id}` | Edição / exclusão |
| GET | `/api/cronogramas` | Consulta do cronograma |
| POST | `/api/cronogramas` | Criação de sessão de estudo (`materiaId`, `diaDaSemana`, `horarioInicio`, `horarioFim` no corpo) |
| PUT | `/api/cronogramas/{id}/concluir` | Marca a sessão como concluída |
| GET | `/api/materiais/materia/{materiaId}` | Materiais de uma matéria |
| POST | `/api/materiais` | Cadastro de material (`materiaId` no corpo) |

As rotas protegidas exigem um token JWT no cabeçalho:

```http
Authorization: Bearer <token>
```

Erros são devolvidos em JSON no formato `{ "message": "...", "errors": { "campo": "..." } }`.

O WebSocket utiliza o endpoint `/ws` (o navegador conecta direto no transporte WebSocket puro do SockJS, em `/ws/websocket`, sem biblioteca). O frame STOMP `CONNECT` deve levar o cabeçalho `Authorization: Bearer <token>`, e as notificações de prazo são entregues individualmente em `/user/queue/notifications`.

## 🔒 Segurança

- Autenticação baseada em JWT.
- Senhas armazenadas com BCrypt.
- Rotas protegidas por autenticação e autorização.
- Isolamento dos dados por usuário: toda leitura, edição e exclusão confere o dono do recurso.
- Validação de entrada (Bean Validation) e links de materiais restritos a `http(s)`.
- WebSocket autenticado por JWT, com notificações enviadas apenas ao dono da tarefa.
- Configuração de CORS para o frontend.
- Segredos configuráveis por variáveis de ambiente.

**Observação:** antes de disponibilizar a aplicação em produção, configure HTTPS, banco de dados persistente, migrações, limitação de tentativas de login e testes automatizados.

## 🗺️ Roadmap

- [ ] Migração do H2 para PostgreSQL.
- [ ] Testes unitários e de integração.
- [ ] Docker Compose.
- [ ] Histórico de produtividade e estatísticas.
- [ ] Melhorias no cronograma e na experiência mobile.

## 🤝 Contribuição

Contribuições são bem-vindas!

1. Faça um fork do repositório.
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`.
3. Faça suas alterações e commits.
4. Envie um Pull Request com a descrição das mudanças.

## 📄 Licença

Este projeto está distribuído sob a licença MIT. Consulte o arquivo `LICENSE` para mais informações.

---

<p align="center">
  Desenvolvido com ☕ e 📚 para tornar a rotina de estudos mais organizada.
</p>
