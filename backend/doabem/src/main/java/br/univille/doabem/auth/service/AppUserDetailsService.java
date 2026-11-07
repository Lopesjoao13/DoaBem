package br.univille.doabem.auth.service;

import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.repository.AppUserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {

    private final AppUserRepository repository;

    public AppUserDetailsService(AppUserRepository repository) {
        this.repository = repository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        AppUser user = repository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado"));

        // RN28: usuário inativo não autentica (DisabledException).
        return User.withUsername(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .disabled(!user.isActive())
                .build();
    }
}
