package br.univille.doabem.aidrequest.entity;

import br.univille.doabem.item.entity.Item;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "aid_request_item")
@Getter
@Setter
@NoArgsConstructor
public class AidRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "aid_request_id", nullable = false)
    private AidRequest aidRequest;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "requested_qty", nullable = false, precision = 12, scale = 3)
    private BigDecimal requestedQty;

    // Preenchida na análise (RF28); 0 = item recusado.
    @Column(name = "approved_qty", precision = 12, scale = 3)
    private BigDecimal approvedQty;
}