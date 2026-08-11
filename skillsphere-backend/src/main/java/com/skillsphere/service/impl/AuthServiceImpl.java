package com.skillsphere.service.impl;

import com.skillsphere.dto.LoginRequest;
import com.skillsphere.dto.LoginResponse;
import com.skillsphere.dto.RegisterRequest;
import com.skillsphere.entity.User;
import com.skillsphere.enums.Role;
import com.skillsphere.exception.EmailAlreadyExistsException;
import com.skillsphere.exception.InvalidCredentialsException;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.repository.PasswordResetTokenRepository;
import com.skillsphere.security.JwtService;
import com.skillsphere.service.AuthService;
import com.skillsphere.service.EmailService;
import com.skillsphere.entity.PasswordResetToken;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @Override
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered: " + request.getEmail());
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new EmailAlreadyExistsException("Username is already taken: " + request.getUsername());
        }

        // Auto-assign ROLE_STUDENT to all new registrations
        // This prevents users from manipulating their role during registration
        // Users can only be promoted to MENTOR or ADMIN by existing admins
        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .college(request.getCollege())
                .department(request.getDepartment())
                .year(request.getYear())
                .phoneNumber(request.getPhoneNumber())
                .role(Role.STUDENT)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Registration successful")
                .build();
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // Check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("No account found with this email"));

        // Authenticate user
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new InvalidCredentialsException("Incorrect password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return LoginResponse.builder()
                .token(token)
                .email(user.getEmail())
                .role(user.getRole().name())
                .message("Login successful")
                .build();
    }


    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing token", e);
        }
    }

    @Override
    public void forgotPassword(String email) {
        log.info("=== Forgot Password request received for email: {} ===", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found for email: {}", email);
                    return new UserNotFoundException("No account found with this email");
                });
        log.info("User found with email: {} and ID: {}", email, user.getId());

        // Invalidate old tokens
        log.info("Invalidating old tokens for user ID: {}", user.getId());
        List<PasswordResetToken> activeTokens = tokenRepository.findByUserAndUsedFalse(user);
        log.info("Found {} active tokens to invalidate", activeTokens.size());
        for (PasswordResetToken token : activeTokens) {
            token.setUsed(true);
        }
        tokenRepository.saveAll(activeTokens);
        log.info("Successfully invalidated old tokens");

        // Create new token
        String unhashedToken = UUID.randomUUID().toString();
        log.info("Generated new reset token (unhashed): {}", unhashedToken);
        String hashedToken = hashToken(unhashedToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .hashedToken(hashedToken)
                .expiryTime(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        tokenRepository.save(resetToken);
        log.info("New reset token saved successfully in database");

        // Send email
        String resetLink = "http://localhost:5173/reset-password?token=" + unhashedToken;
        log.info("Preparing to send password reset email to: {} with reset link: {}", user.getEmail(), resetLink);
        try {
            emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
            log.info("=== Password reset email sent successfully to: {} ===", user.getEmail());
        } catch (Exception e) {
            log.error("Error sending password reset email to: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    @Override
    public boolean validateResetToken(String token) {
        log.info("=== validateResetToken called ===");
        log.info("Received token from frontend: {}", token);
        String hashedToken = hashToken(token);
        log.info("Hashed token to compare: {}", hashedToken);
        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByHashedToken(hashedToken);
        
        if (tokenOpt.isPresent()) {
            PasswordResetToken resetToken = tokenOpt.get();
            log.info("Found token in DB. Used: {}, Expiry: {}, Now: {}", resetToken.isUsed(), resetToken.getExpiryTime(), LocalDateTime.now());
            if (!resetToken.isUsed() && resetToken.getExpiryTime().isAfter(LocalDateTime.now())) {
                log.info("Token is VALID");
                return true;
            } else {
                log.warn("Token is INVALID: used={}, expired={}", resetToken.isUsed(), resetToken.getExpiryTime().isBefore(LocalDateTime.now()));
            }
        } else {
            log.error("Token not found in database");
        }
        return false;
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        log.info("=== resetPassword called ===");
        log.info("Received token: {}", token);
        String hashedToken = hashToken(token);
        PasswordResetToken resetToken = tokenRepository.findByHashedToken(hashedToken)
                .orElseThrow(() -> {
                    log.error("resetPassword: token not found in database");
                    return new RuntimeException("Invalid token");
                });

        if (resetToken.isUsed() || resetToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            log.error("resetPassword: token is expired or already used");
            throw new RuntimeException("Token has expired or already been used");
        }

        log.info("resetPassword: token valid, updating password");
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        log.info("resetPassword: password updated and token marked as used");
    }
}
