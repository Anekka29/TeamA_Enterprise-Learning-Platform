package com.skillsphere.repository;

import com.skillsphere.entity.LoginHistory;
import com.skillsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findTop50ByUserOrderByLoginAtDesc(User user);
    Optional<LoginHistory> findFirstByUserOrderByLoginAtDesc(User user);
}
