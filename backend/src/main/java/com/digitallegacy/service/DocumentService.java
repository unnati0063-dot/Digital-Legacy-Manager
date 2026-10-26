package com.digitallegacy.service;

import com.digitallegacy.entity.Document;
import com.digitallegacy.entity.FamilyMember;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.BadRequestException;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.repository.DocumentRepository;
import com.digitallegacy.repository.FamilyMemberRepository;
import com.digitallegacy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AuditLogService auditLogService;

    public List<Document> getAllDocumentsForUser(Long userId) {
        return documentRepository.findByUserIdOrderByUploadDateDesc(userId);
    }

    public List<Document> getDocumentsByCategory(Long userId, String category) {
        return documentRepository.findByUserIdAndCategoryOrderByUploadDateDesc(userId, category.toUpperCase());
    }

    public List<Document> getDocumentsByFamilyMember(Long userId, Long familyMemberId) {
        return documentRepository.findByUserIdAndFamilyMemberIdOrderByUploadDateDesc(userId, familyMemberId);
    }

    public Document getDocumentById(Long id, Long userId) {
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document", "id", id));
        if (!doc.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Document", "id", id);
        }
        return doc;
    }

    @Transactional
    public Document uploadDocument(Long userId, String category, String documentName, String documentType,
                                   String documentNumber, String ownerName, Long familyMemberId,
                                   LocalDate issueDate, LocalDate expiryDate, String issuingAuthority,
                                   String description, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Document document = new Document();
        document.setUser(user);
        document.setCategory(category.toUpperCase());
        document.setDocumentName(documentName);
        document.setDocumentType(documentType);
        document.setDocumentNumber(documentNumber);
        document.setOwnerName(ownerName);
        document.setIssueDate(issueDate);
        document.setExpiryDate(expiryDate);
        document.setIssuingAuthority(issuingAuthority);
        document.setDescription(description);

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            document.setFamilyMember(member);
        }

        if (file != null && !file.isEmpty()) {
            String storedFileName = fileStorageService.storeFile(file);
            document.setFilePath(storedFileName);
            document.setOriginalFileName(file.getOriginalFilename());
            document.setFileSize(file.getSize());
            document.setFileType(file.getContentType());
        }

        Document saved = documentRepository.save(document);
        auditLogService.log(userId, user.getUsername(), "UPLOAD_DOCUMENT", "DOCUMENT", saved.getId(),
                "Uploaded " + saved.getCategory() + " document: " + saved.getDocumentName(), null);

        return saved;
    }

    @Transactional
    public Document updateDocumentMetadata(Long id, Long userId, Document updatedDetails, Long familyMemberId) {
        Document document = getDocumentById(id, userId);

        document.setDocumentName(updatedDetails.getDocumentName());
        document.setDocumentType(updatedDetails.getDocumentType());
        document.setDocumentNumber(updatedDetails.getDocumentNumber());
        document.setOwnerName(updatedDetails.getOwnerName());
        document.setIssueDate(updatedDetails.getIssueDate());
        document.setExpiryDate(updatedDetails.getExpiryDate());
        document.setIssuingAuthority(updatedDetails.getIssuingAuthority());
        document.setDescription(updatedDetails.getDescription());

        if (familyMemberId != null) {
            FamilyMember member = familyMemberRepository.findById(familyMemberId).orElse(null);
            document.setFamilyMember(member);
        } else {
            document.setFamilyMember(null);
        }

        Document saved = documentRepository.save(document);
        auditLogService.log(userId, document.getUser().getUsername(), "UPDATE_DOCUMENT_METADATA", "DOCUMENT", saved.getId(),
                "Updated metadata for: " + saved.getDocumentName(), null);

        return saved;
    }

    @Transactional
    public Document replaceDocumentFile(Long id, Long userId, MultipartFile newFile) {
        if (newFile == null || newFile.isEmpty()) {
            throw new BadRequestException("New file cannot be empty.");
        }

        Document document = getDocumentById(id, userId);

        // Delete old file if present
        if (document.getFilePath() != null) {
            fileStorageService.deleteFile(document.getFilePath());
        }

        // Store new file
        String storedFileName = fileStorageService.storeFile(newFile);
        document.setFilePath(storedFileName);
        document.setOriginalFileName(newFile.getOriginalFilename());
        document.setFileSize(newFile.getSize());
        document.setFileType(newFile.getContentType());

        Document saved = documentRepository.save(document);
        auditLogService.log(userId, document.getUser().getUsername(), "REPLACE_DOCUMENT_FILE", "DOCUMENT", saved.getId(),
                "Replaced file for document: " + saved.getDocumentName(), null);

        return saved;
    }

    public Resource downloadDocumentFile(Long id, Long userId) {
        Document document = getDocumentById(id, userId);
        if (document.getFilePath() == null || document.getFilePath().isBlank()) {
            throw new BadRequestException("No physical file associated with this document record.");
        }

        auditLogService.log(userId, document.getUser().getUsername(), "DOWNLOAD_DOCUMENT", "DOCUMENT", document.getId(),
                "Downloaded document: " + document.getDocumentName(), null);

        return fileStorageService.loadFileAsResource(document.getFilePath());
    }

    @Transactional
    public void deleteDocument(Long id, Long userId) {
        Document document = getDocumentById(id, userId);

        if (document.getFilePath() != null) {
            fileStorageService.deleteFile(document.getFilePath());
        }

        documentRepository.delete(document);
        auditLogService.log(userId, document.getUser().getUsername(), "DELETE_DOCUMENT", "DOCUMENT", id,
                "Deleted document: " + document.getDocumentName(), null);
    }

    public List<Document> searchDocuments(Long userId, String query) {
        return documentRepository.searchDocuments(userId, query);
    }

    public List<Document> filterDocuments(Long userId, String category, String ownerName, String docType) {
        return documentRepository.filterDocuments(userId, category.toUpperCase(), ownerName, docType);
    }

    public List<Document> getExpiringSoonDocuments(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate in60Days = today.plusDays(60);
        return documentRepository.findByUserIdAndExpiryDateBetween(userId, today, in60Days);
    }

    public List<Document> getExpiredDocuments(Long userId) {
        LocalDate today = LocalDate.now();
        return documentRepository.findByUserIdAndExpiryDateBefore(userId, today);
    }
}
