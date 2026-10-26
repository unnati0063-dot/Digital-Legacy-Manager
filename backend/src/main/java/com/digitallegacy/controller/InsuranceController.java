package com.digitallegacy.controller;

import com.digitallegacy.entity.Insurance;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.InsuranceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/insurance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InsuranceController {

    @Autowired
    private InsuranceService insuranceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Insurance>>> getPolicies(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Insurance> list = insuranceService.getInsuranceByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Insurance policies retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Insurance>> getPolicy(@AuthenticationPrincipal UserPrincipal currentUser,
                                                            @PathVariable Long id) {
        Insurance policy = insuranceService.getInsuranceById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Insurance policy retrieved", policy));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Insurance>> addPolicy(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("insuranceProvider") String insuranceProvider,
            @RequestParam("policyType") String policyType,
            @RequestParam("policyNumber") String policyNumber,
            @RequestParam("policyHolder") String policyHolder,
            @RequestParam(value = "nominee", required = false) String nominee,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "expiryDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(value = "premiumAmount", required = false) BigDecimal premiumAmount,
            @RequestParam(value = "premiumFrequency", required = false) String premiumFrequency,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestParam(value = "policyDoc", required = false) MultipartFile policyDoc) {

        Insurance policy = insuranceService.addInsurance(currentUser.getId(), insuranceProvider, policyType,
                policyNumber, policyHolder, nominee, startDate, expiryDate, premiumAmount, premiumFrequency,
                notes, familyMemberId, policyDoc);
        return ResponseEntity.ok(ApiResponse.success("Insurance policy added successfully", policy));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Insurance>> updatePolicy(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestBody Insurance updatedPolicy) {

        Insurance policy = insuranceService.updateInsurance(id, currentUser.getId(), updatedPolicy, familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Insurance policy updated successfully", policy));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        insuranceService.deleteInsurance(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Insurance policy deleted successfully"));
    }
}
