package com.digitallegacy.controller;

import com.digitallegacy.entity.Document;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Document>>> getAllDocuments(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Document> list = documentService.getAllDocumentsForUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", list));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<Document>>> getDocumentsByCategory(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                              @PathVariable String category) {
        List<Document> list = documentService.getDocumentsByCategory(currentUser.getId(), category);
        return ResponseEntity.ok(ApiResponse.success(category + " documents retrieved", list));
    }

    @GetMapping("/family/{familyMemberId}")
    public ResponseEntity<ApiResponse<List<Document>>> getDocumentsByFamilyMember(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                                  @PathVariable Long familyMemberId) {
        List<Document> list = documentService.getDocumentsByFamilyMember(currentUser.getId(), familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Family member documents retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Document>> getDocumentById(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                 @PathVariable Long id) {
        Document doc = documentService.getDocumentById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Document retrieved", doc));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Document>> uploadDocument(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("category") String category,
            @RequestParam("documentName") String documentName,
            @RequestParam("documentType") String documentType,
            @RequestParam(value = "documentNumber", required = false) String documentNumber,
            @RequestParam("ownerName") String ownerName,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestParam(value = "issueDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate issueDate,
            @RequestParam(value = "expiryDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(value = "issuingAuthority", required = false) String issuingAuthority,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Document created = documentService.uploadDocument(currentUser.getId(), category, documentName, documentType,
                documentNumber, ownerName, familyMemberId, issueDate, expiryDate, issuingAuthority, description, file);

        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Document>> updateDocumentMetadata(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestBody Document updatedDoc) {

        Document doc = documentService.updateDocumentMetadata(id, currentUser.getId(), updatedDoc, familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Document metadata updated successfully", doc));
    }

    @PostMapping(value = "/{id}/replace", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Document>> replaceDocumentFile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        Document updated = documentService.replaceDocumentFile(id, currentUser.getId(), file);
        return ResponseEntity.ok(ApiResponse.success("Document file replaced successfully", updated));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        Document doc = documentService.getDocumentById(id, currentUser.getId());
        Resource resource = documentService.downloadDocumentFile(id, currentUser.getId());

        String contentType = doc.getFileType() != null ? doc.getFileType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
        String fileName = doc.getOriginalFileName() != null ? doc.getOriginalFileName() : doc.getDocumentName();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@AuthenticationPrincipal UserPrincipal currentUser,
                                                            @PathVariable Long id) {
        documentService.deleteDocument(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Document deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Document>>> searchDocuments(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                       @RequestParam("q") String query) {
        List<Document> results = documentService.searchDocuments(currentUser.getId(), query);
        return ResponseEntity.ok(ApiResponse.success("Search completed", results));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<Document>>> filterDocuments(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "category", required = false, defaultValue = "GOVERNMENT") String category,
            @RequestParam(value = "ownerName", required = false) String ownerName,
            @RequestParam(value = "docType", required = false) String docType) {

        List<Document> filtered = documentService.filterDocuments(currentUser.getId(), category, ownerName, docType);
        return ResponseEntity.ok(ApiResponse.success("Filtered documents retrieved", filtered));
    }

    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<List<Document>>> getExpiringDocuments(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Document> list = documentService.getExpiringSoonDocuments(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Expiring soon documents retrieved", list));
    }

    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<Document>>> getExpiredDocuments(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Document> list = documentService.getExpiredDocuments(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Expired documents retrieved", list));
    }
}
