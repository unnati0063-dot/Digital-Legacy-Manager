package com.digitallegacy.repository;

import com.digitallegacy.entity.DigitalAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalAccountRepository extends JpaRepository<DigitalAccount, Long> {
    List<DigitalAccount> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<DigitalAccount> findByUserIdAndAccountCategory(Long userId, String accountCategory);
    long countByUserId(Long userId);
}
