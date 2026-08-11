package com.skillsphere.repository;

import com.skillsphere.entity.Quiz;
import com.skillsphere.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizOrderByOrderIndex(Quiz quiz);
    void deleteByQuiz(Quiz quiz);
}
