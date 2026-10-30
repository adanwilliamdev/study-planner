# 📚 Study Planner

Aplicação full-stack para organização da rotina de estudos, com autenticação JWT, gerenciamento de matérias e tarefas, cronograma semanal, timer Pomodoro e notificações em tempo real via WebSocket.

![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-brightgreen?style=flat-square&logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-purple?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Funcionalidades

- **Autenticação:** cadastro, login e autorização com JWT e senhas criptografadas com BCrypt.
- **Matérias:** cadastro, edição, exclusão, cores personalizadas e carga horária.
- **Tarefas:** gerenciamento de atividades, prioridades, prazos e status.
- **Cronograma semanal:** organização das sessões de estudo por dia e horário.
- **Pomodoro:** ciclos de 25 minutos de foco e 5 minutos de descanso; cada foco concluído é salvo no histórico (com matéria opcional).
- **Estatísticas:** foco por dia e por matéria (7 ou 30 dias), sequência de dias, tarefas concluídas e cumprimento do cronograma da semana.
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
| Frontend | React 18, JavaScript, Vite 5 |
| Estilização | Tailwind CSS 3 |
| Requisições HTTP | Axios |
| Build | Maven, npm |

## 🏗️ Arquitetura

A aplicação utiliza uma arquitetura em camadas, separando as responsabilidades do backend.

```text
Frontend (React + Vite)
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
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   └── package.json
│
└── README.md
```

## 🚀 Instalação e Execução

### Pré-requisitos

- JDK 17 ou superior
- Maven 3.9+
- Node.js 18+
- npm 9+
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

```bash
cd frontend
npm install
npm run dev
```

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

No frontend, `VITE_API_URL` e `VITE_WS_URL` (veja `frontend/.env.example`) permitem apontar para outro backend.

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
| PUT | `/api/cronogramas/{id}/concluir` | Marca a sessão como concluída (volta a pendente na semana seguinte) |
| PUT | `/api/cronogramas/{id}/reabrir` | Desmarca a sessão concluída |
| POST | `/api/foco` | Registra um ciclo de foco (`minutos` 1–180, `materiaId` opcional) |
| GET | `/api/estatisticas?dias=7` | Resumo de produtividade (`dias` de 1 a 90) |
| GET | `/actuator/health` | Health check (público) |
| GET | `/api/materiais/materia/{materiaId}` | Materiais de uma matéria |
| POST | `/api/materiais` | Cadastro de material (`materiaId` no corpo) |

As rotas protegidas exigem um token JWT no cabeçalho:

```http
Authorization: Bearer <token>
```

Erros são devolvidos em JSON no formato `{ "message": "...", "errors": { "campo": "..." } }`.

O WebSocket utiliza o endpoint `/ws`. O frame STOMP `CONNECT` deve levar o cabeçalho `Authorization: Bearer <token>`, e as notificações de prazo são entregues individualmente em `/user/queue/notifications`.

## 🔒 Segurança

- Autenticação baseada em JWT.
- Senhas armazenadas com BCrypt.
- Rotas protegidas por autenticação e autorização.
- Isolamento dos dados por usuário: toda leitura, edição e exclusão confere o dono do recurso.
- Validação de entrada (Bean Validation) e links de materiais restritos a `http(s)`.
- WebSocket autenticado por JWT, com notificações enviadas apenas ao dono da tarefa.
- Configuração de CORS para o frontend.
- Segredos configuráveis por variáveis de ambiente.
- Limite de tentativas de login: 5 falhas por IP + e-mail bloqueiam o login por 15 minutos (HTTP 429). O estado fica em memória; com várias instâncias do backend, use um armazenamento compartilhado (ex.: Redis).
- No perfil `prod` o `JWT_SECRET` é obrigatório (a aplicação não sobe sem ele) e o Swagger fica desligado.

**Observação:** antes de disponibilizar a aplicação na internet, coloque-a atrás de HTTPS (proxy reverso ou provedor).

## 🐳 Docker e produção

```bash
cp .env.example .env      # defina DB_PASSWORD e JWT_SECRET (openssl rand -base64 48)
docker compose up --build # app em http://localhost:3000
```

O Compose sobe PostgreSQL, backend (perfil `prod`, esquema criado pelas migrações Flyway em `backend/src/main/resources/db/migration`) e frontend (nginx servindo o build e encaminhando `/api` e `/ws` ao backend). Em desenvolvimento nada muda: o H2 em memória continua sendo o padrão.

Ao alterar uma entidade JPA, crie uma nova migração `V2__...sql`: o perfil `prod` usa `ddl-auto=validate` e não sobe se o esquema divergir.

## 🧪 Testes

```bash
cd backend && mvn verify
```

Cobrem o cálculo das estatísticas, o limitador de login e fluxos da API de ponta a ponta (autenticação, isolamento entre usuários, foco/estatísticas, conflito de horários no cronograma). A integração contínua (`.github/workflows/ci.yml`) roda os testes do backend e o build do frontend a cada push e pull request.

## 🗺️ Roadmap

- [x] Migração do H2 para PostgreSQL (perfil `prod` + Flyway).
- [x] Testes unitários e de integração.
- [x] Docker Compose.
- [x] Histórico de produtividade e estatísticas.
- [x] Melhorias no cronograma (conflito de horários, reabrir sessão, reinício semanal).
- [ ] Testes do frontend (Vitest + Testing Library) e E2E.
- [ ] Refresh token / logout com revogação.
- [ ] Metas semanais de estudo e lembretes de sessões do cronograma.

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
