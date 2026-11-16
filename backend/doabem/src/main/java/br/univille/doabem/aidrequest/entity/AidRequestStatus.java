package br.univille.doabem.aidrequest.entity;

public enum AidRequestStatus {
    PENDING, APPROVED, REJECTED, PICKED, DELIVERED, CANCELLED;

    public boolean isFinal() {
        return this == REJECTED || this == DELIVERED || this == CANCELLED;
    }

    // Solicitação "em andamento" (D-09 bloqueia inativar a família).
    public boolean isOpen() {
        return this == PENDING || this == APPROVED || this == PICKED;
    }
}