package br.univille.doabem.registry.dto;

import java.time.LocalDateTime;

public record FamilyResponseDTO(
        Long id,
        String representativeName,
        String cpf,
        String phone,
        String address,
        String meighborhood,
        Integer dependentsCount,
        Boolean active,
        LocalDateTime createdAt
) {}