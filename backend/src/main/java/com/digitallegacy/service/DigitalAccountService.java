package com.digitallegacy.service;

import com.digitallegacy.entity.DigitalAccount;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.DigitalAccountRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DigitalAccountService {

    @Autowired
    private DigitalAccountRepository digitalAccountRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<DigitalAccount> getDigitalAccountsByUserId(Long userId) {
        return digitalAccountRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public DigitalAccount getDigitalAccountById(Long id, Long userId) {
        DigitalAccount account = digitalAccountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DigitalAccount", "id", id));
        if (!account.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("DigitalAccount", "id", id);
        }
        return account;
    }

    @Transactional
    public DigitalAccount addDigitalAccount(Long userId, DigitalAccount account) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        account.setUser(user);
        DigitalAccount saved = digitalAccountRepository.save(account);
        auditLogService.log(userId, user.getUsername(), "ADD_DIGITAL_ACCOUNT", "DIGITAL_ACCOUNT", saved.getId(),
                "Added digital account directive for: " + saved.getServiceName(), null);
        return saved;
    }

    @Transactional
    public DigitalAccount updateDigitalAccount(Long id, Long userId, DigitalAccount updated) {
        DigitalAccount existing = getDigitalAccountById(id, userId);

        existing.setAccountCategory(updated.getAccountCategory());
        existing.setServiceName(updated.getServiceName());
        existing.setUsernameOrEmail(updated.getUsernameOrEmail());
        existing.setWebsiteUrl(updated.getWebsiteUrl());
        existing.setAccountStatus(updated.getAccountStatus());
        existing.setRecoveryInfo(updated.getRecoveryInfo());
        existing.setInstructions(updated.getInstructions());

        DigitalAccount saved = digitalAccountRepository.save(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "UPDATE_DIGITAL_ACCOUNT", "DIGITAL_ACCOUNT", saved.getId(),
                "Updated digital account record: " + saved.getServiceName(), null);
        return saved;
    }

    @Transactional
    public void deleteDigitalAccount(Long id, Long userId) {
        DigitalAccount existing = getDigitalAccountById(id, userId);
        digitalAccountRepository.delete(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "DELETE_DIGITAL_ACCOUNT", "DIGITAL_ACCOUNT", id,
                "Deleted digital account record: " + existing.getServiceName(), null);
    }
}
