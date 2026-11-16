package br.univille.doabem.beneficiary;

import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.entity.Role;
import br.univille.doabem.user.repository.AppUserRepository;
import br.univille.doabem.beneficiary.repository.BeneficiaryRepository;
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

import java.util.HashMap;
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
class BeneficiaryControllerTests {

    private static final String PASSWORD = "Senha@123";

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private AppUserRepository userRepository;
    @Autowired
    private BeneficiaryRepository beneficiaryRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private DatabaseCleaner cleaner;

    private String operatorToken;
    private String coordinatorToken;

    @BeforeEach
    void setUp() throws Exception {
        cleaner.clean();
        saveUser("Coord", "coord@test.local", Role.COORDINATOR);
        saveUser("Oper", "oper@test.local", Role.OPERATOR);
        coordinatorToken = login("coord@test.local");
        operatorToken = login("oper@test.local");
    }

    private void saveUser(String name, String email, Role role) {
        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole(role);
        userRepository.save(user);
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

    private Map<String, Object> family(String name, Object householdSize) {
        Map<String, Object> body = new HashMap<>();
        body.put("responsibleName", name);
        body.put("householdSize", householdSize);
        body.put("neighborhood", "Centro");
        return body;
    }

    private ResultActions create(String token, Map<String, Object> body) throws Exception {
        return mockMvc.perform(post("/api/beneficiaries")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json(body)));
    }

    private long createAndGetId(String token, String name) throws Exception {
        String response = create(token, family(name, 4)).andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    @Test
    void operadorCadastraFamiliaAtivaPorPadrao() throws Exception {
        create(operatorToken, family("  Ana Souza ", 4))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.responsibleName").value("Ana Souza"))
                .andExpect(jsonPath("$.householdSize").value(4))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.phone").doesNotExist());
    }

    @Test
    void coordenadorTambemCadastraFamilia() throws Exception {
        create(coordinatorToken, family("Bruno Lima", 2)).andExpect(status().isCreated());
    }

    @Test
    void dadosInvalidosRetornam400() throws Exception {
        create(operatorToken, family("", 3)).andExpect(status().isBadRequest());
        create(operatorToken, family("Carla", 0)).andExpect(status().isBadRequest());
        create(operatorToken, family("Carla", null)).andExpect(status().isBadRequest());
    }

    @Test
    void semTokenRetorna401() throws Exception {
        mockMvc.perform(get("/api/beneficiaries")).andExpect(status().isUnauthorized());
    }

    @Test
    void listaComBuscaPorNomeEFiltroDeSituacao() throws Exception {
        createAndGetId(operatorToken, "Ana Souza");
        long bruno = createAndGetId(operatorToken, "Bruno Lima");

        mockMvc.perform(patch("/api/beneficiaries/" + bruno + "/status")
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "INACTIVE"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("INACTIVE"));

        mockMvc.perform(get("/api/beneficiaries").header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2));

        mockMvc.perform(get("/api/beneficiaries?search=ana").header("Authorization", "Bearer " + operatorToken))
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].responsibleName").value("Ana Souza"));

        mockMvc.perform(get("/api/beneficiaries?status=INACTIVE").header("Authorization", "Bearer " + operatorToken))
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].responsibleName").value("Bruno Lima"));
    }

    @Test
    void buscaEAtualizaPorId() throws Exception {
        long id = createAndGetId(operatorToken, "Ana Souza");

        mockMvc.perform(put("/api/beneficiaries/" + id)
                        .header("Authorization", "Bearer " + operatorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(family("Ana Souza Lima", 5))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.responsibleName").value("Ana Souza Lima"))
                .andExpect(jsonPath("$.householdSize").value(5));

        mockMvc.perform(get("/api/beneficiaries/" + id).header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.responsibleName").value("Ana Souza Lima"));

        mockMvc.perform(get("/api/beneficiaries/999999").header("Authorization", "Bearer " + operatorToken))
                .andExpect(status().isNotFound());
    }
}
