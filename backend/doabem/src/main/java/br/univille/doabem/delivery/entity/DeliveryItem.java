package br.univille.doabem.delivery.entity;

import br.univille.doabem.aidrequest.entity.AidRequestItem;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "delivery_item")
@Getter
@Setter
@NoArgsConstructor
public class DeliveryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "delivery_id", nullable = false)
    private Delivery delivery;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aid_request_item_id", nullable = false)
    private AidRequestItem aidRequestItem;

    @Column(name = "delivered_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal deliveredQty;
}