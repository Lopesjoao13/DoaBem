package br.univille.doabem.user;

import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.entity.Role;
import br.univille.doabem.user.repository.AppUserRepository;
import br.univille.doabem.support.DatabaseCleaner;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTests {

    private static final String PASSWORD = "Senha@123";

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private AppUserRepository repository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private DatabaseCleaner cleaner;

    private String coordinatorToken;
    private String operatorToken;
    private Long coordinatorId;

    @BeforeEach
    void setUp() throws Exception {
        cleaner.clean();
        coordinatorId = save("Coord", "coord@test.local", Role.COORDINATOR).getId();
        save("Oper", "oper@test.local", Role.OPERATOR);
        coordinatorToken = login("coord@test.local");
        operatorToken = login("oper@test.local");
    }

    private AppUser save(String name, String email, Role role) {
        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole(role);
        return repository.save(user);
    }

    private String login(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", PASSWORD))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("accessToken").asText();
    }

    private String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    private ResultActions createUser(String token, String name, String email, String password, String role)
            throws Exception {
        return mockMvc.perform(post("/api/users")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(Map.of("name", name, "email", email, "password", password, "role", role))));
    }

    @Test
    void coordenadorCriaUsuarioQuePassaAConseguirAutenticar() throws Exception {
        createUser(coordinatorToken, "Maria", "Maria@Test.local", "senha-forte-1", "OPERATOR")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value("maria@test.local"))
                .andExpect(jsonPath("$.role").value("OPERATOR"))
                .andExpect(jsonPath("$.active").value(true))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.passwordHash").doesNotExist());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "maria@test.local", "password", "senha-forte-1"))))
                .andExpect(status().isOk());
    }

    @Test
    void emailDuplicadoRetorna409() throws Exception {
        createUser(coordinatorToken, "Outro", "OPER@test.local", "senha-forte-1", "OPERATOR")
                .andExpect(status().isConflict());
    }

    @Test
    void dadosInvalidosRetornam400() throws Exception {
        createUser(coordinatorToken, "Maria", "nao-e-email", "curta", "OPERATOR")
                .andExpect(status().isBadRequest());
    }

    @Test
    void operadorRecebe403EmTodasAsRotas() throws Exception {
        createUser(operatorToken, "Maria", "maria@test.local", "senha-forte-1", "OPERATOR")
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isForbidden());
        mockMvc.perform(patch("/api/users/" + coordinatorId + "/status")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("active", false))))
                .andExpect(status().isForbidden());
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/users")).andExpect(status().isUnauthorized());
    }

    @Test
    void listaEBuscaPorId() throws Exception {
        mockMvc.perform(get("/api/users").header("Authorization", "Bearer " + coordinatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2));

        mockMvc.perform(get("/api/users/" + coordinatorId).header("Authorization", "Bearer " + coordinatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("coord@test.local"));

        mockMvc.perform(get("/api/users/999999").header("Authorization", "Bearer " + coordinatorToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void coordenadorAtualizaOutroUsuario() throws Exception {
        Long operatorId = repository.findByEmail("oper@test.local").orElseThrow().getId();

        mockMvc.perform(put("/api/users/" + operatorId)
                        .header("Authorization", "Bearer " + coordinatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("name", "Oper Novo", "email", "oper@test.local", "role", "COORDINATOR"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Oper Novo"))
                .andExpect(jsonPath("$.role").value("COORDINATOR"));
    }

    @Test
    void coordenadorNaoAlteraOProprioPerfil() throws Exception {
        mockMvc.perform(put("/api/users/" + coordinatorId)
                        .header("Authorization", "Bearer " + coordinatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("name", "Coord", "email", "coord@test.local", "role", "OPERATOR"))))
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void desativarUsuarioImpedeLoginEReativarRestaura() throws Exception {
        Long operatorId = repository.findByEmail("oper@test.local").orElseThrow().getId();

        mockMvc.perform(patch("/api/users/" + operatorId + "/status")
                        .header("Authorization", "Bearer " + coordinatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("active", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", "oper@test.local", "password", PASSWORD))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(patch("/api/users/" + operatorId + "/status")
                        .header("Authorization", "Bearer " + coordinatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("active", true))))
                .andExpect(status().isOk());

        login("oper@test.local");
    }

    @Test
    void coordenadorNaoDesativaASiMesmo() throws Exception {
        mockMvc.perform(patch("/api/users/" + coordinatorId + "/status")
                        .header("Authorization", "Bearer " + coordinatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("active", false))))
                .andExpect(status().isUnprocessableEntity());
    }
}
