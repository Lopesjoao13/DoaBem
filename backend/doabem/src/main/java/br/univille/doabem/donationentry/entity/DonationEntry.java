package br.univille.doabem.donationentry.entity;

import br.univille.doabem.user.entity.AppUser;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "donation_entry")
@Getter
@Setter
@NoArgsConstructor
public class DonationEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(length = 160)
    private String source;

    @Column(nullable = false)
    private boolean anonymous = false;

    @Column(length = 300)
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @NotEmpty
    @OrderBy("id ASC")
    @OneToMany(
            mappedBy = "donationEntry",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DonationEntryItem> items = new ArrayList<>();

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();

        if (this.entryDate == null) {
            this.entryDate = LocalDate.now();
        }
    }

    public void addItem(DonationEntryItem item) {
        items.add(item);
        item.setDonationEntry(this);
    }

    public void removeItem(DonationEntryItem item) {
        items.remove(item);
        item.setDonationEntry(null);
    }
}
