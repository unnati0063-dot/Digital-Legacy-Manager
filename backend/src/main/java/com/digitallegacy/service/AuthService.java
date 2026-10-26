package com.digitallegacy.service;

import com.digitallegacy.entity.Role;
import com.digitallegacy.entity.User;
import com.digitallegacy.exception.BadRequestException;
import com.digitallegacy.payload.AuthRequest;
import com.digitallegacy.payload.AuthResponse;
import com.digitallegacy.payload.PasswordResetRequest;
import com.digitallegacy.payload.RegisterRequest;
import com.digitallegacy.repository.UserRepository;
import com.digitallegacy.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest, HttpServletRequest request) {
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new BadRequestException("Username is already taken!");
        }

        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BadRequestException("Email address is already registered!");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername().trim().toLowerCase());
        user.setEmail(registerRequest.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setFullName(registerRequest.getFullName());
        user.setRole(Role.ROLE_USER);
        user.setPhone(registerRequest.getPhone());
        user.setDateOfBirth(registerRequest.getDateOfBirth());
        user.setGender(registerRequest.getGender());
        user.setAddress(registerRequest.getAddress());
        user.setCity(registerRequest.getCity());
        user.setState(registerRequest.getState());
        user.setCountry(registerRequest.getCountry() != null ? registerRequest.getCountry() : "India");
        user.setEmergencyContact(registerRequest.getEmergencyContact());
        user.setIsEnabled(true);

        User savedUser = userRepository.save(user);

        // Authenticate new user immediately
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(registerRequest.getUsername(), registerRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        auditLogService.log(savedUser.getId(), savedUser.getUsername(), "USER_REGISTER", "USER", savedUser.getId(),
                "User account registered successfully", request);

        return new AuthResponse(jwt, savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name());
    }

    public AuthResponse login(AuthRequest authRequest, HttpServletRequest request) {
        String identifier = authRequest.getUsernameOrEmail().trim();

        // If identifier is email, get corresponding username
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), authRequest.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        auditLogService.log(user.getId(), user.getUsername(), "USER_LOGIN", "USER", user.getId(),
                "User logged in successfully", request);

        return new AuthResponse(jwt, user.getId(), user.getUsername(), user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Transactional
    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("No user found with email: " + email));

        String token = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        return token;
    }

    @Transactional
    public void resetPassword(PasswordResetRequest resetRequest) {
        User user = null;
        if (resetRequest.getToken() != null && !resetRequest.getToken().isBlank()) {
            user = userRepository.findByResetToken(resetRequest.getToken().trim())
                    .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token."));
        } else if (resetRequest.getEmail() != null && !resetRequest.getEmail().isBlank()) {
            user = userRepository.findByEmail(resetRequest.getEmail().trim().toLowerCase())
                    .orElseThrow(() -> new BadRequestException("User not found with email."));
        } else {
            throw new BadRequestException("Provide a valid reset token or email.");
        }

        if (user.getResetTokenExpiry() != null && user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(resetRequest.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        auditLogService.log(user.getId(), user.getUsername(), "PASSWORD_RESET", "USER", user.getId(),
                "Password changed successfully via reset request", null);
    }
}
