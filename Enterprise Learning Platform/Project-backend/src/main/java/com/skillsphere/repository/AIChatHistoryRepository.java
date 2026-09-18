package com.skillsphere.repository;

import com.skillsphere.entity.AIChatHistory;
import com.skillsphere.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIChatHistoryRepository extends JpaRepository<AIChatHistory, Long> {
    List<AIChatHistory> findByUserAndConversationIdOrderByCreatedAtAsc(User user, String conversationId);
    List<AIChatHistory> findTop10ByUserOrderByCreatedAtDesc(User user);
}
