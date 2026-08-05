package com.skillsphere.repository;

import com.skillsphere.entity.Complaint;
import com.skillsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByStudentOrderByCreatedAtDesc(User student);
    List<Complaint> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
