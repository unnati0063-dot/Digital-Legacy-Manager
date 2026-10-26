package com.digitallegacy.controller;

import com.digitallegacy.entity.*;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.repository.FamilyMemberRepository;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.AssetService;
import com.digitallegacy.service.ContactService;
import com.digitallegacy.service.DocumentService;
import com.digitallegacy.service.ImportantInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*", maxAge = 3600)
public class SearchController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private AssetService assetService;

    @Autowired
    private ContactService contactService;

    @Autowired
    private ImportantInfoService importantInfoService;

    @GetMapping("/global")
    public ResponseEntity<ApiResponse<Map<String, Object>>> globalSearch(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("q") String query) {

        Map<String, Object> results = new HashMap<>();

        if (query == null || query.trim().isEmpty()) {
            results.put("documents", List.of());
            results.put("familyMembers", List.of());
            results.put("assets", List.of());
            results.put("contacts", List.of());
            results.put("importantInfo", List.of());
            return ResponseEntity.ok(ApiResponse.success("Search completed", results));
        }

        String q = query.trim();
        List<Document> docs = documentService.searchDocuments(currentUser.getId(), q);
        List<FamilyMember> family = familyMemberRepository.findByUserIdAndFullNameContainingIgnoreCase(currentUser.getId(), q);
        List<ImportantInfo> info = importantInfoService.searchInfo(currentUser.getId(), q);

        results.put("documents", docs);
        results.put("familyMembers", family);
        results.put("importantInfo", info);

        return ResponseEntity.ok(ApiResponse.success("Search results for: " + q, results));
    }
}
