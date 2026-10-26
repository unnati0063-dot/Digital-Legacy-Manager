package com.digitallegacy.repository;

import com.digitallegacy.entity.FinancialInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FinancialInfoRepository extends JpaRepository<FinancialInfo, Long> {
    List<FinancialInfo> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<FinancialInfo> findByUserIdAndFamilyMemberId(Long userId, Long familyMemberId);
    long countByUserId(Long userId);
}
