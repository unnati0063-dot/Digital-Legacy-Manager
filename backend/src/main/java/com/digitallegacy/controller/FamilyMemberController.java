package com.digitallegacy.controller;

import com.digitallegacy.entity.FamilyMember;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.FamilyMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/family-members")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FamilyMemberController {

    @Autowired
    private FamilyMemberService familyMemberService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FamilyMember>>> getFamilyMembers(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<FamilyMember> list = familyMemberService.getFamilyMembersByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Family members retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FamilyMember>> getFamilyMember(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                    @PathVariable Long id) {
        FamilyMember member = familyMemberService.getFamilyMemberById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Family member retrieved", member));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FamilyMember>> addFamilyMember(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                    @RequestBody FamilyMember member) {
        FamilyMember created = familyMemberService.addFamilyMember(currentUser.getId(), member);
        return ResponseEntity.ok(ApiResponse.success("Family member added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FamilyMember>> updateFamilyMember(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                       @PathVariable Long id,
                                                                       @RequestBody FamilyMember member) {
        FamilyMember updated = familyMemberService.updateFamilyMember(id, currentUser.getId(), member);
        return ResponseEntity.ok(ApiResponse.success("Family member updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFamilyMember(@AuthenticationPrincipal UserPrincipal currentUser,
                                                               @PathVariable Long id) {
        familyMemberService.deleteFamilyMember(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Family member deleted successfully"));
    }
}
