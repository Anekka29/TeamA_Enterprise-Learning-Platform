package com.skillsphere.repository;

import com.skillsphere.entity.Complaint;
import com.skillsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    
    @Query("SELECT c FROM Complaint c LEFT JOIN FETCH c.student WHERE c.student = :student ORDER BY c.createdAt DESC")
    List<Complaint> findByStudentOrderByCreatedAtDesc(@Param("student") User student);

    @Query("SELECT c FROM Complaint c LEFT JOIN FETCH c.student ORDER BY c.createdAt DESC")
    List<Complaint> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}
