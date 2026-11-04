package br.univille.doabem.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String name,
        String role
) {
}
