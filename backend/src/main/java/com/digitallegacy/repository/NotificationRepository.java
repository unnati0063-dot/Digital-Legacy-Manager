package com.digitallegacy.repository;

import com.digitallegacy.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, String status);
    long countByUserIdAndStatus(Long userId, String status);
}
