package com.digitallegacy.controller;

import com.digitallegacy.entity.LegacyInstruction;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.LegacyInstructionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/legacy-instructions")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LegacyInstructionController {

    @Autowired
    private LegacyInstructionService legacyInstructionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LegacyInstruction>>> getInstructions(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<LegacyInstruction> list = legacyInstructionService.getLegacyInstructionsByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Legacy instructions retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LegacyInstruction>> getInstruction(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                         @PathVariable Long id) {
        LegacyInstruction instruction = legacyInstructionService.getLegacyInstructionById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Legacy instruction retrieved", instruction));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LegacyInstruction>> addInstruction(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody LegacyInstruction instruction) {

        LegacyInstruction created = legacyInstructionService.addLegacyInstruction(currentUser.getId(), instruction);
        return ResponseEntity.ok(ApiResponse.success("Legacy instruction added successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LegacyInstruction>> updateInstruction(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestBody LegacyInstruction instruction) {

        LegacyInstruction updated = legacyInstructionService.updateLegacyInstruction(id, currentUser.getId(), instruction);
        return ResponseEntity.ok(ApiResponse.success("Legacy instruction updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInstruction(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        legacyInstructionService.deleteLegacyInstruction(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Legacy instruction deleted successfully"));
    }
}
