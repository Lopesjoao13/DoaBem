package br.univille.doabem.auth.service;

import br.univille.doabem.auth.dto.LoginRequest;
import br.univille.doabem.auth.dto.LoginResponse;
import br.univille.doabem.user.entity.AppUser;
import br.univille.doabem.user.repository.AppUserRepository;
import br.univille.doabem.config.JwtProperties;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final AppUserRepository repository;
    private final JwtEncoder jwtEncoder;
    private final JwtProperties properties;

    public AuthService(AuthenticationManager authenticationManager,
                       AppUserRepository repository,
                       JwtEncoder jwtEncoder,
                       JwtProperties properties) {
        this.authenticationManager = authenticationManager;
        this.repository = repository;
        this.jwtEncoder = jwtEncoder;
        this.properties = properties;
    }

    public LoginResponse login(LoginRequest request) {
        // Lança AuthenticationException para senha incorreta ou usuário inativo.
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        AppUser user = repository.findByEmail(request.email()).orElseThrow();

        Duration ttl = Duration.ofMinutes(properties.expirationMinutes());
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .issuedAt(now)
                .expiresAt(now.plus(ttl))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();

        return new LoginResponse(token, "Bearer", ttl.toSeconds(), user.getName(), user.getRole().name());
    }
}
