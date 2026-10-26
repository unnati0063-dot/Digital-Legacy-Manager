package com.digitallegacy.repository;

import com.digitallegacy.entity.LegacyInstruction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LegacyInstructionRepository extends JpaRepository<LegacyInstruction, Long> {
    List<LegacyInstruction> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<LegacyInstruction> findByUserIdAndCategory(Long userId, String category);
    long countByUserId(Long userId);
}
