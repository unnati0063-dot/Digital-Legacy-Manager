package com.digitallegacy.controller;

import com.digitallegacy.entity.FamilyAccess;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.FamilyAccessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/family-access")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FamilyAccessController {

    @Autowired
    private FamilyAccessService familyAccessService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FamilyAccess>>> getMyAccessRules(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<FamilyAccess> list = familyAccessService.getAccessListByOwner(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Family access rules retrieved", list));
    }

    @GetMapping("/granted")
    public ResponseEntity<ApiResponse<List<FamilyAccess>>> getAccessGrantedToMe(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<FamilyAccess> list = familyAccessService.getAccessGrantedToUser(currentUser.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Shared vaults retrieved", list));
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<FamilyAccess>> inviteFamilyMember(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, Object> body) {

        Long familyMemberId = body.get("familyMemberId") != null ? Long.valueOf(body.get("familyMemberId").toString()) : null;
        String granteeEmail = (String) body.get("granteeEmail");
        String granteeName = (String) body.get("granteeName");
        String relationship = (String) body.get("relationship");
        String sectionName = (String) body.get("sectionName");
        String permissionLevel = (String) body.get("permissionLevel");

        FamilyAccess access = familyAccessService.inviteFamilyMember(currentUser.getId(), familyMemberId,
                granteeEmail, granteeName, relationship, sectionName, permissionLevel);

        return ResponseEntity.ok(ApiResponse.success("Family invitation sent successfully", access));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FamilyAccess>> updatePermission(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String permissionLevel = body.get("permissionLevel");
        String sectionName = body.get("sectionName");
        FamilyAccess updated = familyAccessService.updatePermission(id, currentUser.getId(), permissionLevel, sectionName);
        return ResponseEntity.ok(ApiResponse.success("Permission updated successfully", updated));
    }

    @PostMapping("/{id}/revoke")
    public ResponseEntity<ApiResponse<Void>> revokeAccess(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        familyAccessService.revokeAccess(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Access revoked successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAccess(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        familyAccessService.deleteAccess(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Access entry deleted successfully"));
    }

    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<FamilyAccess>> acceptInvitation(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        FamilyAccess access = familyAccessService.acceptInvitation(token);
        return ResponseEntity.ok(ApiResponse.success("Invitation accepted successfully", access));
    }
}
