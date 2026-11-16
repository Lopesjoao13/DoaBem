package br.univille.doabem.aidrequest.repository;

import br.univille.doabem.aidrequest.entity.AidRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface AidRequestItemRepository extends JpaRepository<AidRequestItem, Long> {

    // Linhas por solicitação, em uma consulta só (evita N+1 nas listas): [requestId, count].
    @Query("select i.aidRequest.id, count(i) from AidRequestItem i where i.aidRequest.id in :ids group by i.aidRequest.id")
    List<Object[]> countByRequestIds(@Param("ids") Collection<Long> ids);
}
