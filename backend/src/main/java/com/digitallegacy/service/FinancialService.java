package com.digitallegacy.service;

import com.digitallegacy.entity.FamilyMember;
import com.digitallegacy.entity.FinancialInfo;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.FamilyMemberRepository;
import com.digitallegacy.repository.FinancialInfoRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FinancialService {

    @Autowired
    private FinancialInfoRepository financialInfoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<FinancialInfo> getFinancialsByUserId(Long userId) {
        return financialInfoRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public FinancialInfo getFinancialById(Long id, Long userId) {
        FinancialInfo info = financialInfoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("FinancialInfo", "id", id));
        if (!info.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("FinancialInfo", "id", id);
        }
        return info;
    }

    @Transactional
    public FinancialInfo addFinancial(Long userId, FinancialInfo financialInfo, Long familyMemberId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        financialInfo.setUser(user);
        // Ensure last 4 digits format
        String digits = financialInfo.getLastFourDigits();
        if (digits != null && digits.length() > 4) {
            financialInfo.setLastFourDigits(digits.substring(digits.length() - 4));
        }

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            financialInfo.setFamilyMember(member);
        }

        FinancialInfo saved = financialInfoRepository.save(financialInfo);
        auditLogService.log(userId, user.getUsername(), "ADD_FINANCIAL_ACCOUNT", "FINANCIAL", saved.getId(),
                "Added financial record: " + saved.getBankName() + " (Ending " + saved.getLastFourDigits() + ")", null);
        return saved;
    }

    @Transactional
    public FinancialInfo updateFinancial(Long id, Long userId, FinancialInfo updated, Long familyMemberId) {
        FinancialInfo existing = getFinancialById(id, userId);

        existing.setBankName(updated.getBankName());
        existing.setAccountType(updated.getAccountType());
        existing.setAccountHolder(updated.getAccountHolder());

        String digits = updated.getLastFourDigits();
        if (digits != null && digits.length() > 4) {
            existing.setLastFourDigits(digits.substring(digits.length() - 4));
        } else if (digits != null) {
            existing.setLastFourDigits(digits);
        }

        existing.setBranch(updated.getBranch());
        existing.setIfsc(updated.getIfsc());
        existing.setImportantNotes(updated.getImportantNotes());

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            existing.setFamilyMember(member);
        } else {
            existing.setFamilyMember(null);
        }

        FinancialInfo saved = financialInfoRepository.save(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "UPDATE_FINANCIAL_ACCOUNT", "FINANCIAL", saved.getId(),
                "Updated financial record: " + saved.getBankName(), null);
        return saved;
    }

    @Transactional
    public void deleteFinancial(Long id, Long userId) {
        FinancialInfo existing = getFinancialById(id, userId);
        financialInfoRepository.delete(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "DELETE_FINANCIAL_ACCOUNT", "FINANCIAL", id,
                "Deleted financial record: " + existing.getBankName(), null);
    }
}
