package com.digitallegacy.controller;

import com.digitallegacy.payload.ApiResponse;
import com.digitallegacy.payload.DashboardStatsDto;
import com.digitallegacy.security.UserPrincipal;
import com.digitallegacy.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats(@AuthenticationPrincipal UserPrincipal currentUser) {
        DashboardStatsDto stats = dashboardService.getDashboardStats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved", stats));
    }
}
