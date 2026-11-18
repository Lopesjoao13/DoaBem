package br.univille.doabem.aidrequest.dto;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.aidrequest.entity.AidRequestStatus;

public record RequestActionResponse(Long id, AidRequestStatus status) {

    public static RequestActionResponse of(AidRequest request) {
        return new RequestActionResponse(request.getId(), request.getStatus());
    }
}
