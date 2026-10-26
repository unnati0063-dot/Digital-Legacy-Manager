package com.digitallegacy.controller;

import com.digitallegacy.payload.*;
import com.digitallegacy.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> registerUser(@Valid @RequestBody RegisterRequest registerRequest,
                                                                   HttpServletRequest request) {
        AuthResponse response = authService.register(registerRequest, request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully!", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> authenticateUser(@Valid @RequestBody AuthRequest loginRequest,
                                                                       HttpServletRequest request) {
        AuthResponse response = authService.login(loginRequest, request);
        return ResponseEntity.ok(ApiResponse.success("Login successful!", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String resetToken = authService.forgotPassword(email);
        return ResponseEntity.ok(ApiResponse.success("Reset code generated.", Map.of("token", resetToken, "message", "A reset code has been sent/generated.")));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody PasswordResetRequest resetRequest) {
        authService.resetPassword(resetRequest);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. You can now login."));
    }
}
