package com.digitallegacy.controller;

import com.digitallegacy.entity.FinancialInfo;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.FinancialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FinancialController {

    @Autowired
    private FinancialService financialService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FinancialInfo>>> getFinancialAccounts(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<FinancialInfo> list = financialService.getFinancialsByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Financial records retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FinancialInfo>> getFinancialAccount(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                          @PathVariable Long id) {
        FinancialInfo info = financialService.getFinancialById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Financial record retrieved", info));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FinancialInfo>> addFinancialAccount(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestBody FinancialInfo financialInfo) {

        FinancialInfo created = financialService.addFinancial(currentUser.getId(), financialInfo, familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Financial account added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FinancialInfo>> updateFinancialAccount(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestBody FinancialInfo financialInfo) {

        FinancialInfo updated = financialService.updateFinancial(id, currentUser.getId(), financialInfo, familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Financial account updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFinancialAccount(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        financialService.deleteFinancial(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Financial account deleted successfully"));
    }
}
