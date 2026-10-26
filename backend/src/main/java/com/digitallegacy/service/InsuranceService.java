package com.digitallegacy.service;

import com.digitallegacy.entity.FamilyMember;
import com.digitallegacy.entity.Insurance;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.FamilyMemberRepository;
import com.digitallegacy.repository.InsuranceRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class InsuranceService {

    @Autowired
    private InsuranceRepository insuranceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuditLogService auditLogService;

    public List<Insurance> getInsuranceByUserId(Long userId) {
        return insuranceRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Insurance getInsuranceById(Long id, Long userId) {
        Insurance insurance = insuranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance", "id", id));
        if (!insurance.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Insurance", "id", id);
        }
        return insurance;
    }

    @Transactional
    public Insurance addInsurance(Long userId, String insuranceProvider, String policyType, String policyNumber,
                                 String policyHolder, String nominee, LocalDate startDate, LocalDate expiryDate,
                                 BigDecimal premiumAmount, String premiumFrequency, String notes,
                                 Long familyMemberId, MultipartFile policyDoc) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Insurance policy = new Insurance();
        policy.setUser(user);
        policy.setInsuranceProvider(insuranceProvider);
        policy.setPolicyType(policyType);
        policy.setPolicyNumber(policyNumber);
        policy.setPolicyHolder(policyHolder);
        policy.setNominee(nominee);
        policy.setStartDate(startDate);
        policy.setExpiryDate(expiryDate);
        policy.setPremiumAmount(premiumAmount);
        policy.setPremiumFrequency(premiumFrequency);
        policy.setNotes(notes);

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            policy.setFamilyMember(member);
        }

        if (policyDoc != null && !policyDoc.isEmpty()) {
            String path = fileStorageService.storeFile(policyDoc);
            policy.setPolicyDocumentPath(path);
        }

        Insurance saved = insuranceRepository.save(policy);
        auditLogService.log(userId, user.getUsername(), "ADD_INSURANCE_POLICY", "INSURANCE", saved.getId(),
                "Added policy: " + saved.getPolicyNumber() + " (" + saved.getInsuranceProvider() + ")", null);
        return saved;
    }

    @Transactional
    public Insurance updateInsurance(Long id, Long userId, Insurance updated, Long familyMemberId) {
        Insurance existing = getInsuranceById(id, userId);

        existing.setInsuranceProvider(updated.getInsuranceProvider());
        existing.setPolicyType(updated.getPolicyType());
        existing.setPolicyNumber(updated.getPolicyNumber());
        existing.setPolicyHolder(updated.getPolicyHolder());
        existing.setNominee(updated.getNominee());
        existing.setStartDate(updated.getStartDate());
        existing.setExpiryDate(updated.getExpiryDate());
        existing.setPremiumAmount(updated.getPremiumAmount());
        existing.setPremiumFrequency(updated.getPremiumFrequency());
        existing.setNotes(updated.getNotes());

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            existing.setFamilyMember(member);
        } else {
            existing.setFamilyMember(null);
        }

        Insurance saved = insuranceRepository.save(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "UPDATE_INSURANCE_POLICY", "INSURANCE", saved.getId(),
                "Updated policy: " + saved.getPolicyNumber(), null);
        return saved;
    }

    @Transactional
    public void deleteInsurance(Long id, Long userId) {
        Insurance existing = getInsuranceById(id, userId);
        if (existing.getPolicyDocumentPath() != null) {
            fileStorageService.deleteFile(existing.getPolicyDocumentPath());
        }
        insuranceRepository.delete(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "DELETE_INSURANCE_POLICY", "INSURANCE", id,
                "Deleted policy: " + existing.getPolicyNumber(), null);
    }
}
