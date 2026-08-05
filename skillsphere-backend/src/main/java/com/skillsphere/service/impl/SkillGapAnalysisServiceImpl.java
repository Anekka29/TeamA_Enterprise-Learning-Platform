package com.skillsphere.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillsphere.ai.provider.AIProvider;
import com.skillsphere.dto.SkillGapAnalysisRequest;
import com.skillsphere.dto.SkillGapAnalysisResponse;
import com.skillsphere.dto.SuggestedCourse;
import com.skillsphere.entity.AssignmentSubmission;
import com.skillsphere.entity.Course;
import com.skillsphere.entity.Enrollment;
import com.skillsphere.entity.QuizResult;
import com.skillsphere.entity.SkillGapAnalysis;
import com.skillsphere.entity.StudentProfile;
import com.skillsphere.entity.User;
import com.skillsphere.enums.CourseStatus;
import com.skillsphere.exception.AIServiceException;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.AssignmentSubmissionRepository;
import com.skillsphere.repository.CourseRepository;
import com.skillsphere.repository.EnrollmentRepository;
import com.skillsphere.repository.LessonCompletionRepository;
import com.skillsphere.repository.QuizResultRepository;
import com.skillsphere.repository.SkillGapAnalysisRepository;
import com.skillsphere.repository.StudentProfileRepository;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.SkillGapAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillGapAnalysisServiceImpl implements SkillGapAnalysisService {

    private final SkillGapAnalysisRepository skillGapAnalysisRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final QuizResultRepository quizResultRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final UserRepository userRepository;
    private final AIProvider aiProvider;
    private final ObjectMapper objectMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    private String extractJson(String text) {
        int start = text.indexOf('{');
        int end = text.lastIndexOf('}');
        if (start == -1 || end == -1 || end < start) {
            throw new IllegalArgumentException("No valid JSON found in response");
        }
        return text.substring(start, end + 1);
    }

    private List<SuggestedCourse> matchCourses(List<String> missingSkills, List<String> prioritySkills) {
        List<Course> allPublishedCourses = courseRepository.findByStatusIn(List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED));
        Set<String> searchKeywords = new HashSet<>();
        for (String skill : missingSkills) {
            searchKeywords.add(skill.toLowerCase());
        }
        for (String skill : prioritySkills) {
            searchKeywords.add(skill.toLowerCase());
        }

        List<SuggestedCourse> matchedCourses = new ArrayList<>();
        for (Course course : allPublishedCourses) {
            int matchCount = 0;
            String courseText = (course.getTitle() + " " + course.getDescription() + " " + course.getCategory() + " " + course.getLevel()).toLowerCase();
            for (String keyword : searchKeywords) {
                if (courseText.contains(keyword)) {
                    matchCount++;
                }
            }
            if (matchCount > 0 || matchedCourses.size() < 3) {
                matchedCourses.add(SuggestedCourse.builder()
                        .id(course.getId())
                        .title(course.getTitle())
                        .category(course.getCategory())
                        .level(course.getLevel())
                        .description(course.getShortDescription() != null ? course.getShortDescription() : course.getDescription())
                        .build());
            }
        }

        return matchedCourses.stream()
                .limit(5)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SkillGapAnalysisResponse analyze(SkillGapAnalysisRequest request) {
        User user = getCurrentUser();
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
        
        // Multi-source skill aggregation
        Set<String> accumulatedSkills = new LinkedHashSet<>();
        
        if (profile != null && profile.getSkills() != null) {
            Arrays.stream(profile.getSkills().split("[,;|]"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(accumulatedSkills::add);
        }
        if (profile != null && profile.getInterests() != null) {
            Arrays.stream(profile.getInterests().split("[,;|]"))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .forEach(accumulatedSkills::add);
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(user.getId());
        for (Enrollment e : enrollments) {
            if (e.getCourse() != null) {
                accumulatedSkills.add(e.getCourse().getTitle());
                if (e.getCourse().getCategory() != null) accumulatedSkills.add(e.getCourse().getCategory());
            }
        }

        List<QuizResult> quizResults = quizResultRepository.findByStudent(user);
        for (QuizResult qr : quizResults) {
            int s = qr.getScore() != null ? qr.getScore() : 0;
            int t = qr.getTotalPoints() != null && qr.getTotalPoints() > 0 ? qr.getTotalPoints() : 100;
            if (((double) s / t * 100.0) >= 60.0 && qr.getQuiz() != null) {
                accumulatedSkills.add(qr.getQuiz().getTitle());
            }
        }

        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByStudentId(user.getId());
        for (AssignmentSubmission sub : submissions) {
            if (sub.getAssignment() != null) {
                accumulatedSkills.add(sub.getAssignment().getTitle());
            }
        }

        List<String> currentSkills = new ArrayList<>(accumulatedSkills);
        if (currentSkills.isEmpty()) {
            currentSkills.add("Software Engineering Fundamentals");
            currentSkills.add("Problem Solving");
        }

        // Get published courses
        List<Course> publishedCourses = courseRepository.findByStatusIn(List.of(CourseStatus.APPROVED, CourseStatus.PUBLISHED));
        StringBuilder coursesInfo = new StringBuilder();
        for (Course course : publishedCourses) {
            coursesInfo.append("- ").append(course.getTitle())
                    .append(" (Category: ").append(course.getCategory())
                    .append(", Level: ").append(course.getLevel())
                    .append("): ").append(course.getShortDescription() != null ? course.getShortDescription() : course.getDescription())
                    .append("\n");
        }

        // Build prompt
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert Enterprise Skill Gap Analyzer for SkillSphere.\n");
        prompt.append("Perform a comprehensive skill gap analysis for the student targeting the role: ").append(request.getTargetRole()).append(".\n");
        prompt.append("Compare student's current multi-source skills profile against industry standards for ").append(request.getTargetRole()).append(".\n");
        prompt.append("Return ONLY a valid JSON object matching this schema:\n");
        prompt.append("{\n");
        prompt.append("  \"currentSkills\": [\"skill1\", \"skill2\"],\n");
        prompt.append("  \"requiredSkills\": [\"requiredSkill1\", \"requiredSkill2\"],\n");
        prompt.append("  \"missingSkills\": [\"missingSkill1\", \"missingSkill2\"],\n");
        prompt.append("  \"prioritySkills\": [\"prioritySkill1\", \"prioritySkill2\"],\n");
        prompt.append("  \"recommendations\": [\"rec1\", \"rec2\"],\n");
        prompt.append("  \"suggestedCourseKeywords\": [\"keyword1\", \"keyword2\"]\n");
        prompt.append("}\n\n");
        prompt.append("Target Role: ").append(request.getTargetRole()).append("\n");
        prompt.append("Student's Accumulated Multi-Source Skills: ").append(String.join(", ", currentSkills)).append("\n\n");
        prompt.append("Available SkillSphere Courses:\n").append(coursesInfo).append("\n");
        prompt.append("When generating suggestedCourseKeywords, include terms that can help match against the course titles and descriptions above.");

        // Call AI provider
        String aiResponse = aiProvider.generateResponse(new ArrayList<>(), prompt.toString());

        try {
            // Parse response
            String jsonResponse = extractJson(aiResponse);
            Map<String, Object> parsedResponse = objectMapper.readValue(jsonResponse, new TypeReference<Map<String, Object>>() {});

            // Extract fields
            List<String> currentSkillsFromAI = (List<String>) parsedResponse.get("currentSkills");
            List<String> requiredSkills = (List<String>) parsedResponse.get("requiredSkills");
            List<String> missingSkills = (List<String>) parsedResponse.get("missingSkills");
            List<String> prioritySkills = (List<String>) parsedResponse.get("prioritySkills");
            List<String> recommendations = (List<String>) parsedResponse.get("recommendations");
            List<String> suggestedCourseKeywords = (List<String>) parsedResponse.get("suggestedCourseKeywords");

            // Match courses using backend logic
            List<SuggestedCourse> suggestedCourses = matchCourses(missingSkills, prioritySkills);

            // Save analysis to DB
            SkillGapAnalysis analysis = SkillGapAnalysis.builder()
                    .user(user)
                    .targetRole(request.getTargetRole())
                    .currentSkillsJson(objectMapper.writeValueAsString(currentSkillsFromAI))
                    .requiredSkillsJson(objectMapper.writeValueAsString(requiredSkills))
                    .missingSkillsJson(objectMapper.writeValueAsString(missingSkills))
                    .prioritySkillsJson(objectMapper.writeValueAsString(prioritySkills))
                    .recommendationsJson(objectMapper.writeValueAsString(recommendations))
                    .suggestedCoursesJson(objectMapper.writeValueAsString(suggestedCourses))
                    .build();
            SkillGapAnalysis saved = skillGapAnalysisRepository.save(analysis);

            return SkillGapAnalysisResponse.builder()
                    .id(saved.getId())
                    .targetRole(saved.getTargetRole())
                    .currentSkills(currentSkillsFromAI)
                    .requiredSkills(requiredSkills)
                    .missingSkills(missingSkills)
                    .prioritySkills(prioritySkills)
                    .recommendations(recommendations)
                    .suggestedCourses(suggestedCourses)
                    .createdAt(saved.getCreatedAt())
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse skill gap analysis response", e);
            throw new AIServiceException("Failed to generate skill gap analysis: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SkillGapAnalysisResponse> getMyAnalyses() {
        User user = getCurrentUser();
        return skillGapAnalysisRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SkillGapAnalysisResponse mapToResponse(SkillGapAnalysis analysis) {
        try {
            return SkillGapAnalysisResponse.builder()
                    .id(analysis.getId())
                    .targetRole(analysis.getTargetRole())
                    .currentSkills(objectMapper.readValue(analysis.getCurrentSkillsJson(), new TypeReference<List<String>>() {}))
                    .requiredSkills(objectMapper.readValue(analysis.getRequiredSkillsJson(), new TypeReference<List<String>>() {}))
                    .missingSkills(objectMapper.readValue(analysis.getMissingSkillsJson(), new TypeReference<List<String>>() {}))
                    .prioritySkills(objectMapper.readValue(analysis.getPrioritySkillsJson(), new TypeReference<List<String>>() {}))
                    .recommendations(objectMapper.readValue(analysis.getRecommendationsJson(), new TypeReference<List<String>>() {}))
                    .suggestedCourses(objectMapper.readValue(analysis.getSuggestedCoursesJson(), new TypeReference<List<SuggestedCourse>>() {}))
                    .createdAt(analysis.getCreatedAt())
                    .build();
        } catch (Exception e) {
            log.error("Failed to deserialize skill gap analysis", e);
            throw new RuntimeException("Failed to read analysis data", e);
        }
    }
}
