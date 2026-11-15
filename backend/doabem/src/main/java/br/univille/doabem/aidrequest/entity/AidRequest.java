package br.univille.doabem.aidrequest.entity;

import br.univille.doabem.beneficiary.entity.Beneficiary;
import br.univille.doabem.user.entity.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "aid_request")
@Getter
@Setter
@NoArgsConstructor
public class AidRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "beneficiary_id", nullable = false)
    private Beneficiary beneficiary;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by_id", nullable = false)
    private AppUser requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 9)
    private AidRequestStatus status = AidRequestStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by_id")
    private AppUser decidedBy;

    @Column(name = "decided_at")
    private LocalDateTime decidedAt;

    @Column(length = 300)
    private String justification;

    @Column(name = "picked_at")
    private LocalDateTime pickedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "picked_by_id")
    private AppUser pickedBy;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by_id")
    private AppUser cancelledBy;

    @Column(name = "cancellation_reason", length = 300)
    private String cancellationReason;

    @OneToMany(mappedBy = "aidRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<AidRequestItem> items = new ArrayList<>();

    @PrePersist
    void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public void addItem(AidRequestItem item) {
        item.setAidRequest(this);
        items.add(item);
    }

    public void removeItem(AidRequestItem item) {
        items.remove(item);
        item.setAidRequest(null);
    }
}