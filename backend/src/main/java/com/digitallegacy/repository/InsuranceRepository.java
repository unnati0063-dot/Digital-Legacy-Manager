package com.digitallegacy.repository;

import com.digitallegacy.entity.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
    List<Insurance> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Insurance> findByUserIdAndFamilyMemberId(Long userId, Long familyMemberId);
    List<Insurance> findByUserIdAndExpiryDateBetween(Long userId, LocalDate start, LocalDate end);
    long countByUserId(Long userId);
}
