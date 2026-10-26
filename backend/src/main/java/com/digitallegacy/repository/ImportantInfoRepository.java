package com.digitallegacy.repository;

import com.digitallegacy.entity.ImportantInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImportantInfoRepository extends JpaRepository<ImportantInfo, Long> {
    List<ImportantInfo> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT i FROM ImportantInfo i WHERE i.user.id = :userId AND " +
           "(LOWER(i.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.category) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<ImportantInfo> searchInfo(@Param("userId") Long userId, @Param("query") String query);

    long countByUserId(Long userId);
}
