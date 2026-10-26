package com.digitallegacy.service;

import com.digitallegacy.entity.Document;
import com.digitallegacy.payload.DashboardStatsDto;
import com.digitallegacy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private ContactRepository contactRepository;

    @Autowired
    private DigitalAccountRepository digitalAccountRepository;

    @Autowired
    private InsuranceRepository insuranceRepository;

    @Autowired
    private LegacyInstructionRepository legacyInstructionRepository;

    @Autowired
    private ImportantInfoRepository importantInfoRepository;

    @Autowired
    private FamilyAccessRepository familyAccessRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    public DashboardStatsDto getDashboardStats(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate in60Days = today.plusDays(60);

        DashboardStatsDto stats = new DashboardStatsDto();

        // Counts
        stats.setTotalDocuments(documentRepository.countByUserId(userId));
        stats.setTotalFamilyMembers(familyMemberRepository.countByUserId(userId));
        stats.setTotalAssets(assetRepository.countByUserId(userId));
        stats.setTotalContacts(contactRepository.countByUserId(userId));
        stats.setTotalDigitalAccounts(digitalAccountRepository.countByUserId(userId));
        stats.setTotalInsurancePolicies(insuranceRepository.countByUserId(userId));
        stats.setTotalLegacyInstructions(legacyInstructionRepository.countByUserId(userId));
        stats.setPendingInvitations(familyAccessRepository.countByOwnerIdAndInvitationStatus(userId, "PENDING"));

        // Expiry counts
        stats.setExpiredDocuments(documentRepository.countByUserIdAndExpiryDateBefore(userId, today));
        stats.setExpiringSoonDocuments(documentRepository.countByUserIdAndExpiryDateBetween(userId, today, in60Days));

        // Lists
        List<Document> userDocs = documentRepository.findByUserIdOrderByUploadDateDesc(userId);
        stats.setRecentDocuments(userDocs.stream().limit(5).collect(Collectors.toList()));
        stats.setRecentActivities(auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().limit(8).collect(Collectors.toList()));
        stats.setUpcomingExpiries(documentRepository.findByUserIdAndExpiryDateBetween(userId, today, in60Days).stream().limit(5).collect(Collectors.toList()));
        stats.setImportantInformation(importantInfoRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().limit(5).collect(Collectors.toList()));

        // Group documents by category
        Map<String, Long> categoryCounts = new HashMap<>();
        for (Document doc : userDocs) {
            String cat = doc.getCategory() != null ? doc.getCategory() : "OTHER";
            categoryCounts.put(cat, categoryCounts.getOrDefault(cat, 0L) + 1L);
        }
        stats.setDocumentsByCategory(categoryCounts);

        return stats;
    }
}
