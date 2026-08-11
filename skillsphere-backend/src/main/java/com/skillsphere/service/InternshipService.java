package com.skillsphere.service;

import com.skillsphere.entity.Internship;
import com.skillsphere.entity.InternshipApplication;
import com.skillsphere.entity.User;
import java.util.List;

public interface InternshipService {
    List<Internship> getAllActiveInternships();
    List<Internship> getAllInternshipsAdmin();
    Internship getInternshipById(Long id);
    Internship createInternship(Internship internship, User poster);
    InternshipApplication applyForInternship(Long internshipId, String userEmail, InternshipApplication appDetails);
    List<InternshipApplication> getStudentApplications(String userEmail);
    List<InternshipApplication> getMentorApplications(String mentorEmail);
    List<InternshipApplication> getAllApplicationsAdmin();
    InternshipApplication updateApplicationStatus(Long applicationId, String status, String reviewNotes);
}
