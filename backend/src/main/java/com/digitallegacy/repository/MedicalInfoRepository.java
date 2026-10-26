package com.digitallegacy.repository;

import com.digitallegacy.entity.MedicalInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicalInfoRepository extends JpaRepository<MedicalInfo, Long> {
    List<MedicalInfo> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<MedicalInfo> findByUserIdAndFamilyMemberId(Long userId, Long familyMemberId);
    long countByUserId(Long userId);
}
