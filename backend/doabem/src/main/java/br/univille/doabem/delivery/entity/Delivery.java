package br.univille.doabem.delivery.entity;

import br.univille.doabem.aidrequest.entity.AidRequest;
import br.univille.doabem.user.entity.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "delivery")
@Getter
@Setter
@NoArgsConstructor
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aid_request_id", nullable = false, unique = true)
    private AidRequest aidRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "delivered_by_id", nullable = false)
    private AppUser deliveredBy;

    @Column(name = "delivered_at", nullable = false, updatable = false)
    private LocalDateTime deliveredAt;

    @Column(length = 300)
    private String notes;

    @OneToMany(mappedBy = "delivery", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<DeliveryItem> items = new ArrayList<>();

    @PrePersist
    void onCreate() {
        if (this.deliveredAt == null) {
            this.deliveredAt = LocalDateTime.now();
        }
    }

    public void addItem(DeliveryItem item) {
        item.setDelivery(this);
        items.add(item);
    }
}