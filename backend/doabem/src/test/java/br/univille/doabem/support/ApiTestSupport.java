package br.univille.doabem.support;

import br.univille.doabem.category.entity.Category;
import br.univille.doabem.category.repository.CategoryRepository;
import br.univille.doabem.common.Status;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.item.entity.UnitOfMeasure;
import br.univille.doabem.item.repository.ItemRepository;
import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.entity.Role;
import br.univille.doabem.user.repository.AppUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.math.BigDecimal;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

// Base dos testes de API: banco limpo a cada teste, um Coordenador e um Operador já autenticados.
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class ApiTestSupport {

    protected static final String PASSWORD = "Senha@123";

    @Autowired
    protected MockMvc mockMvc;
    @Autowired
    protected ObjectMapper objectMapper;
    @Autowired
    protected DatabaseCleaner cleaner;
    @Autowired
    protected AppUserRepository userRepository;
    @Autowired
    protected CategoryRepository categoryRepository;
    @Autowired
    protected ItemRepository itemRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    protected String coordinatorToken;
    protected String operatorToken;

    @BeforeEach
    void setUpBase() throws Exception {
        cleaner.clean();
        saveUser("Coord", "coord@test.local", Role.COORDINATOR);
        saveUser("Oper", "oper@test.local", Role.OPERATOR);
        coordinatorToken = login("coord@test.local");
        operatorToken = login("oper@test.local");
    }

    protected AppUser saveUser(String name, String email, Role role) {
        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(PASSWORD));
        user.setRole(role);
        return userRepository.save(user);
    }

    protected Category saveCategory(String name, boolean active) {
        Category category = new Category();
        category.setName(name);
        category.setActive(active);
        return categoryRepository.save(category);
    }

    protected Item saveItem(Category category, String name, UnitOfMeasure unit, Status status) {
        Item item = new Item();
        item.setCategory(category);
        item.setName(name);
        item.setUnitOfMeasure(unit);
        item.setMinStock(BigDecimal.ZERO);
        item.setStatus(status);
        return itemRepository.save(item);
    }

    protected String login(String email) throws Exception {
        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", PASSWORD))))
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("accessToken").asText();
    }

    protected String json(Object body) throws Exception {
        return objectMapper.writeValueAsString(body);
    }

    protected ResultActions doGet(String url, String token) throws Exception {
        return mockMvc.perform(authorized(get(url), token));
    }

    protected ResultActions doPost(String url, String token, Object body) throws Exception {
        return mockMvc.perform(authorized(post(url), token).contentType(MediaType.APPLICATION_JSON).content(json(body)));
    }

    protected ResultActions doPut(String url, String token, Object body) throws Exception {
        return mockMvc.perform(authorized(put(url), token).contentType(MediaType.APPLICATION_JSON).content(json(body)));
    }

    protected ResultActions doPatch(String url, String token, Object body) throws Exception {
        return mockMvc.perform(authorized(patch(url), token).contentType(MediaType.APPLICATION_JSON).content(json(body)));
    }

    private MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder builder, String token) {
        return token == null ? builder : builder.header("Authorization", "Bearer " + token);
    }

    protected long idOf(ResultActions result) throws Exception {
        return objectMapper.readTree(result.andReturn().getResponse().getContentAsString()).get("id").asLong();
    }
}
