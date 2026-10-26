package com.digitallegacy.controller;

import com.digitallegacy.entity.DigitalAccount;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.DigitalAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/digital-accounts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DigitalAccountController {

    @Autowired
    private DigitalAccountService digitalAccountService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DigitalAccount>>> getDigitalAccounts(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<DigitalAccount> list = digitalAccountService.getDigitalAccountsByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Digital accounts retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DigitalAccount>> getDigitalAccount(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                         @PathVariable Long id) {
        DigitalAccount account = digitalAccountService.getDigitalAccountById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Digital account retrieved", account));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DigitalAccount>> addDigitalAccount(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody DigitalAccount account) {

        DigitalAccount created = digitalAccountService.addDigitalAccount(currentUser.getId(), account);
        return ResponseEntity.ok(ApiResponse.success("Digital account added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DigitalAccount>> updateDigitalAccount(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestBody DigitalAccount account) {

        DigitalAccount updated = digitalAccountService.updateDigitalAccount(id, currentUser.getId(), account);
        return ResponseEntity.ok(ApiResponse.success("Digital account updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDigitalAccount(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        digitalAccountService.deleteDigitalAccount(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Digital account deleted successfully"));
    }
}
