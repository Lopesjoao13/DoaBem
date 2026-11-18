package br.univille.doabem.config;

import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.entity.Role;
import br.univille.doabem.user.repository.AppUserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// RF06: usuários de demonstração. Ligado no perfil dev e, no docker compose, por DOABEM_SEED_DEMO_USERS=true.
// Credenciais fictícias: não ligar em produção real.
@Component
@ConditionalOnProperty(name = "doabem.seed-demo-users", havingValue = "true")
public class DevDataInitializer implements CommandLineRunner {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public DevDataInitializer(AppUserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        create("Coordenador Demo", "coordenador@doabem.local", Role.COORDINATOR);
        create("Operador Demo", "operador@doabem.local", Role.OPERATOR);
    }

    private void create(String name, String email, Role role) {
        if (repository.findByEmail(email).isPresent()) {
            return;
        }
        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode("Doabem@123"));
        user.setRole(role);
        repository.save(user);
    }
}
