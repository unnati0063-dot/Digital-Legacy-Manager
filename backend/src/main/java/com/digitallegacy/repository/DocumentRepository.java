package com.digitallegacy.repository;

import com.digitallegacy.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByUserId(Long userId);

    List<Document> findByUserIdOrderByUploadDateDesc(Long userId);

    List<Document> findByUserIdAndCategoryOrderByUploadDateDesc(Long userId, String category);

    List<Document> findByUserIdAndFamilyMemberIdOrderByUploadDateDesc(Long userId, Long familyMemberId);

    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND " +
           "(LOWER(d.documentName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.documentType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.documentNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.ownerName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.issuingAuthority) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Document> searchDocuments(@Param("userId") Long userId, @Param("query") String query);

    @Query("SELECT d FROM Document d WHERE d.user.id = :userId AND d.category = :category AND " +
           "(:ownerName IS NULL OR LOWER(d.ownerName) LIKE LOWER(CONCAT('%', :ownerName, '%'))) AND " +
           "(:docType IS NULL OR LOWER(d.documentType) = LOWER(:docType))")
    List<Document> filterDocuments(@Param("userId") Long userId, 
                                   @Param("category") String category, 
                                   @Param("ownerName") String ownerName, 
                                   @Param("docType") String docType);

    List<Document> findByUserIdAndExpiryDateBetween(Long userId, LocalDate start, LocalDate end);

    List<Document> findByUserIdAndExpiryDateBefore(Long userId, LocalDate date);

    long countByUserId(Long userId);

    long countByUserIdAndExpiryDateBefore(Long userId, LocalDate date);

    long countByUserIdAndExpiryDateBetween(Long userId, LocalDate start, LocalDate end);
}
