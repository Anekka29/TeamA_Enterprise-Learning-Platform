package com.skillsphere.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillsphere.ai.provider.AIProvider;
import com.skillsphere.dto.LearningRoadmapResponse;
import com.skillsphere.dto.RoadmapStage;
import com.skillsphere.entity.AIChatHistory;
import com.skillsphere.entity.AssignmentSubmission;
import com.skillsphere.entity.Enrollment;
import com.skillsphere.entity.LearningRoadmap;
import com.skillsphere.entity.LessonCompletion;
import com.skillsphere.entity.QuizResult;
import com.skillsphere.entity.SkillGapAnalysis;
import com.skillsphere.entity.StudentProfile;
import com.skillsphere.entity.User;
import com.skillsphere.exception.AIServiceException;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.AIChatHistoryRepository;
import com.skillsphere.repository.AssignmentSubmissionRepository;
import com.skillsphere.repository.EnrollmentRepository;
import com.skillsphere.repository.LearningRoadmapRepository;
import com.skillsphere.repository.LessonCompletionRepository;
import com.skillsphere.repository.QuizResultRepository;
import com.skillsphere.repository.SkillGapAnalysisRepository;
import com.skillsphere.repository.StudentProfileRepository;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.LearningRoadmapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningRoadmapServiceImpl implements LearningRoadmapService {

    private final LearningRoadmapRepository learningRoadmapRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final SkillGapAnalysisRepository skillGapAnalysisRepository;
    private final QuizResultRepository quizResultRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final AIChatHistoryRepository aiChatHistoryRepository;
    private final LessonCompletionRepository lessonCompletionRepository;
    private final UserRepository userRepository;
    private final AIProvider aiProvider;
    private final ObjectMapper objectMapper;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Loading current user for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        log.info("Step 2/10: User loaded: id={}, email={}, fullName={}", user.getId(), user.getEmail(), user.getFullName());
        return user;
    }

    private String buildPrompt(User user, StudentProfile profile, List<Enrollment> enrollments,
                               List<SkillGapAnalysis> skillGaps, List<QuizResult> quizResults,
                               List<AssignmentSubmission> submissions, List<AIChatHistory> chatHistory,
                               long completedLessonsCount, String targetTopic) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an expert AI Career & Learning Roadmap Consultant for SkillSphere.\n");
        prompt.append("Generate a highly personalized, dynamic learning roadmap for the student in STRICT JSON format.\n");
        prompt.append("Use ALL real performance and learning data provided below from the database. Do NOT make static assumptions.\n");
        prompt.append("Do NOT include any text before or after the JSON.\n\n");

        if (targetTopic != null && !targetTopic.isBlank()) {
            prompt.append("=== PRIMARY SPECIFIC TARGET TOPIC FOCUS ===\n");
            prompt.append("STUDENT REQUESTED TARGET TOPIC: ").append(targetTopic).append("\n");
            prompt.append("CRITICAL: Every stage, weekly milestone, project, interview question, resource, and certification MUST focus on: ").append(targetTopic).append(".\n\n");
        }

        prompt.append("The JSON MUST strictly conform to the following schema:\n");
        prompt.append("{\n");
        prompt.append("  \"goal\": \"[Dynamic Career Goal & Summary for ").append(targetTopic != null && !targetTopic.isBlank() ? targetTopic : "Target Topic").append("]\",\n");
        prompt.append("  \"estimatedDuration\": \"[Estimated Duration, e.g., '6 Months']\",\n");
        prompt.append("  \"stages\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"title\": \"[Stage Title]\",\n");
        prompt.append("      \"description\": \"[Monthly Plan & Weekly Milestones: Week 1, Week 2, Week 3, Week 4]\",\n");
        prompt.append("      \"skills\": [\"[Skill 1]\", \"[Skill 2]\"],\n");
        prompt.append("      \"recommendedTopics\": [\"[Project / Interview Prep / Resource / Certification]\"],\n");
        prompt.append("      \"estimatedDuration\": \"[Stage Duration, e.g., 'Month 1 (4 Weeks)']\",\n");
        prompt.append("      \"status\": \"PENDING\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n\n");

        prompt.append("=== 1. STUDENT PROFILE & RESUME SKILLS ===\n");
        prompt.append("Name: ").append(user.getFullName()).append("\n");
        prompt.append("Email: ").append(user.getEmail()).append("\n");
        prompt.append("College: ").append(profile != null && profile.getCollege() != null ? profile.getCollege() : "SkillSphere Academy").append("\n");
        prompt.append("Degree & Dept: ").append(profile != null && profile.getDegree() != null ? profile.getDegree() : "B.Tech").append(" - ").append(profile != null && profile.getDepartment() != null ? profile.getDepartment() : "Computer Science").append("\n");
        prompt.append("Academic Year: ").append(profile != null && profile.getCurrentYear() != null ? profile.getCurrentYear() : "Undergraduate").append("\n");
        prompt.append("Target Career Goal: ").append(profile != null && profile.getCareerGoal() != null ? profile.getCareerGoal() : "Software Development Engineer").append("\n");
        prompt.append("Extracted Resume Skills: ").append(profile != null && profile.getSkills() != null ? profile.getSkills() : "Programming & Problem Solving").append("\n");
        prompt.append("Skill Interests: ").append(profile != null && profile.getInterests() != null ? profile.getInterests() : "Web Development, AI, Cloud").append("\n");
        prompt.append("Bio Summary: ").append(profile != null && profile.getBio() != null ? profile.getBio() : "Active student").append("\n\n");

        prompt.append("=== 2. ENROLLED & COMPLETED COURSES ===\n");
        List<String> completedCourses = new ArrayList<>();
        List<String> ongoingCourses = new ArrayList<>();
        double totalProgSum = 0;
        for (Enrollment e : enrollments) {
            int prog = e.getProgress() != null ? e.getProgress() : 0;
            totalProgSum += prog;
            String courseTitle = e.getCourse() != null ? e.getCourse().getTitle() : "Course";
            if (prog >= 100) {
                completedCourses.add(courseTitle);
            } else {
                ongoingCourses.add(courseTitle + " (" + prog + "% completed, " + (e.getLessonsCompleted() != null ? e.getLessonsCompleted() : 0) + " lessons finished)");
            }
        }
        double avgProgress = enrollments.isEmpty() ? 0.0 : (totalProgSum / enrollments.size());
        prompt.append("Completed Courses: ").append(completedCourses.isEmpty() ? "None" : String.join(", ", completedCourses)).append("\n");
        prompt.append("Active Ongoing Courses: ").append(ongoingCourses.isEmpty() ? "None" : String.join("; ", ongoingCourses)).append("\n");
        prompt.append("Total Platform Lessons Completed: ").append(completedLessonsCount).append("\n");
        prompt.append("Average Course Completion Progress: ").append(String.format("%.1f%%", avgProgress)).append("\n\n");

        prompt.append("=== 3. SKILL GAP ANALYSIS ===\n");
        if (skillGaps != null && !skillGaps.isEmpty()) {
            SkillGapAnalysis sg = skillGaps.get(0);
            prompt.append("Target Role: ").append(sg.getTargetRole() != null ? sg.getTargetRole() : "Target Role").append("\n");
            prompt.append("Missing Skills: ").append(sg.getMissingSkillsJson() != null ? sg.getMissingSkillsJson() : "None").append("\n");
            prompt.append("Priority Focus Skills: ").append(sg.getPrioritySkillsJson() != null ? sg.getPrioritySkillsJson() : "Core Skills").append("\n");
            prompt.append("Skill Gap Recommendations: ").append(sg.getRecommendationsJson() != null ? sg.getRecommendationsJson() : "N/A").append("\n\n");
        } else {
            prompt.append("No explicit skill gap record. Bridge current skills (").append(profile != null && profile.getSkills() != null ? profile.getSkills() : "Basic").append(") to target goal.\n\n");
        }

        prompt.append("=== 4. QUIZ PERFORMANCE METRICS ===\n");
        if (quizResults != null && !quizResults.isEmpty()) {
            int totalQuizzes = quizResults.size();
            long passedQuizzes = 0;
            double scoreSum = 0;
            for (QuizResult qr : quizResults) {
                int s = qr.getScore() != null ? qr.getScore() : 0;
                int t = qr.getTotalPoints() != null && qr.getTotalPoints() > 0 ? qr.getTotalPoints() : 100;
                double pct = (double) s / t * 100.0;
                scoreSum += pct;
                if (pct >= 60.0) passedQuizzes++;
            }
            double avgScore = scoreSum / totalQuizzes;
            prompt.append("Total Quizzes Attempted: ").append(totalQuizzes).append("\n");
            prompt.append("Passed Quizzes: ").append(passedQuizzes).append(" / ").append(totalQuizzes).append("\n");
            prompt.append("Average Quiz Score: ").append(String.format("%.1f%%", avgScore)).append("\n");
            prompt.append("Recent Quiz Scores: ");
            for (int i = 0; i < Math.min(5, quizResults.size()); i++) {
                QuizResult qr = quizResults.get(i);
                String qTitle = qr.getQuiz() != null ? qr.getQuiz().getTitle() : "Quiz";
                int s = qr.getScore() != null ? qr.getScore() : 0;
                int t = qr.getTotalPoints() != null && qr.getTotalPoints() > 0 ? qr.getTotalPoints() : 100;
                int pct = (int) Math.round((double) s / t * 100.0);
                prompt.append(qTitle).append(" (").append(pct).append("%), ");
            }
            prompt.append("\n\n");
        } else {
            prompt.append("No quiz attempts recorded yet.\n\n");
        }

        prompt.append("=== 5. PRACTICE & ASSIGNMENT RESULTS ===\n");
        if (submissions != null && !submissions.isEmpty()) {
            prompt.append("Total Submissions: ").append(submissions.size()).append("\n");
            prompt.append("Recent Submissions: ");
            for (int i = 0; i < Math.min(5, submissions.size()); i++) {
                AssignmentSubmission sub = submissions.get(i);
                String aTitle = sub.getAssignment() != null ? sub.getAssignment().getTitle() : "Assignment";
                prompt.append(aTitle).append(" [Grade: ").append(sub.getGrade() != null ? sub.getGrade() : "Submitted").append("], ");
            }
            prompt.append("\n\n");
        } else {
            prompt.append("No practice submissions recorded yet.\n\n");
        }

        prompt.append("=== 6. AI TUTOR CONVERSATION HISTORY ===\n");
        if (chatHistory != null && !chatHistory.isEmpty()) {
            prompt.append("Recent Topics Asked to AI Tutor: ");
            for (int i = 0; i < Math.min(5, chatHistory.size()); i++) {
                AIChatHistory ch = chatHistory.get(i);
                prompt.append("\"").append(ch.getUserMessage()).append("\"; ");
            }
            prompt.append("\n\n");
        } else {
            prompt.append("No AI tutor conversation history recorded yet.\n\n");
        }

        prompt.append("=== GENERATION DIRECTIVES ===\n");
        if (targetTopic != null && !targetTopic.isBlank()) {
            prompt.append("1. FOCUS TOPIC: The entire roadmap MUST be specifically designed around mastering '").append(targetTopic).append("'.\n");
        } else {
            prompt.append("1. Analyze the student's Quiz Scores, Practice Submissions, AI Tutor Questions, and Skill Gap.\n");
        }
        prompt.append("2. Generate 4 to 6 monthly stages that address weak quiz topics, missing skills, and build on completed courses.\n");
        prompt.append("3. Return ONLY valid JSON matching the schema.");

        return prompt.toString();
    }

    @Override
    @Transactional
    public LearningRoadmapResponse generateRoadmap() {
        return generateRoadmap(null);
    }

    @Override
    @Transactional
    public LearningRoadmapResponse generateRoadmap(String targetTopic) {
        log.info("Step 1/10: Dynamic Roadmap request received in LearningRoadmapServiceImpl with targetTopic='{}'", targetTopic);
        User user = getCurrentUser();

        log.info("Step 3/10: Loading student profile for userId={}", user.getId());
        StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);

        log.info("Step 4/10: Querying multi-repository student performance data for userId={}...", user.getId());
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(user.getId());
        List<SkillGapAnalysis> skillGaps = skillGapAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
        List<QuizResult> quizResults = quizResultRepository.findByStudent(user);
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByStudentId(user.getId());
        List<AIChatHistory> chatHistory = aiChatHistoryRepository.findTop10ByUserOrderByCreatedAtDesc(user);
        long completedLessonsCount = lessonCompletionRepository.countByStudentId(user.getId());

        log.info("Loaded Data Metrics: Enrollments={}, SkillGaps={}, Quizzes={}, PracticeSubmissions={}, AIChatHistory={}, CompletedLessons={}",
                enrollments.size(), skillGaps.size(), quizResults.size(), submissions.size(), chatHistory.size(), completedLessonsCount);

        // Build prompt
        log.info("Step 5/10: Generating dynamic AI prompt with complete multi-repository database context...");
        String prompt = buildPrompt(user, profile, enrollments, skillGaps, quizResults, submissions, chatHistory, completedLessonsCount, targetTopic);
        log.info("Prompt generated successfully (length: {} chars)", prompt.length());
        log.debug("Prompt content:\n{}", prompt);

        // Call AI provider
        log.info("Step 6/10: Sending prompt request to AI provider...");
        String response = aiProvider.generateResponse(new ArrayList<>(), prompt);
        log.info("Step 7/10: AI response received successfully (length: {} chars)", response != null ? response.length() : 0);
        log.debug("AI raw response:\n{}", response);

        try {
            log.info("Step 8/10: Parsing JSON response from AI output...");
            String jsonResponse = extractJson(response);
            var jsonNode = objectMapper.readTree(jsonResponse);

            String goal = jsonNode.hasNonNull("goal")
                    ? jsonNode.get("goal").asText()
                    : "Personalized Learning Roadmap for " + user.getFullName();

            String estimatedDuration = jsonNode.hasNonNull("estimatedDuration")
                    ? jsonNode.get("estimatedDuration").asText()
                    : "6 Months";

            List<RoadmapStage> stages = new ArrayList<>();
            if (jsonNode.has("stages") && jsonNode.get("stages").isArray()) {
                stages = objectMapper.readValue(
                        jsonNode.get("stages").toString(),
                        new TypeReference<List<RoadmapStage>>() {}
                );
            }

            log.info("JSON parsing completed successfully: goal='{}', duration='{}', stagesCount={}", goal, estimatedDuration, stages.size());

            String stagesJson = objectMapper.writeValueAsString(stages);

            log.info("Step 9/10: Persisting fresh LearningRoadmap entity to MySQL for userId={}...", user.getId());

            LearningRoadmap roadmap = LearningRoadmap.builder()
                    .user(user)
                    .goal(goal)
                    .estimatedDuration(estimatedDuration)
                    .stagesJson(stagesJson)
                    .prompt(prompt)
                    .status("ACTIVE")
                    .build();

            LearningRoadmap saved = learningRoadmapRepository.save(roadmap);
            log.info("Database persistence successful. LearningRoadmap ID: {}, CreatedAt: {}", saved.getId(), saved.getCreatedAt());

            log.info("Step 10/10: Returning LearningRoadmapResponse DTO to caller.");
            return LearningRoadmapResponse.builder()
                    .id(saved.getId())
                    .goal(saved.getGoal())
                    .estimatedDuration(saved.getEstimatedDuration())
                    .stages(stages)
                    .createdAt(saved.getCreatedAt())
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse or process AI roadmap response", e);
            throw new AIServiceException("Failed to generate valid learning roadmap: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public LearningRoadmapResponse improveRoadmap(Long roadmapId) {
        log.info("Step 1/10: Smart Roadmap Improvement request received for roadmapId={}", roadmapId);
        User user = getCurrentUser();

        LearningRoadmap existingRoadmap = learningRoadmapRepository.findById(roadmapId)
                .orElse(learningRoadmapRepository.findTopByUserOrderByCreatedAtDesc(user).orElse(null));

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId()).orElse(null);
        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(user.getId());
        List<SkillGapAnalysis> skillGaps = skillGapAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
        List<QuizResult> quizResults = quizResultRepository.findByStudent(user);
        List<AssignmentSubmission> submissions = assignmentSubmissionRepository.findByStudentId(user.getId());
        List<AIChatHistory> chatHistory = aiChatHistoryRepository.findTop10ByUserOrderByCreatedAtDesc(user);
        long completedLessonsCount = lessonCompletionRepository.countByStudentId(user.getId());

        log.info("Generating smart evolution prompt considering completed milestones, progress, enrollments, quiz results, practice submissions, and profile updates...");
        String prompt = buildEvolutionPrompt(user, profile, enrollments, skillGaps, quizResults, submissions, chatHistory, completedLessonsCount, existingRoadmap);
        log.info("Evolution prompt generated successfully (length: {} chars)", prompt.length());

        log.info("Sending evolution prompt to AI provider...");
        String response = aiProvider.generateResponse(new ArrayList<>(), prompt);
        log.info("AI provider evolution response received.");

        try {
            String jsonResponse = extractJson(response);
            var jsonNode = objectMapper.readTree(jsonResponse);

            String goal = jsonNode.hasNonNull("goal")
                    ? jsonNode.get("goal").asText()
                    : (existingRoadmap != null ? existingRoadmap.getGoal() : "Evolved Career Roadmap");

            String estimatedDuration = jsonNode.hasNonNull("estimatedDuration")
                    ? jsonNode.get("estimatedDuration").asText()
                    : "6 Months";

            List<RoadmapStage> stages = new ArrayList<>();
            if (jsonNode.has("stages") && jsonNode.get("stages").isArray()) {
                stages = objectMapper.readValue(
                        jsonNode.get("stages").toString(),
                        new TypeReference<List<RoadmapStage>>() {}
                );
            }

            String stagesJson = objectMapper.writeValueAsString(stages);

            log.info("Saving evolved roadmap to MySQL database as a new version...");
            LearningRoadmap evolvedRoadmap = LearningRoadmap.builder()
                    .user(user)
                    .goal(goal)
                    .estimatedDuration(estimatedDuration)
                    .stagesJson(stagesJson)
                    .prompt(prompt)
                    .status("ACTIVE")
                    .build();

            LearningRoadmap saved = learningRoadmapRepository.save(evolvedRoadmap);
            log.info("Smart evolution roadmap saved successfully. New LearningRoadmap ID: {}", saved.getId());

            return LearningRoadmapResponse.builder()
                    .id(saved.getId())
                    .goal(saved.getGoal())
                    .estimatedDuration(saved.getEstimatedDuration())
                    .stages(stages)
                    .createdAt(saved.getCreatedAt())
                    .build();

        } catch (Exception e) {
            log.error("Failed to improve roadmap for roadmapId={}", roadmapId, e);
            throw new AIServiceException("Failed to evolve learning roadmap: " + e.getMessage());
        }
    }

    private String buildEvolutionPrompt(User user, StudentProfile profile, List<Enrollment> enrollments,
                                      List<SkillGapAnalysis> skillGaps, List<QuizResult> quizResults,
                                      List<AssignmentSubmission> submissions, List<AIChatHistory> chatHistory,
                                      long completedLessonsCount, LearningRoadmap existingRoadmap) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an expert AI Career & Learning Roadmap Consultant for SkillSphere.\n");
        prompt.append("Perform a SMART EVOLUTION of an existing roadmap for a student. Do NOT replace or repeat completed milestones!\n");
        prompt.append("Generate the evolved learning roadmap in STRICT JSON format matching the schema exactly.\n");
        prompt.append("Do NOT include any text before or after the JSON.\n\n");

        prompt.append("The JSON MUST strictly conform to the following schema:\n");
        prompt.append("{\n");
        prompt.append("  \"goal\": \"[Updated Career Summary & Goal]\",\n");
        prompt.append("  \"estimatedDuration\": \"[Revised Total Estimated Duration]\",\n");
        prompt.append("  \"stages\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"title\": \"[Stage Title]\",\n");
        prompt.append("      \"description\": \"[Monthly Plan & Weekly Milestones]\",\n");
        prompt.append("      \"skills\": [\"[Skill 1]\", \"[Skill 2]\"],\n");
        prompt.append("      \"recommendedTopics\": [\"[Project / Interview Prep / Resource / Certification]\"],\n");
        prompt.append("      \"estimatedDuration\": \"[Stage Duration]\",\n");
        prompt.append("      \"status\": \"[COMPLETED | IN_PROGRESS | PENDING]\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n\n");

        prompt.append("=== EXISTING ROADMAP & COMPLETED PROGRESS ===\n");
        if (existingRoadmap != null && existingRoadmap.getStagesJson() != null) {
            try {
                List<RoadmapStage> existingStages = objectMapper.readValue(
                        existingRoadmap.getStagesJson(),
                        new TypeReference<List<RoadmapStage>>() {}
                );
                for (int i = 0; i < existingStages.size(); i++) {
                    RoadmapStage st = existingStages.get(i);
                    String stStatus = st.getStatus() != null ? st.getStatus() : "PENDING";
                    prompt.append("Existing Stage ").append(i + 1).append(": ").append(st.getTitle())
                            .append(" [Status: ").append(stStatus).append("]\n");
                }
            } catch (Exception e) {
                prompt.append("Existing Goal: ").append(existingRoadmap.getGoal()).append("\n");
            }
        }

        prompt.append("\n=== UPDATED STUDENT PROFILE & CONTEXT ===\n");
        prompt.append("1. Student Name: ").append(user.getFullName()).append("\n");
        prompt.append("2. Department: ").append(profile != null && profile.getDepartment() != null ? profile.getDepartment() : "Engineering").append("\n");
        prompt.append("3. College: ").append(profile != null && profile.getCollege() != null ? profile.getCollege() : "SkillSphere Academy").append("\n");
        prompt.append("4. Target Career Goal: ").append(profile != null && profile.getCareerGoal() != null ? profile.getCareerGoal() : "Software Developer").append("\n");
        prompt.append("5. Current Skills (Updated): ").append(profile != null && profile.getSkills() != null ? profile.getSkills() : "Programming").append("\n");
        prompt.append("6. Interested Technologies (Updated): ").append(profile != null && profile.getInterests() != null ? profile.getInterests() : "Web & Cloud").append("\n");

        // Enrollments
        List<String> courseList = new ArrayList<>();
        for (Enrollment e : enrollments) {
            String title = e.getCourse() != null ? e.getCourse().getTitle() : "Course";
            courseList.add(title + " (" + (e.getProgress() != null ? e.getProgress() : 0) + "% progress)");
        }
        prompt.append("7. Current Enrolled Courses & Progress: ").append(courseList.isEmpty() ? "None" : String.join("; ", courseList)).append("\n\n");

        prompt.append("=== CRITICAL EVOLUTION INSTRUCTIONS ===\n");
        prompt.append("1. Retain all stages marked as 'COMPLETED' or 'IN_PROGRESS' at the beginning of the stages list so student history is preserved.\n");
        prompt.append("2. Replace or refine remaining 'PENDING' stages with advanced next-step milestones considering new course enrollments and skill gaps.\n");
        prompt.append("3. Ensure output is valid JSON only.");

        return prompt.toString();
    }

    private String extractJson(String text) {
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("AI response is empty");
        }
        String cleaned = text.trim();

        // Strip markdown code fences if present
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();

        int start = cleaned.indexOf('{');
        int end = cleaned.lastIndexOf('}');
        if (start == -1 || end == -1 || end < start) {
            throw new IllegalArgumentException("No valid JSON object found in AI response");
        }
        return cleaned.substring(start, end + 1);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningRoadmapResponse> getMyRoadmaps() {
        User user = getCurrentUser();
        log.info("Fetching roadmaps for user ID: {}", user.getId());
        return learningRoadmapRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LearningRoadmapResponse updateStageStatus(Long roadmapId, int stageIndex, String status) {
        User user = getCurrentUser();
        log.info("Updating stage status for roadmapId={}, stageIndex={}, status={}", roadmapId, stageIndex, status);

        LearningRoadmap roadmap = learningRoadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new IllegalArgumentException("Roadmap not found with id: " + roadmapId));

        if (!roadmap.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Unauthorized access to roadmap ID: " + roadmapId);
        }

        try {
            List<RoadmapStage> stages = objectMapper.readValue(
                    roadmap.getStagesJson(),
                    new TypeReference<List<RoadmapStage>>() {}
            );

            if (stageIndex < 0 || stageIndex >= stages.size()) {
                throw new IllegalArgumentException("Invalid stage index: " + stageIndex);
            }

            RoadmapStage targetStage = stages.get(stageIndex);
            String normalizedStatus = status != null ? status.toUpperCase() : "PENDING";
            targetStage.setStatus(normalizedStatus);

            String updatedStagesJson = objectMapper.writeValueAsString(stages);
            roadmap.setStagesJson(updatedStagesJson);

            LearningRoadmap saved = learningRoadmapRepository.save(roadmap);
            log.info("Successfully updated stage status for roadmapId={}, stageIndex={}, status={}", roadmapId, stageIndex, normalizedStatus);

            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("Failed to update stage status for roadmapId={}", roadmapId, e);
            throw new AIServiceException("Failed to update stage status: " + e.getMessage());
        }
    }

    private LearningRoadmapResponse mapToResponse(LearningRoadmap roadmap) {
        try {
            List<RoadmapStage> stages = objectMapper.readValue(
                    roadmap.getStagesJson(),
                    new TypeReference<List<RoadmapStage>>() {}
            );

            return LearningRoadmapResponse.builder()
                    .id(roadmap.getId())
                    .goal(roadmap.getGoal())
                    .estimatedDuration(roadmap.getEstimatedDuration())
                    .stages(stages)
                    .createdAt(roadmap.getCreatedAt())
                    .build();
        } catch (Exception e) {
            log.error("Failed to deserialize roadmap stages for roadmap ID={}", roadmap.getId(), e);
            throw new RuntimeException("Failed to read roadmap data", e);
        }
    }
}
