package com.digitallegacy.repository;

import com.digitallegacy.entity.FamilyMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FamilyMemberRepository extends JpaRepository<FamilyMember, Long> {
    List<FamilyMember> findByUserId(Long userId);
    List<FamilyMember> findByUserIdAndFullNameContainingIgnoreCase(Long userId, String name);
    long countByUserId(Long userId);
}
