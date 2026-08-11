package com.skillsphere.repository;

import com.skillsphere.entity.InternshipApplication;
import com.skillsphere.entity.User;
import com.skillsphere.entity.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {
    List<InternshipApplication> findByUserOrderByIdDesc(User user);
    List<InternshipApplication> findByInternshipOrderByIdDesc(Internship internship);
    List<InternshipApplication> findByInternship_PostedByUserIdOrderByIdDesc(Long postedByUserId);
    Optional<InternshipApplication> findByUserAndInternship(User user, Internship internship);
    boolean existsByUserAndInternship(User user, Internship internship);
}
