package com.skillsphere.service;

import com.skillsphere.dto.ProfileResponse;
import com.skillsphere.dto.StudentProfileRequest;
import com.skillsphere.dto.MentorProfileRequest;
import com.skillsphere.dto.AdminProfileRequest;

public interface ProfileService {

    ProfileResponse getCurrentUserProfile();
    
    ProfileResponse updateStudentProfile(StudentProfileRequest request);
    
    ProfileResponse updateMentorProfile(MentorProfileRequest request);
    
    ProfileResponse updateAdminProfile(AdminProfileRequest request);
}
