package com.digitallegacy.controller;

import com.digitallegacy.entity.AuditLog;
import com.digitallegacy.entity.DocumentCategory;
import com.digitallegacy.entity.Role;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.ResourceNotFoundException;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.payload.UserProfileDto;
import com.digitallegacy.repository.*;
import com.digitallegacy.service.AuditLogService;
import com.digitallegacy.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private FamilyMemberRepository familyMemberRepository;

    @Autowired
    private DocumentCategoryRepository categoryRepository;

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers() {
        List<UserProfileDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        Boolean isEnabled = body.get("isEnabled");
        if (isEnabled != null) {
            user.setIsEnabled(isEnabled);
            userRepository.save(user);
        }
        return ResponseEntity.ok(ApiResponse.success("User status updated"));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        String roleStr = body.get("role");
        if (roleStr != null) {
            user.setRole(Role.valueOf(roleStr));
            userRepository.save(user);
        }
        return ResponseEntity.ok(ApiResponse.success("User role updated"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalDocuments", documentRepository.count());
        stats.put("totalFamilyMembers", familyMemberRepository.count());
        stats.put("activeCategories", categoryRepository.count());
        return ResponseEntity.ok(ApiResponse.success("System statistics", stats));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAllAuditLogs() {
        List<AuditLog> logs = auditLogService.getAllLogs();
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<DocumentCategory>>> getCategories() {
        List<DocumentCategory> categories = categoryRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved", categories));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<DocumentCategory>> createCategory(@RequestBody DocumentCategory category) {
        DocumentCategory saved = categoryRepository.save(category);
        return ResponseEntity.ok(ApiResponse.success("Category created successfully", saved));
    }
}
