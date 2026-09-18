package com.skillsphere.controller;

import com.skillsphere.entity.Internship;
import com.skillsphere.entity.InternshipApplication;
import com.skillsphere.entity.User;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.InternshipService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/internships")
@RequiredArgsConstructor
public class InternshipController {

    private final InternshipService internshipService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Internship>> getAllActiveInternships() {
        return ResponseEntity.ok(internshipService.getAllActiveInternships());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Internship>> getAllInternshipsAdmin() {
        return ResponseEntity.ok(internshipService.getAllInternshipsAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Internship> getInternshipById(@PathVariable Long id) {
        return ResponseEntity.ok(internshipService.getInternshipById(id));
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasAnyRole('STUDENT', 'MENTOR', 'ADMIN')")
    public ResponseEntity<InternshipApplication> applyForInternship(
            @PathVariable Long id,
            @RequestBody(required = false) InternshipApplication appDetails,
            Authentication authentication
    ) {
        String email = authentication.getName();
        InternshipApplication app = internshipService.applyForInternship(id, email, appDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(app);
    }

    @GetMapping("/my-applications")
    @PreAuthorize("hasAnyRole('STUDENT', 'MENTOR', 'ADMIN')")
    public ResponseEntity<List<InternshipApplication>> getMyApplications(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(internshipService.getStudentApplications(email));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN')")
    public ResponseEntity<Internship> createInternship(@RequestBody Internship internship, Authentication authentication) {
        String email = authentication.getName();
        User poster = userRepository.findByEmail(email).orElse(null);
        Internship created = internshipService.createInternship(internship, poster);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/mentor/applications")
    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN')")
    public ResponseEntity<List<InternshipApplication>> getMentorApplications(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(internshipService.getMentorApplications(email));
    }

    @GetMapping("/admin/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<InternshipApplication>> getAllApplicationsAdmin() {
        return ResponseEntity.ok(internshipService.getAllApplicationsAdmin());
    }

    @PatchMapping("/applications/{id}/status")
    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN')")
    public ResponseEntity<InternshipApplication> updateApplicationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        String status = payload.get("status");
        String reviewNotes = payload.get("reviewNotes");
        InternshipApplication updated = internshipService.updateApplicationStatus(id, status, reviewNotes);
        return ResponseEntity.ok(updated);
    }
}
