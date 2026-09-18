package com.skillsphere.service.impl;

import com.skillsphere.entity.Complaint;
import com.skillsphere.entity.User;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.ComplaintRepository;
import com.skillsphere.service.AuditLogService;
import com.skillsphere.service.ComplaintService;
import com.skillsphere.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ComplaintServiceImpl implements ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public Complaint createComplaint(User student, String subject, String description, String category) {
        Complaint complaint = Complaint.builder()
                .student(student)
                .subject(subject)
                .description(description)
                .category(category != null ? category : "GENERAL")
                .status("PENDING")
                .build();
        return complaintRepository.save(complaint);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Complaint> getStudentComplaints(User student) {
        return complaintRepository.findByStudentOrderByCreatedAtDesc(student);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional
    public Complaint updateComplaintStatus(Long id, String status, String assignedTo, String resolutionNotes, User admin) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Complaint not found with id: " + id));

        if (status != null && !status.isBlank()) {
            complaint.setStatus(status.toUpperCase());
        }
        if (assignedTo != null) {
            complaint.setAssignedTo(assignedTo);
        }
        if (resolutionNotes != null) {
            complaint.setResolutionNotes(resolutionNotes);
        }

        Complaint saved = complaintRepository.save(complaint);

        auditLogService.logAction(
                "COMPLAINT_UPDATE",
                admin != null ? admin.getEmail() : "SYSTEM",
                complaint.getStudent().getEmail(),
                null,
                "Updated complaint #" + id + " to status " + saved.getStatus(),
                null
        );

        try {
            String notifTitle = "Support Ticket #" + saved.getId() + " Response";
            StringBuilder notifBody = new StringBuilder();
            notifBody.append("Your complaint '").append(saved.getSubject()).append("' status is now ").append(saved.getStatus()).append(".");
            if (saved.getResolutionNotes() != null && !saved.getResolutionNotes().isBlank()) {
                notifBody.append("\nAdmin Reply: ").append(saved.getResolutionNotes());
            }

            notificationService.createNotification(
                    saved.getStudent(),
                    notifTitle,
                    notifBody.toString(),
                    "/student-dashboard#notifications",
                    false
            );
        } catch (Exception e) {
            log.error("Failed to notify student for complaint update", e);
        }

        return saved;
    }
}
