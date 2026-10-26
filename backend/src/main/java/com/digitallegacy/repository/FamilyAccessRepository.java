package com.digitallegacy.repository;

import com.digitallegacy.entity.FamilyAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamilyAccessRepository extends JpaRepository<FamilyAccess, Long> {
    List<FamilyAccess> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);
    List<FamilyAccess> findByGranteeEmailOrderByCreatedAtDesc(String granteeEmail);
    List<FamilyAccess> findByOwnerIdAndGranteeEmail(Long ownerId, String granteeEmail);
    Optional<FamilyAccess> findByInvitationToken(String token);
    long countByOwnerIdAndInvitationStatus(Long ownerId, String status);
}
