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
- **Pomodoro:** ciclos de 25 minutos de foco e 5 minutos de descanso.
- **Notificações em tempo real:** alertas de tarefas próximas do vencimento via WebSocket.
- **Materiais de estudo:** associação de PDFs, links e resumos às matérias.
- **Dashboard:** visão geral da rotina e das atividades.

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
git clone https://github.com/SEU-USUARIO/study-planner.git
cd study-planner
```

Substitua `SEU-USUARIO` pelo seu usuário do GitHub.

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

app.jwt.secret=${JWT_SECRET}
app.jwt.expiration-ms=86400000

springdoc.swagger-ui.path=/swagger-ui.html
```

Configure a variável de ambiente `JWT_SECRET` com uma chave forte antes de executar a aplicação.

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
| GET | `/api/tarefas` | Listagem de tarefas |
| POST | `/api/tarefas` | Cadastro de tarefa |
| GET | `/api/cronogramas` | Consulta do cronograma |
| POST | `/api/cronogramas` | Criação de sessão de estudo |
| GET | `/api/materiais/materia/{materiaId}` | Materiais de uma matéria |

As rotas protegidas exigem um token JWT no cabeçalho:

```http
Authorization: Bearer <token>
```

O WebSocket utiliza o endpoint `/ws` e o tópico `/topic/notifications` para comunicação de notificações.

## 🔒 Segurança

- Autenticação baseada em JWT.
- Senhas armazenadas com BCrypt.
- Rotas protegidas por autenticação e autorização.
- Isolamento dos dados por usuário.
- Configuração de CORS para o frontend.
- Segredos configuráveis por variáveis de ambiente.

**Observação:** antes de disponibilizar a aplicação em produção, configure HTTPS, banco de dados persistente, migrações, limitação de tentativas de login e testes automatizados.

## 🗺️ Roadmap

- [ ] Migração do H2 para PostgreSQL.
- [ ] Testes unitários e de integração.
- [ ] Docker Compose.
- [ ] Autorização individual das notificações WebSocket.
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
