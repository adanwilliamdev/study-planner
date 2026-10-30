# 📚 Study Planner

Planejador de estudos **100% Java**: matérias, tarefas com prazo (lista e quadro), cronograma semanal,
Pomodoro com histórico de foco e notificações em tempo real. Backend e interface em Java com
**Spring Boot + Vaadin Flow**. Não existe JavaScript escrito à mão no projeto; o Vaadin gera os ativos do navegador no build.

## Funcionalidades

- **Painel** com tarefas abertas, vencimentos de hoje, atrasos, foco do dia, progresso por matéria, próximos prazos, sessões de hoje e gráfico de foco dos últimos 7 dias.
- **Matérias** com cor, carga horária e materiais de estudo (links, PDFs e resumos).
- **Tarefas** em **lista** e **quadro** (arraste entre *A fazer / Em andamento / Concluída*), com busca e filtros por status e matéria.
- **Cronograma** semanal com sessões recorrentes, **detecção de conflito de horário** e reinício automático toda segunda-feira.
- **Pomodoro** no menu lateral (continua rodando enquanto você navega). Cada foco concluído é gravado e alimenta as estatísticas.
- **Notificações** de prazo (hoje/amanhã) **persistidas no banco** e entregues em tempo real por *server push*; quem estava offline vê tudo ao entrar.
- Tema claro/escuro salvo por usuário, cadastro/login por sessão e bloqueio após 5 senhas erradas.

## Stack

| Camada | Tecnologia |
|---|---|
| Interface | Vaadin Flow 24 (componentes em Java), server push, tema em CSS |
| Backend | Spring Boot 3.2, Spring Security (sessão + CSRF), Spring Data JPA, Bean Validation |
| Banco | PostgreSQL 16 + Flyway (migrações versionadas) |
| Testes | JUnit 5, Mockito, `@DataJpaTest` com H2 em modo PostgreSQL |
| Infra | Docker, Docker Compose, GitHub Actions |

## Como rodar

Requisitos: **JDK 17+**, Maven e Docker. Na primeira execução o Vaadin baixa o Node.js sozinho (usado só na build do frontend).

```bash
docker compose up -d db      # PostgreSQL local
mvn spring-boot:run          # http://localhost:8080
```

Crie uma conta em **/cadastro** e entre.

### Tudo em containers

```bash
docker compose up -d --build   # app + banco; http://localhost:8080
```

### Configuração (variáveis de ambiente)

| Variável | Padrão | Uso |
|---|---|---|
| `SPRING_PROFILES_ACTIVE` | `dev` (local) / `prod` (Docker) | Perfil ativo |
| `DB_URL`, `DB_USER`, `DB_PASSWORD` | `localhost`, `studyplanner` (só em `dev`) | Conexão com o PostgreSQL. Em `prod` não há valor padrão |
| `APP_TIMEZONE` | `America/Sao_Paulo` | Fuso usado para "hoje", prazos e agendamentos |
| `SESSION_COOKIE_SECURE` | `false` | Use `true` ao servir por HTTPS |
| `PORT` | `8080` | Porta HTTP |

## Testes

```bash
mvn verify
```

Não precisam de Docker: usam H2 em modo PostgreSQL executando as **mesmas migrações do Flyway**, e o Hibernate valida o esquema contra as entidades (`ddl-auto=validate`).

## Estrutura

```
src/main/java/com/studyplanner
├── config/       relógio (fuso), segurança
├── entity/       Usuario, Materia, Tarefa, Cronograma, MaterialEstudo, Notificacao, SessaoPomodoro
├── repository/   consultas (JPQL com fetch join, sem N+1)
├── service/      regras de negócio, alertas, estatísticas, broadcaster de push, agendadores
├── security/     UserDetailsService, bloqueio por tentativas
├── dto/          records de entrada/saída (com Bean Validation)
└── ui/           MainLayout, views (Painel, Matérias, Tarefas, Cronograma, Login, Cadastro),
                  componentes (Pomodoro, sino de notificações) e utilitários
frontend/themes/studyplanner/   tema (CSS)
src/main/resources/db/migration/ V1 esquema, V2 notificações + pomodoro + tema
```

## Decisões de projeto

- **Sem camada REST.** As views chamam os serviços diretamente; autenticação por sessão com CSRF do Spring Security, no lugar de JWT no navegador.
- **Notificações persistidas.** O agendador grava o alerta no banco (transação própria) e só depois avisa quem está conectado; nada se perde para quem estava offline.
- **Fuso explícito.** Um `Clock` único (`America/Sao_Paulo` por padrão) evita que "hoje" dependa do fuso do servidor.
- **Isolamento por usuário.** Toda consulta filtra pelo dono; matérias, tarefas, sessões e materiais de outro usuário resultam em "não encontrado".
- **Validação única.** As anotações dos DTOs são reutilizadas nos formulários (`ValidadorForm`) e mostradas em cada campo.
- **Links seguros.** Materiais do tipo link só aceitam `http(s)://`, e só esses viram âncoras.

## Roadmap

- Upload real de PDF (hoje o campo guarda o caminho/URL)
- Sessões do cronograma com recorrência quinzenal e visão de calendário mensal
- Paginação das listas (hoje carregam tudo, adequado para uso pessoal)
- Refresh/"lembrar de mim" e recuperação de senha por e-mail
- PWA para instalar no celular

## Licença

MIT
