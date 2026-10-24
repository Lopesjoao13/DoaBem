package br.univille.doabem.beneficiary.repository;

import br.univille.doabem.beneficiary.entity.Beneficiary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long>, JpaSpecificationExecutor<Beneficiary> {
}
