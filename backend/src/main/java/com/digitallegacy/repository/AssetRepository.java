package com.digitallegacy.repository;

import com.digitallegacy.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Asset> findByUserIdAndAssetType(Long userId, String assetType);

    @Query("SELECT a FROM Asset a WHERE a.user.id = :userId AND " +
           "(LOWER(a.assetName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.assetType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.ownerName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.location) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Asset> searchAssets(@Param("userId") Long userId, @Param("query") String query);

    long countByUserId(Long userId);
}
