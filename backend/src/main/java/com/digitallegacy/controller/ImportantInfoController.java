package com.digitallegacy.controller;

import com.digitallegacy.entity.ImportantInfo;
import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.ImportantInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/important-info")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ImportantInfoController {

    @Autowired
    private ImportantInfoService importantInfoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImportantInfo>>> getInfoList(@AuthenticationPrincipal UserPrincipal currentUser) {
        List<ImportantInfo> list = importantInfoService.getImportantInfoByUserId(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Important information retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImportantInfo>> getInfoById(@AuthenticationPrincipal UserPrincipal currentUser,
                                                                  @PathVariable Long id) {
        ImportantInfo info = importantInfoService.getImportantInfoById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Important info retrieved", info));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ImportantInfo>> addInfo(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody ImportantInfo info) {

        ImportantInfo created = importantInfoService.addImportantInfo(currentUser.getId(), info);
        return ResponseEntity.ok(ApiResponse.success("Important information saved successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImportantInfo>> updateInfo(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id,
            @RequestBody ImportantInfo info) {

        ImportantInfo updated = importantInfoService.updateImportantInfo(id, currentUser.getId(), info);
        return ResponseEntity.ok(ApiResponse.success("Important information updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteInfo(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable Long id) {

        importantInfoService.deleteImportantInfo(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Important information deleted successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ImportantInfo>>> searchInfo(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam("q") String query) {

        List<ImportantInfo> list = importantInfoService.searchInfo(currentUser.getId(), query);
        return ResponseEntity.ok(ApiResponse.success("Search results retrieved", list));
    }
}
