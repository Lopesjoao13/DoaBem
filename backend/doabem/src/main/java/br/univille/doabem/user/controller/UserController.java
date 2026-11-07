package br.univille.doabem.user.controller;

import br.univille.doabem.user.dto.CreateUserRequest;
import br.univille.doabem.user.dto.UpdateUserRequest;
import br.univille.doabem.user.dto.UpdateUserStatusRequest;
import br.univille.doabem.user.dto.UserResponse;
import br.univille.doabem.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

// RF05: gestão de usuários exclusiva do Coordenador (o Operador recebe 403).
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('COORDINATOR')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @GetMapping
    public Page<UserResponse> list(@PageableDefault(size = 20, sort = "name") Pageable pageable) {
        return userService.list(pageable);
    }

    @GetMapping("/{id}")
    public UserResponse get(@PathVariable Long id) {
        return userService.get(id);
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id,
                               @Valid @RequestBody UpdateUserRequest request,
                               @AuthenticationPrincipal Jwt jwt) {
        return userService.update(id, request, jwt.getSubject());
    }

    @PatchMapping("/{id}/status")
    public UserResponse setStatus(@PathVariable Long id,
                                  @Valid @RequestBody UpdateUserStatusRequest request,
                                  @AuthenticationPrincipal Jwt jwt) {
        return userService.setActive(id, request.active(), jwt.getSubject());
    }
}
