package com.skillsphere.service;

import com.skillsphere.entity.Complaint;
import com.skillsphere.entity.User;

import java.util.List;

public interface ComplaintService {
    Complaint createComplaint(User student, String subject, String description, String category);
    List<Complaint> getStudentComplaints(User student);
    List<Complaint> getAllComplaints();
    Complaint updateComplaintStatus(Long id, String status, String assignedTo, String resolutionNotes, User admin);
}
