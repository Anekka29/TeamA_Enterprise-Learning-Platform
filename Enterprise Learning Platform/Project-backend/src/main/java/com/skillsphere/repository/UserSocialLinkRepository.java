package com.skillsphere.repository;

import com.skillsphere.entity.UserSocialLink;
import com.skillsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserSocialLinkRepository extends JpaRepository<UserSocialLink, Long> {
    List<UserSocialLink> findByUser(User user);
}
