package com.digitallegacy.service;

import com.digitallegacy.entity.ImportantInfo;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.ImportantInfoRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ImportantInfoService {

    @Autowired
    private ImportantInfoRepository importantInfoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<ImportantInfo> getImportantInfoByUserId(Long userId) {
        return importantInfoRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public ImportantInfo getImportantInfoById(Long id, Long userId) {
        ImportantInfo info = importantInfoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ImportantInfo", "id", id));
        if (!info.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("ImportantInfo", "id", id);
        }
        return info;
    }

    @Transactional
    public ImportantInfo addImportantInfo(Long userId, ImportantInfo info) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        info.setUser(user);
        ImportantInfo saved = importantInfoRepository.save(info);
        auditLogService.log(userId, user.getUsername(), "ADD_IMPORTANT_INFO", "IMPORTANT_INFO", saved.getId(),
                "Added important info: " + saved.getTitle(), null);
        return saved;
    }

    @Transactional
    public ImportantInfo updateImportantInfo(Long id, Long userId, ImportantInfo updated) {
        ImportantInfo existing = getImportantInfoById(id, userId);

        existing.setTitle(updated.getTitle());
        existing.setCategory(updated.getCategory());
        existing.setContent(updated.getContent());
        existing.setImportanceLevel(updated.getImportanceLevel());

        ImportantInfo saved = importantInfoRepository.save(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "UPDATE_IMPORTANT_INFO", "IMPORTANT_INFO", saved.getId(),
                "Updated important info: " + saved.getTitle(), null);
        return saved;
    }

    @Transactional
    public void deleteImportantInfo(Long id, Long userId) {
        ImportantInfo existing = getImportantInfoById(id, userId);
        importantInfoRepository.delete(existing);
        auditLogService.log(userId, existing.getUser().getUsername(), "DELETE_IMPORTANT_INFO", "IMPORTANT_INFO", id,
                "Deleted important info: " + existing.getTitle(), null);
    }

    public List<ImportantInfo> searchInfo(Long userId, String query) {
        return importantInfoRepository.searchInfo(userId, query);
    }
}
