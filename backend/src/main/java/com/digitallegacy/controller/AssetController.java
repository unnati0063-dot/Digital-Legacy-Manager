package com.digitallegacy.controller;

import com.digitallegacy.entity.Asset;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssetController {

    @Autowired
    private AssetService assetService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Asset>>> getAssets(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<Asset> list = assetService.getAssetsByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Assets retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> getAsset(@AuthenticationPrincipal UserPrincipal currentUser,
                                                       @PathVariable Long id) {
        Asset asset = assetService.getAssetById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Asset retrieved", asset));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Asset>> addAsset(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("assetName") String assetName,
            @RequestParam("assetType") String assetType,
            @RequestParam("ownerName") String ownerName,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "estimatedValue", required = false) BigDecimal estimatedValue,
            @RequestParam(value = "documentReference", required = false) String documentReference,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "attachment", required = false) MultipartFile attachment) {

        Asset asset = assetService.addAsset(currentUser.getId(), assetName, assetType, ownerName,
                familyMemberId, description, location, estimatedValue, documentReference, notes, attachment);
        return ResponseEntity.ok(ApiResponse.success("Asset added successfully", asset));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Asset>> updateAsset(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestParam(value = "familyMemberId", required = false) Long familyMemberId,
            @RequestBody Asset assetDetails) {

        Asset updated = assetService.updateAsset(id, currentUser.getId(), assetDetails, familyMemberId);
        return ResponseEntity.ok(ApiResponse.success("Asset updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        assetService.deleteAsset(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Asset deleted successfully"));
    }
}
