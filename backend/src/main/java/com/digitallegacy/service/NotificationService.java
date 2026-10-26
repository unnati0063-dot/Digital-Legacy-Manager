package com.digitallegacy.service;

import com.digitallegacy.entity.Document;
import com.digitallegacy.entity.Insurance;
import com.digitallegacy.entity.Notification;
import com.digitallegacy.entity.User;
import com.digitallegacy.repository.DocumentRepository;
import com.digitallegacy.repository.InsuranceRepository;
import com.digitallegacy.repository.NotificationRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private InsuranceRepository insuranceRepository;

    @Autowired
    private UserRepository userRepository;

    public void createNotification(User user, String title, String message, String type, String entityType, Long entityId) {
        Notification notification = new Notification(user, title, message, type, entityType, entityId);
        notificationRepository.save(notification);
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndStatus(userId, "UNREAD");
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setStatus("READ");
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "UNREAD");
        for (Notification n : unread) {
            n.setStatus("READ");
        }
        notificationRepository.saveAll(unread);
    }

    // Run daily at midnight or on-demand
    @Scheduled(cron = "0 0 0 * * ?")
    public void checkDocumentAndInsuranceExpiries() {
        LocalDate today = LocalDate.now();
        LocalDate in60Days = today.plusDays(60);

        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            // Check documents
            List<Document> docs = documentRepository.findByUserId(user.getId());
            for (Document doc : docs) {
                if (doc.getExpiryDate() != null) {
                    long days = ChronoUnit.DAYS.between(today, doc.getExpiryDate());
                    if (days < 0) {
                        createNotification(user, "Document Expired: " + doc.getDocumentName(),
                                "Your " + doc.getDocumentType() + " (" + doc.getDocumentName() + ") expired on " + doc.getExpiryDate() + ". Please update or renew it.",
                                "EXPIRED", "DOCUMENT", doc.getId());
                    } else if (days <= 30) {
                        createNotification(user, "Document Expiring Soon: " + doc.getDocumentName(),
                                "Your " + doc.getDocumentType() + " (" + doc.getDocumentName() + ") will expire in " + days + " days (on " + doc.getExpiryDate() + ").",
                                "EXPIRING_SOON", "DOCUMENT", doc.getId());
                    }
                }
            }

            // Check insurance
            List<Insurance> policies = insuranceRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            for (Insurance policy : policies) {
                if (policy.getExpiryDate() != null) {
                    long days = ChronoUnit.DAYS.between(today, policy.getExpiryDate());
                    if (days < 0) {
                        createNotification(user, "Insurance Policy Expired",
                                "Policy #" + policy.getPolicyNumber() + " with " + policy.getInsuranceProvider() + " has expired.",
                                "EXPIRED", "INSURANCE", policy.getId());
                    } else if (days <= 30) {
                        createNotification(user, "Insurance Policy Expiring Soon",
                                "Policy #" + policy.getPolicyNumber() + " with " + policy.getInsuranceProvider() + " expires in " + days + " days.",
                                "EXPIRING_SOON", "INSURANCE", policy.getId());
                    }
                }
            }
        }
    }
}
