package com.studyplanner.api;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Testes de ponta a ponta da API (H2 em memoria, seguranca real). */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class FluxoApiTest {

    private static final String SENHA = "senha123";

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;

    private String novoEmail() { return "user-" + UUID.randomUUID() + "@teste.com"; }

    private RequestPostProcessor ip(String ip) {
        return req -> { req.setRemoteAddr(ip); return req; };
    }

    private String corpo(Object... paresChaveValor) throws Exception {
        var no = json.createObjectNode();
        for (int i = 0; i < paresChaveValor.length; i += 2) {
            no.putPOJO((String) paresChaveValor[i], paresChaveValor[i + 1]);
        }
        return json.writeValueAsString(no);
    }

    /** Cadastra e autentica; devolve o token JWT. */
    private String criarUsuarioELogar(String email) throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                .content(corpo("nome", "Teste", "email", email, "senha", SENHA)))
                .andExpect(status().isCreated());
        String resposta = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("email", email, "senha", SENHA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(resposta).get("token").asText();
    }

    private long criarMateria(String token, String nome) throws Exception {
        String resposta = mvc.perform(post("/api/materias").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON).content(corpo("nome", nome)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(resposta).get("id").asLong();
    }

    @Test
    void rotasProtegidasExigemToken() throws Exception {
        mvc.perform(get("/api/tarefas")).andExpect(status().isUnauthorized());
        String token = criarUsuarioELogar(novoEmail());
        mvc.perform(get("/api/tarefas").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void usuarioNaoAcessaDadosDeOutro() throws Exception {
        String tokenA = criarUsuarioELogar(novoEmail());
        String tokenB = criarUsuarioELogar(novoEmail());
        long materiaDeA = criarMateria(tokenA, "Física");

        mvc.perform(put("/api/materias/" + materiaDeA).header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON).content(corpo("nome", "Invadida")))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/materias/" + materiaDeA).header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isNotFound());
        mvc.perform(get("/api/materias").header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void focoAlimentaAsEstatisticasEExclusaoDeMateriaPreservaHistorico() throws Exception {
        String token = criarUsuarioELogar(novoEmail());
        long materia = criarMateria(token, "Química");
        String auth = "Bearer " + token;

        mvc.perform(post("/api/foco").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("minutos", 25, "materiaId", materia)))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/foco").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("minutos", 0)))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/estatisticas?dias=7").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.focoHojeMin").value(25))
                .andExpect(jsonPath("$.sequenciaDias").value(1))
                .andExpect(jsonPath("$.porMateria[0].nome").value("Química"));

        mvc.perform(delete("/api/materias/" + materia).header("Authorization", auth))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/estatisticas").header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.focoPeriodoMin").value(25))
                .andExpect(jsonPath("$.porMateria[0].nome").value("Sem matéria"));
    }

    @Test
    void tarefaConcluidaContaNasEstatisticas() throws Exception {
        String auth = "Bearer " + criarUsuarioELogar(novoEmail());
        mvc.perform(post("/api/tarefas").header("Authorization", auth).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("titulo", "Ler capítulo", "status", "CONCLUIDO")))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/estatisticas").header("Authorization", auth))
                .andExpect(jsonPath("$.tarefasConcluidasPeriodo").value(1))
                .andExpect(jsonPath("$.tarefasAbertas").value(0));
    }

    @Test
    void cronogramaRejeitaHorariosSobrepostos() throws Exception {
        String auth = "Bearer " + criarUsuarioELogar(novoEmail());
        String tokenSemBearer = auth.substring(7);
        long materia = criarMateria(tokenSemBearer, "História");
        String sessao = corpo("materiaId", materia, "diaDaSemana", "MONDAY",
                "horarioInicio", "08:00", "horarioFim", "09:00");
        String sobreposta = corpo("materiaId", materia, "diaDaSemana", "MONDAY",
                "horarioInicio", "08:30", "horarioFim", "09:30");
        String vizinha = corpo("materiaId", materia, "diaDaSemana", "MONDAY",
                "horarioInicio", "09:00", "horarioFim", "10:00");

        mvc.perform(post("/api/cronogramas").header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON).content(sessao)).andExpect(status().isCreated());
        mvc.perform(post("/api/cronogramas").header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON).content(sobreposta)).andExpect(status().isConflict());
        mvc.perform(post("/api/cronogramas").header("Authorization", auth)
                .contentType(MediaType.APPLICATION_JSON).content(vizinha)).andExpect(status().isCreated());
    }

    @Test
    void loginBloqueadoAposVariasFalhas() throws Exception {
        String email = novoEmail();
        criarUsuarioELogar(email);
        String errado = corpo("email", email, "senha", "senha-errada");

        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/login").with(ip("10.9.9.9"))
                    .contentType(MediaType.APPLICATION_JSON).content(errado)).andExpect(status().isUnauthorized());
        }
        mvc.perform(post("/api/auth/login").with(ip("10.9.9.9"))
                .contentType(MediaType.APPLICATION_JSON).content(errado)).andExpect(status().isTooManyRequests());

        // mesmo com a senha certa, a chave (IP + e-mail) segue bloqueada; outro IP nao e afetado
        mvc.perform(post("/api/auth/login").with(ip("10.9.9.9"))
                .contentType(MediaType.APPLICATION_JSON).content(corpo("email", email, "senha", SENHA)))
                .andExpect(status().isTooManyRequests());
        mvc.perform(post("/api/auth/login").with(ip("10.8.8.8"))
                .contentType(MediaType.APPLICATION_JSON).content(corpo("email", email, "senha", SENHA)))
                .andExpect(status().isOk());
    }

    @Test
    void healthCheckEPublico() throws Exception {
        mvc.perform(get("/actuator/health")).andExpect(status().isOk());
    }
}
