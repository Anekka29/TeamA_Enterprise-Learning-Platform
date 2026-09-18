package com.skillsphere.repository;

import com.skillsphere.entity.Internship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InternshipRepository extends JpaRepository<Internship, Long> {
    List<Internship> findByActiveTrueOrderByIdDesc();
    List<Internship> findByPostedByUserIdOrderByIdDesc(Long postedByUserId);
}
