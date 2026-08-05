package com.skillsphere.repository;

import com.skillsphere.entity.PasswordResetToken;
import com.skillsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByHashedToken(String hashedToken);
    List<PasswordResetToken> findByUserAndUsedFalse(User user);
}
