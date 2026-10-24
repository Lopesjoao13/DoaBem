package br.univille.doabem.user.service;

import br.univille.doabem.user.dto.CreateUserRequest;
import br.univille.doabem.user.dto.UpdateUserRequest;
import br.univille.doabem.user.dto.UserResponse;
import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.repository.AppUserRepository;
import br.univille.doabem.common.error.BusinessRuleException;
import br.univille.doabem.common.error.ConflictException;
import br.univille.doabem.common.error.NotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class UserService {

    private final AppUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    public UserService(AppUserRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse create(CreateUserRequest request) {
        String email = normalizeEmail(request.email());
        if (repository.existsByEmail(email)) {
            throw new ConflictException("Já existe um usuário com este e-mail.");
        }

        AppUser user = new AppUser();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        return UserResponse.from(repository.save(user));
    }

    @Transactional(readOnly = true)
    public Page<UserResponse> list(Pageable pageable) {
        return repository.findAll(pageable).map(UserResponse::from);
    }

    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return UserResponse.from(find(id));
    }

    @Transactional
    public UserResponse update(Long id, UpdateUserRequest request, String currentEmail) {
        AppUser user = find(id);
        String email = normalizeEmail(request.email());

        if (repository.existsByEmailAndIdNot(email, id)) {
            throw new ConflictException("Já existe um usuário com este e-mail.");
        }
        // Sem autoatribuição de perfil: o Coordenador não altera o próprio perfil.
        if (isSelf(user, currentEmail) && request.role() != user.getRole()) {
            throw new BusinessRuleException("Você não pode alterar o seu próprio perfil.");
        }

        user.setName(request.name().trim());
        user.setEmail(email);
        user.setRole(request.role());
        return UserResponse.from(user);
    }

    @Transactional
    public UserResponse setActive(Long id, boolean active, String currentEmail) {
        AppUser user = find(id);

        if (!active && isSelf(user, currentEmail)) {
            throw new BusinessRuleException("Você não pode desativar o seu próprio usuário.");
        }

        user.setActive(active);
        return UserResponse.from(user);
    }

    private AppUser find(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    }

    private boolean isSelf(AppUser user, String currentEmail) {
        return user.getEmail().equalsIgnoreCase(currentEmail);
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
