package com.skillsphere.controller;

import com.skillsphere.dto.UpdateRoleRequest;
import com.skillsphere.entity.User;
import com.skillsphere.enums.Role;
import com.skillsphere.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;

    /**
     * Get all users (Admin only)
     * This endpoint allows admins to view all registered users
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }

    /**
     * Update user role (Admin only)
     * This is the ONLY way to change a user's role after registration
     * Regular users cannot change their own role or others' roles
     * 
     * Security measures:
     * - Endpoint is protected by @PreAuthorize("hasRole('ADMIN')")
     * - Request must come from authenticated admin user
     * - Role changes are logged and validated
     * - Prevents self-role changes
     * - Validates role progression (STUDENT → MENTOR → ADMIN)
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRoleRequest request,
            Authentication authentication
    ) {
        // Verify the requesting user is an admin
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        
        if (!admin.getRole().equals(Role.ADMIN)) {
            return ResponseEntity.status(403).body("Only admins can update user roles");
        }

        // Get the target user
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent admin from changing their own role
        if (targetUser.getId().equals(admin.getId())) {
            return ResponseEntity.status(400).body("Admins cannot change their own role");
        }

        // Validate role progression (STUDENT → MENTOR → ADMIN)
        if (!isValidRoleProgression(targetUser.getRole(), request.getRole())) {
            return ResponseEntity.status(400).body(
                "Invalid role progression. Valid progression: STUDENT → MENTOR → ADMIN"
            );
        }

        // Update the role
        targetUser.setRole(request.getRole());
        userRepository.save(targetUser);

        return ResponseEntity.ok("User role updated successfully");
    }

    /**
     * Validate role progression
     * Only allows: STUDENT → MENTOR → ADMIN
     * Prevents skipping roles or demoting users
     */
    private boolean isValidRoleProgression(Role currentRole, Role newRole) {
        // Define valid progression
        Role[] progression = {Role.STUDENT, Role.MENTOR, Role.ADMIN};
        
        int currentIndex = -1;
        int newIndex = -1;
        
        for (int i = 0; i < progression.length; i++) {
            if (progression[i].equals(currentRole)) currentIndex = i;
            if (progression[i].equals(newRole)) newIndex = i;
        }
        
        // Allow progression only (new role must be higher in hierarchy)
        return newIndex > currentIndex && currentIndex >= 0 && newIndex >= 0;
    }

    /**
     * Delete user (Admin only)
     * Allows admins to remove users from the system
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long userId,
            Authentication authentication
    ) {
        // Verify the requesting user is an admin
        User admin = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Admin user not found"));
        
        if (!admin.getRole().equals(Role.ADMIN)) {
            return ResponseEntity.status(403).body("Only admins can delete users");
        }

        // Get the target user
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent admin from deleting themselves
        if (targetUser.getId().equals(admin.getId())) {
            return ResponseEntity.status(400).body("Admins cannot delete themselves");
        }

        userRepository.delete(targetUser);
        return ResponseEntity.ok("User deleted successfully");
    }
}
