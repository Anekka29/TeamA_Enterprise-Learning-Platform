package com.skillsphere.controller;

import com.skillsphere.dto.ComplaintRequest;
import com.skillsphere.dto.ComplaintResponse;
import com.skillsphere.dto.ComplaintUpdateRequest;
import com.skillsphere.entity.Complaint;
import com.skillsphere.entity.User;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;

    private User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @PostMapping("/complaints")
    public ResponseEntity<ComplaintResponse> submitComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication
    ) {
        User student = getCurrentUser(authentication);
        Complaint complaint = complaintService.createComplaint(
                student,
                request.getSubject(),
                request.getDescription(),
                request.getCategory()
        );
        return ResponseEntity.ok(ComplaintResponse.fromEntity(complaint));
    }

    @GetMapping("/student/complaints")
    public ResponseEntity<List<ComplaintResponse>> getMyComplaints(Authentication authentication) {
        User student = getCurrentUser(authentication);
        List<ComplaintResponse> responses = complaintService.getStudentComplaints(student).stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/admin/complaints")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ComplaintResponse>> getAllComplaints() {
        List<ComplaintResponse> responses = complaintService.getAllComplaints().stream()
                .map(ComplaintResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/admin/complaints/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ComplaintResponse> updateComplaint(
            @PathVariable Long id,
            @RequestBody ComplaintUpdateRequest request,
            Authentication authentication
    ) {
        User admin = getCurrentUser(authentication);
        Complaint updated = complaintService.updateComplaintStatus(
                id,
                request.getStatus(),
                request.getAssignedTo(),
                request.getResolutionNotes(),
                admin
        );
        return ResponseEntity.ok(ComplaintResponse.fromEntity(updated));
    }
}
