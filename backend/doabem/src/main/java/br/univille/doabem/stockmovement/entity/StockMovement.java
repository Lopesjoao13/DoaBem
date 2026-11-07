package br.univille.doabem.stockmovement.entity;

import br.univille.doabem.donationentry.entity.DonationEntryItem;
import br.univille.doabem.item.entity.Item;
import br.univille.doabem.user.entity.AppUser;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// RN07: movimentação é imutável; correções são feitas por estorno (REVERSAL).
// As ligações com item de solicitação e item de entrega entram quando essas entidades existirem.
@Entity
@Immutable
@Table(name = "stock_movement")
@Getter
@Setter
@NoArgsConstructor
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private MovementType type;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private LocalDateTime occurredAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_entry_item_id", unique = true)
    private DonationEntryItem donationEntryItem;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reverses_id", unique = true)
    private StockMovement reverses;

    @Enumerated(EnumType.STRING)
    @Column(name = "adjustment_reason", length = 10)
    private AdjustmentReason adjustmentReason;

    @Column(length = 300)
    private String reason;

    @PrePersist
    void onCreate() {
        if (this.occurredAt == null) {
            this.occurredAt = LocalDateTime.now();
        }
    }
}
