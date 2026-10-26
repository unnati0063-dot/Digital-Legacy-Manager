package com.digitallegacy.repository;

import com.digitallegacy.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    List<Contact> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Contact> findByUserIdAndContactType(Long userId, String contactType);

    @Query("SELECT c FROM Contact c WHERE c.user.id = :userId AND " +
           "(LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.contactType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.contactNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.relationship) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Contact> searchContacts(@Param("userId") Long userId, @Param("query") String query);

    long countByUserId(Long userId);
}
