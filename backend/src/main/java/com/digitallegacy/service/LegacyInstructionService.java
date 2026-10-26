package com.digitallegacy.service;

import com.digitallegacy.entity.LegacyInstruction;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.LegacyInstructionRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class LegacyInstructionService {

    @Autowired
    private LegacyInstructionRepository legacyInstructionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<LegacyInstruction> getLegacyInstructionsByUserId(Long userId) {
        return legacyInstructionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public LegacyInstruction getLegacyInstructionById(Long id, Long userId) {
        LegacyInstruction instruction = legacyInstructionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LegacyInstruction", "id", id));
        if (!instruction.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("LegacyInstruction", "id", id);
        }
        return instruction;
    }

    @Transactional
    public LegacyInstruction addLegacyInstruction(Long userId, LegacyInstruction instruction) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        instruction.setUser(user);
        LegacyInstruction saved = legacyInstructionRepository.save(instruction);
        auditLogService.log(userId, user.getUsername(), "ADD_LEGACY_INSTRUCTION", "LEGACY_INSTRUCTION", saved.getId(),
                "Added legacy instruction: " + saved.getTitle(), null);
        return saved;
    }

    @Transactional
    public LegacyInstruction updateLegacyInstruction(Long id, Long userId, LegacyInstruction updated) {
        LegacyInstruction existing = getLegacyInstructionById(id, userId);

        existing.setTitle(updated.getTitle());
        existing.setCategory(updated.getCategory());
        existing.setInstructionText(updated.getInstructionText());
        existing.setPriority(updated.getPriority());

        LegacyInstruction saved = legacyInstructionRepository.save(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "UPDATE_LEGACY_INSTRUCTION", "LEGACY_INSTRUCTION", saved.getId(),
                "Updated legacy instruction: " + saved.getTitle(), null);
        return saved;
    }

    @Transactional
    public void deleteLegacyInstruction(Long id, Long userId) {
        LegacyInstruction existing = getLegacyInstructionById(id, userId);
        legacyInstructionRepository.delete(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "DELETE_LEGACY_INSTRUCTION", "LEGACY_INSTRUCTION", id,
                "Deleted legacy instruction: " + existing.getTitle(), null);
    }
}
