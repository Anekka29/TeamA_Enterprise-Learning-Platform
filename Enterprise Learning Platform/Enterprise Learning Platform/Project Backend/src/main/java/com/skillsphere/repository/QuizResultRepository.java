package com.skillsphere.repository;

import com.skillsphere.entity.Quiz;
import com.skillsphere.entity.User;
import com.skillsphere.entity.QuizResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByStudent(User student);
    List<QuizResult> findByQuiz(Quiz quiz);
    Optional<QuizResult> findByQuizAndStudent(Quiz quiz, User student);
    List<QuizResult> findTop5ByQuizCourseMentorIdOrderByCompletedAtDesc(Long mentorId);
    long countByStudentIdAndQuizCourseId(Long studentId, Long courseId);
    long countByStudentId(Long studentId);
}
