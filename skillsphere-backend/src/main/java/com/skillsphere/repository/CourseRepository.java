package com.skillsphere.repository;

import com.skillsphere.entity.Course;
import com.skillsphere.entity.User;
import com.skillsphere.enums.CourseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByMentor(User mentor);
    long countByMentorId(Long mentorId);
    long countByMentorIdAndStatus(Long mentorId, CourseStatus status);
    List<Course> findByStatus(CourseStatus status);
    long countByStatus(CourseStatus status);
    Optional<Course> findByIdAndMentor(Long id, User mentor);
    Optional<Course> findByIdAndStatus(Long id, CourseStatus status);
    List<Course> findByTitleContainingIgnoreCaseAndStatus(String title, CourseStatus status);
    List<Course> findByCategoryAndStatus(String category, CourseStatus status);
    List<Course> findByTitleContainingIgnoreCaseAndCategoryAndStatus(String title, String category, CourseStatus status);

    long countByMentorIdAndStatusIn(Long mentorId, List<CourseStatus> statuses);
    long countByStatusIn(List<CourseStatus> statuses);

    List<Course> findByStatusIn(List<CourseStatus> statuses);
    Optional<Course> findByIdAndStatusIn(Long id, List<CourseStatus> statuses);
    List<Course> findByTitleContainingIgnoreCaseAndStatusIn(String title, List<CourseStatus> statuses);
    List<Course> findByCategoryAndStatusIn(String category, List<CourseStatus> statuses);
    List<Course> findByCategoryContainingIgnoreCaseAndStatusIn(String category, List<CourseStatus> statuses);
    List<Course> findByTitleContainingIgnoreCaseAndCategoryAndStatusIn(String title, String category, List<CourseStatus> statuses);

    @Query("SELECT c FROM Course c WHERE c.status IN :statuses AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.skills) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.tags) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.mentor.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Course> searchCourses(@Param("search") String search, @Param("statuses") List<CourseStatus> statuses);

    @Query("SELECT c FROM Course c WHERE c.status IN :statuses AND " +
           "LOWER(c.category) LIKE LOWER(CONCAT('%', :category, '%')) AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.skills) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.tags) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.mentor.fullName) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Course> searchCoursesWithCategory(@Param("search") String search, @Param("category") String category, @Param("statuses") List<CourseStatus> statuses);
}
