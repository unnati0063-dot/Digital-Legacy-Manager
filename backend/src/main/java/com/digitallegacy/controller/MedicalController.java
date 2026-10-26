package com.digitallegacy.controller;

import com.digitallegacy.entity.MedicalInfo;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.MedicalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MedicalController {

    @Autowired
    private MedicalService medicalService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MedicalInfo>>> getMedicalRecords(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<MedicalInfo> list = medicalService.getMedicalInfoByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Medical records retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalInfo>> getMedicalRecord(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                     @PathVariable Long id) {
        MedicalInfo info = medicalService.getMedicalInfoById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Medical record retrieved", info));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MedicalInfo>> addMedicalRecord(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestBody MedicalInfo info) {

        MedicalInfo created = medicalService.addMedicalInfo(currentUser.getId(), info, familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Medical record added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicalInfo>> updateMedicalRecord(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestBody MedicalInfo info) {

        MedicalInfo updated = medicalService.updateMedicalInfo(id, currentUser.getId(), info, familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Medical record updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMedicalRecord(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        medicalService.deleteMedicalInfo(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Medical record deleted successfully"));
    }
}
