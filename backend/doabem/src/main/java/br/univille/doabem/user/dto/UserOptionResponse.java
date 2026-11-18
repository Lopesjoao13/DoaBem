package br.univille.doabem.user.dto;

import br.univille.doabem.user.entity.AppUser;

// Só o necessário para preencher filtros (ex.: "registrado por"): sem e-mail, perfil ou situação.
public record UserOptionResponse(Long id, String name) {

    public static UserOptionResponse from(AppUser user) {
        return new UserOptionResponse(user.getId(), user.getName());
    }
}
