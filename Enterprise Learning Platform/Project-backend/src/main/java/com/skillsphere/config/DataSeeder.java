package com.skillsphere.config;

import com.skillsphere.entity.*;
import com.skillsphere.enums.CourseStatus;
import com.skillsphere.enums.NotificationType;
import com.skillsphere.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final ResourceRepository resourceRepository;
    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final ComplaintRepository complaintRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final InternshipRepository internshipRepository;
    private final NotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Bean
    @Order(2)
    public CommandLineRunner seedProjectData() {
        return args -> {
            log.info("Checking SkillSphere initial data seeding requirements...");

            // Ensure core admin, mentor, and student users are seeded if missing
            User admin = seedUserIfMissing("tsanekka@gmail.com", "System Admin", "tsanekka", "admin123", com.skillsphere.enums.Role.ADMIN);
            seedUserIfMissing("admin@skillsphere.com", "Enterprise Admin", "admin", "admin123", com.skillsphere.enums.Role.ADMIN);
            User mentor = seedUserIfMissing("saarvesh@gmail.com", "Saarvesh Mentor", "saarvesh", "password123", com.skillsphere.enums.Role.MENTOR);
            User student1 = seedUserIfMissing("singhchandni1610@gmail.com", "Chandni Singh", "singhchandni", "password123", com.skillsphere.enums.Role.STUDENT);
            User student2 = seedUserIfMissing("sri@gmail.com", "Srimathi", "srimathi", "password123", com.skillsphere.enums.Role.STUDENT);

            if (courseRepository.count() >= 6 && internshipRepository.count() >= 4) {
                log.info("SkillSphere initial course data already seeded into database. Skipping course seeding.");
                return;
            }

            // 1. Seed or update real published courses with complete curriculum
            Course pythonCourse = seedOrUpdateCourse(
                    "Python Programming - Beginner to Advanced",
                    "Programming",
                    "Beginner to Advanced",
                    "Master Python programming from syntax basics to Object-Oriented Design, Data Structures, Web Development with FastAPI, and Real-world Automation.",
                    "Python is the world's most versatile programming language. This comprehensive masterclass covers fundamental syntax, control flow, functions, OOP principles, data structure optimizations, REST API construction, and automated scripting.\n\nModule Breakdown:\n1. Python Fundamentals & Environment Setup\n2. Object-Oriented Programming (OOP)\n3. Data Structures & Algorithmic Optimizations\n4. REST APIs & Web Scraping\n5. Full-Stack Enterprise Capstone",
                    "8 Weeks",
                    40,
                    "Python, OOP, Data Structures, Web Scraping, FastAPI, Automation",
                    "Master Python 3 syntax & data types\nWrite modular functions and Object-Oriented classes\nManipulate data using Lists, Dictionaries, Sets, and Tuples\nBuild REST APIs using FastAPI\nPerform Automated Web Scraping using Requests and BeautifulSoup",
                    mentor
            );
            seedPythonCurriculum(pythonCourse);

            Course commCourse = seedOrUpdateCourse(
                    "Effective Communication and Public Speaking",
                    "Soft Skills",
                    "All Levels",
                    "Unlock high-impact communication, executive presence, body language mastery, and dynamic public speaking strategies for career acceleration.",
                    "Communication is the single most valuable soft skill for enterprise leaders. Learn how to structure compelling speeches, master vocal dynamics, reduce anxiety, and handle tough Q&A sessions.",
                    "4 Weeks",
                    20,
                    "Public Speaking, Executive Communication, Body Language, Presentation Design, Active Listening",
                    "Master the 7 Cs of Professional Communication\nApply non-verbal body language cues for executive presence\nStructure high-impact speeches and presentation decks\nManage Q&A sessions and tough audience interactions",
                    mentor
            );
            seedCommunicationCurriculum(commCourse);

            Course javaCourse = seedOrUpdateCourse(
                    "Java Programming Fundamentals",
                    "Programming",
                    "Intermediate",
                    "Build a strong foundation in Java programming. Learn core concepts, syntax, object-oriented programming, file handling, multithreading, JDBC, and essential frameworks.",
                    "Dive into the world of Java, one of the most widely used programming languages in the enterprise world. Learn Java syntax, OOP principles, exception handling, Collections Framework, JDBC, and multithreading.",
                    "8 Weeks",
                    40,
                    "Java, Object-Oriented Programming, JDBC, Multithreading, Problem Solving, Backend Basics",
                    "Master Java syntax and Object-Oriented Programming\nUtilize the Java Collections Framework\nPerform File Handling and Serialization\nWrite concurrent programs using Multithreading\nConnect Java applications to databases using JDBC",
                    mentor
            );
            seedJavaCurriculum(javaCourse);

            Course cmCourse = seedOrUpdateCourse(
                    "Content Marketing and Copywriting",
                    "Marketing",
                    "Intermediate",
                    "Words that sell. Learn the psychology of persuasive copywriting, high-converting landing pages, and long-term Content Marketing strategy to acquire customers.",
                    "Content Marketing generates three times as many leads as traditional outbound marketing. Learn persuasive copywriting (AIDA formula), landing page optimization, and building long-term content strategies.",
                    "8 Weeks",
                    33,
                    "Copywriting, Content Marketing, SEO Writing, Landing Page Optimization, B2B Marketing",
                    "Understand psychological triggers of persuasive copywriting\nWrite magnetic headlines and hooks\nDraft high-converting landing page copy and sales letters\nDevelop a Content Marketing matrix",
                    mentor
            );
            seedContentMarketingCurriculum(cmCourse);

            Course dmCourse = seedOrUpdateCourse(
                    "Digital Marketing and SEO Mastery",
                    "Marketing",
                    "Intermediate",
                    "Dominate search engine rankings. Learn Technical SEO, algorithmic ranking factors, keyword mathematics, and comprehensive digital marketing strategies.",
                    "Organic traffic is the most valuable asset on the internet. Learn Google crawler indexing, keyword research, Technical SEO (Core Web Vitals), On-Page optimization, and Google Analytics 4 (GA4).",
                    "8 Weeks",
                    45,
                    "Digital Marketing, SEO, Keyword Research, Technical SEO, Link Building, Google Analytics",
                    "Understand search engine algorithms and PageRank\nConduct advanced Keyword Research\nOptimize On-Page elements using semantic SEO\nMaster Technical SEO and Google Analytics 4",
                    mentor
            );
            seedDigitalMarketingCurriculum(dmCourse);

            Course animCourse = seedOrUpdateCourse(
                    "3D Animation and Modeling",
                    "Design",
                    "Intermediate",
                    "Master 3D poly mesh modeling, UV unwrapping, material shaders, keyframe animation, and camera dynamics for digital media.",
                    "Learn the complete 3D production pipeline. Create high-quality mesh models, apply PBR materials, build skeletal rigs, and produce cinematic 3D animations.",
                    "6 Weeks",
                    30,
                    "3D Modeling, Texturing, Keyframe Animation, UV Unwrapping, Lighting & Rendering",
                    "Build clean 3D polygon meshes\nCreate PBR material shaders and UV maps\nAnimate 3D objects using keyframes\nRender high-resolution digital scenes",
                    mentor
            );
            seed3DAnimationCurriculum(animCourse);

            List<Course> allPublishedCourses = courseRepository.findByStatusIn(List.of(CourseStatus.PUBLISHED, CourseStatus.APPROVED));
            log.info("Total published enterprise courses in database: {}", allPublishedCourses.size());

            // 2. Seed Enrollments for Students
            List<User> studentUsers = userRepository.findByRole(com.skillsphere.enums.Role.STUDENT);
            if (studentUsers.isEmpty() && student1 != null) {
                studentUsers = List.of(student1);
            }

            for (User student : studentUsers) {
                for (int i = 0; i < allPublishedCourses.size(); i++) {
                    Course course = allPublishedCourses.get(i);
                    if (enrollmentRepository.findByStudentIdAndCourseId(student.getId(), course.getId()).isEmpty()) {
                        // Mark first 3 courses completed or in progress
                        int progress = (i < 3) ? 100 : (i == 3 ? 0 : 0);
                        int lessonsComp = (i < 3) ? 10 : 0;
                        Enrollment enrollment = Enrollment.builder()
                                .student(student)
                                .course(course)
                                .progress(progress)
                                .lessonsCompleted(lessonsComp)
                                .notes("Study notes for " + course.getTitle())
                                .enrolledAt(LocalDateTime.now().minusDays(14 - i * 2))
                                .lastOpenedAt(LocalDateTime.now().minusDays(i))
                                .build();
                        enrollmentRepository.save(enrollment);
                        log.info("Seeded enrollment for student: {} in course: {} (ID: {})", student.getEmail(), course.getTitle(), course.getId());
                    }
                }
            }

            // 3. Seed Quizzes
            if (quizRepository.count() == 0) {
                log.info("Seeding quizzes and questions...");
                int qIdx = 0;
                for (Course course : allPublishedCourses) {
                    boolean isPublished = (qIdx % 2 == 0);
                    Quiz quiz = Quiz.builder()
                            .course(course)
                            .title(course.getTitle() + " - Mastery Quiz")
                            .description("Comprehensive evaluation quiz covering core concepts of " + course.getTitle())
                            .timeLimitMinutes(30)
                            .totalPoints(20)
                            .published(isPublished)
                            .createdAt(LocalDateTime.now().minusDays(3))
                            .updatedAt(LocalDateTime.now())
                            .build();
                    qIdx++;

                    Quiz savedQuiz = quizRepository.save(quiz);

                    QuizQuestion q1 = QuizQuestion.builder()
                            .quiz(savedQuiz)
                            .orderIndex(1)
                            .questionText("What is the primary core concept demonstrated in " + course.getTitle() + "?")
                            .points(10)
                            .optionA("Fundamental Theory and Core Abstractions")
                            .optionB("Unrelated Legacy Syntax")
                            .optionC("Deprecated Third-party Library")
                            .optionD("None of the above")
                            .correctOption("A")
                            .build();

                    QuizQuestion q2 = QuizQuestion.builder()
                            .quiz(savedQuiz)
                            .orderIndex(2)
                            .questionText("Which best practice is emphasized throughout " + course.getTitle() + "?")
                            .points(10)
                            .optionA("Ad-hoc hardcoding")
                            .optionB("Structured modular design and clean practices")
                            .optionC("Ignoring security guidelines")
                            .optionD("Manual file execution only")
                            .correctOption("B")
                            .build();

                    quizQuestionRepository.saveAll(List.of(q1, q2));
                }
            }

            // 4. Seed Complaints
            if (complaintRepository.count() == 0) {
                User reporter = student1 != null ? student1 : (student2 != null ? student2 : admin);
                if (reporter != null) {
                    Complaint c1 = Complaint.builder()
                            .student(reporter)
                            .subject("Video Playback Quality Options")
                            .description("Requesting HD stream options for Module 1 video lessons.")
                            .category("TECHNICAL")
                            .status("PENDING")
                            .createdAt(LocalDateTime.now().minusDays(2))
                            .updatedAt(LocalDateTime.now().minusDays(2))
                            .build();

                    Complaint c2 = Complaint.builder()
                            .student(reporter)
                            .subject("Python Capstone Code Submission Format")
                            .description("Requesting clarification on GitHub link vs zip submission for final evaluation.")
                            .category("ACADEMIC")
                            .status("IN_PROGRESS")
                            .assignedTo("Support Team")
                            .createdAt(LocalDateTime.now().minusDays(4))
                            .updatedAt(LocalDateTime.now().minusDays(1))
                            .build();

                    complaintRepository.saveAll(List.of(c1, c2));
                }
            }

            // 5. Seed Assignments
            if (assignmentRepository.count() == 0) {
                for (int i = 0; i < Math.min(3, allPublishedCourses.size()); i++) {
                    Course course = allPublishedCourses.get(i);
                    Assignment assignment = Assignment.builder()
                            .course(course)
                            .title(course.getTitle() + " - Capstone Project")
                            .instructions("Build and submit a complete practical application implementing key concepts learned in " + course.getTitle())
                            .dueDate(LocalDateTime.now().plusDays(7))
                            .createdAt(LocalDateTime.now().minusDays(5))
                            .updatedAt(LocalDateTime.now())
                            .build();

                    Assignment savedAssignment = assignmentRepository.save(assignment);

                    if (student1 != null) {
                        AssignmentSubmission submission = AssignmentSubmission.builder()
                                .assignment(savedAssignment)
                                .student(student1)
                                .submission("https://github.com/skillsphere-student/project-capstone")
                                .submittedAt(LocalDateTime.now().minusDays(1))
                                .build();
                        assignmentSubmissionRepository.save(submission);
                    }
                }
            }

            // 6. Seed Internships in MySQL Cloud Database
            if (internshipRepository.count() == 0) {
                log.info("Seeding enterprise & partner internships in MySQL...");
                Long mentorId = mentor != null ? mentor.getId() : 1L;
                String mentorName = mentor != null ? mentor.getFullName() : "Enterprise Partner";

                List<Internship> initialInternships = List.of(
                    Internship.builder()
                        .title("Full-Stack React & Spring Boot Developer Intern")
                        .company("SkillSphere Technologies")
                        .companyLogo("bi-code-slash")
                        .category("Full-Stack")
                        .locationType("Remote")
                        .locationCity("Bangalore / Remote")
                        .stipendMin(25000.0).stipendMax(35000.0)
                        .durationMonths(6)
                        .description("Work directly on enterprise cloud portals, microservices, and React design systems. Build production APIs and RESTful features.")
                        .responsibilities(List.of("Develop frontend React components", "Build Spring Boot REST APIs", "Write unit tests and database migrations"))
                        .requiredSkills(List.of("React", "Spring Boot", "MySQL", "Git", "REST APIs"))
                        .perks(List.of("Flexible hours", "Mentorship certificate", "Pre-placement Offer (PPO) opportunity"))
                        .deadline("2026-09-30")
                        .openingsCount(5)
                        .postedByUserId(mentorId)
                        .postedByName(mentorName)
                        .active(true)
                        .build(),
                    Internship.builder()
                        .title("Python & AI Backend Engineering Intern")
                        .company("Aiven Cloud Systems")
                        .companyLogo("bi-cpu-fill")
                        .category("Backend")
                        .locationType("Hybrid")
                        .locationCity("Hyderabad")
                        .stipendMin(30000.0).stipendMax(40000.0)
                        .durationMonths(3)
                        .description("Design high-throughput Python backend services, asynchronous FastAPI endpoints, and database connection pools.")
                        .responsibilities(List.of("Develop FastAPI Python microservices", "Optimize SQL queries on MySQL", "Integrate AI model inference pipelines"))
                        .requiredSkills(List.of("Python", "FastAPI", "SQL", "Docker", "AsyncIO"))
                        .perks(List.of("Cloud credits allowance", "Hybrid work flexibility", "Industry mentorship"))
                        .deadline("2026-10-15")
                        .openingsCount(3)
                        .postedByUserId(mentorId)
                        .postedByName(mentorName)
                        .active(true)
                        .build(),
                    Internship.builder()
                        .title("UI/UX & Product Design Systems Intern")
                        .company("Creative Design Labs")
                        .companyLogo("bi-palette-fill")
                        .category("UI/UX")
                        .locationType("Remote")
                        .locationCity("Remote")
                        .stipendMin(20000.0).stipendMax(28000.0)
                        .durationMonths(4)
                        .description("Craft high-fidelity Figma UI mockups, interactive user flows, and responsive design guidelines for enterprise web platforms.")
                        .responsibilities(List.of("Design responsive web wireframes", "Conduct user usability research", "Maintain design system components"))
                        .requiredSkills(List.of("Figma", "User Research", "Wireframing", "Prototyping", "HTML/CSS"))
                        .perks(List.of("Design portfolio showcase", "Flexible timing", "Certificate of completion"))
                        .deadline("2026-09-25")
                        .openingsCount(2)
                        .postedByUserId(mentorId)
                        .postedByName(mentorName)
                        .active(true)
                        .build(),
                    Internship.builder()
                        .title("Digital Marketing & SEO Analytics Intern")
                        .company("Growth Metrics Enterprise")
                        .companyLogo("bi-graph-up-arrow")
                        .category("Marketing")
                        .locationType("Remote")
                        .locationCity("Remote")
                        .stipendMin(18000.0).stipendMax(25000.0)
                        .durationMonths(3)
                        .description("Execute technical SEO audits, optimize organic keyword rankings, manage content funnels, and analyze GA4 web traffic.")
                        .responsibilities(List.of("Perform keyword search volume audits", "Optimize On-Page meta tags", "Generate GA4 performance reports"))
                        .requiredSkills(List.of("SEO", "Google Analytics", "Content Copywriting", "Keyword Research"))
                        .perks(List.of("Stipend bonus", "Certificate of Merit", "Remote work"))
                        .deadline("2026-10-05")
                        .openingsCount(4)
                        .postedByUserId(mentorId)
                        .postedByName(mentorName)
                        .active(true)
                        .build()
                );
                internshipRepository.saveAll(initialInternships);
                log.info("Persisted {} initial enterprise internships into MySQL database.", initialInternships.size());
            }

            // 7. Seed Audit Logs
            if (auditLogRepository.count() == 0) {
                String adminEmail = admin != null ? admin.getEmail() : "admin@enterprise.com";
                AuditLog a1 = AuditLog.builder()
                        .action("SYSTEM_INIT")
                        .adminEmail("SYSTEM")
                        .targetUser("ALL")
                        .targetCourse("PLATFORM")
                        .details("Enterprise learning platform curriculum & video streams initialized successfully.")
                        .ipAddress("127.0.0.1")
                        .createdAt(LocalDateTime.now().minusHours(6))
                        .build();
                auditLogRepository.save(a1);
            }

            log.info("SkillSphere Data Seeding Completed Successfully.");
        };
    }

    private Course seedOrUpdateCourse(
            String title,
            String category,
            String level,
            String shortDesc,
            String desc,
            String duration,
            int hours,
            String skills,
            String outcomes,
            User mentor
    ) {
        Course course = courseRepository.findByTitle(title).orElse(null);
        if (course == null) {
            course = Course.builder()
                    .title(title)
                    .category(category)
                    .level(level)
                    .language("English")
                    .shortDescription(shortDesc)
                    .description(desc)
                    .estimatedDuration(duration)
                    .estimatedLearningHours(hours)
                    .skills(skills)
                    .learningOutcomes(outcomes)
                    .prerequisites("Basic computer literacy")
                    .targetAudience("Students, Developers, and Professionals")
                    .status(CourseStatus.PUBLISHED)
                    .certificateAvailable(true)
                    .price(49.99)
                    .mentor(mentor)
                    .publishedAt(LocalDateTime.now())
                    .build();
        } else {
            course.setStatus(CourseStatus.PUBLISHED);
            course.setCategory(category);
            course.setLevel(level);
            course.setShortDescription(shortDesc);
            course.setDescription(desc);
            course.setEstimatedDuration(duration);
            course.setEstimatedLearningHours(hours);
            course.setSkills(skills);
            course.setLearningOutcomes(outcomes);
            course.setCertificateAvailable(true);
            if (course.getPublishedAt() == null) {
                course.setPublishedAt(LocalDateTime.now());
            }
        }
        return courseRepository.save(course);
    }

    private void seedPythonCurriculum(Course course) {
        if (lessonRepository.countByModuleCourseId(course.getId()) > 0) return;
        List<CourseModule> existing = moduleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(course.getId());
        if (!existing.isEmpty()) {
            moduleRepository.deleteAll(existing);
        }

        // Module 1
        CourseModule m1 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 1: Python Fundamentals & Setup")
                .description("Setup Python 3 environment, master variables, data types, operators, and control flow.")
                .orderIndex(0).build());

        Lesson l1_1 = lessonRepository.save(Lesson.builder()
                .module(m1).title("Getting Started with Python 3 & VS Code")
                .lessonType("VIDEO").videoUrl("https://www.youtube.com/watch?v=_uQrJ0TkZlc")
                .estimatedDuration("20 mins").orderIndex(0).previewAvailable(true).mandatory(true)
                .content("Welcome to Python Programming! In this initial lesson, we set up Python 3.12, configure VS Code, manage virtual environments (venv), and run your first Python scripts.\n\nKey Concepts:\n1. Python Interpreter Execution Model\n2. Installing VS Code & Python Extension\n3. Executing scripts via Terminal & Debugger.")
                .build());

        resourceRepository.save(Resource.builder()
                .lesson(l1_1).title("Official Python 3 Documentation")
                .description("Official Python Language Guide & Reference").url("https://docs.python.org/3/")
                .type("LINK").orderIndex(0).build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("Variables, Dynamic Typing & Data Types")
                .lessonType("TEXT").estimatedDuration("25 mins").orderIndex(1).previewAvailable(true).mandatory(true)
                .content("Python supports dynamic typing while maintaining strong type safety.\n\nCode Example:\n```python\nname: str = 'SkillSphere Learner'\nage: int = 22\nis_active: bool = True\nskills: list = ['Python', 'SQL', 'Git']\n\nprint(f'{name} (Age: {age}) holds skills: {skills}')\n```\n\nOperators & Expressions:\n- Arithmetic: +, -, *, /, //, %\n- Logical: and, or, not\n- Bitwise: &, |, ^")
                .build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("Control Flow: Conditionals & Loops")
                .lessonType("TEXT").estimatedDuration("30 mins").orderIndex(2).previewAvailable(false).mandatory(true)
                .content("Control program execution using if/elif/else statements, for loops, and while loops.\n\n```python\nscores = [95, 82, 67, 91]\nfor s in scores:\n    if s >= 90:\n        print(f'Distinction: {s}')\n    elif s >= 80:\n        print(f'Pass: {s}')\n```")
                .build());

        // Module 2
        CourseModule m2 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 2: Object-Oriented Programming (OOP)")
                .description("Encapsulate state and behavior using classes, inheritance, polymorphism, and dunder methods.")
                .orderIndex(1).build());

        lessonRepository.save(Lesson.builder()
                .module(m2).title("Classes, Objects & Constructors")
                .lessonType("VIDEO").videoUrl("https://www.youtube.com/watch?v=JeznW_7DlB0")
                .estimatedDuration("35 mins").orderIndex(0).previewAvailable(true).mandatory(true)
                .content("OOP organizes software design around data objects rather than functions alone.\n\n```python\nclass Student:\n    def __init__(self, name: str, student_id: int):\n        self.name = name\n        self.student_id = student_id\n        self.progress = 0\n\n    def update_progress(self, pts: int):\n        self.progress += pts\n        print(f'{self.name} progress: {self.progress}%')\n\ns = Student('Srimathi', 101)\ns.update_progress(25)\n```")
                .build());

        lessonRepository.save(Lesson.builder()
                .module(m2).title("Inheritance & Dunder Methods")
                .lessonType("TEXT").estimatedDuration("30 mins").orderIndex(1).previewAvailable(false).mandatory(true)
                .content("Learn class inheritance, super() call, method overriding, and dunder magic methods (__repr__, __str__, __eq__).")
                .build());

        // Module 3
        CourseModule m3 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 3: Data Structures & Algorithmic Optimizations")
                .description("Deep dive into Lists, Dictionaries, Sets, Tuples, and List Comprehensions.")
                .orderIndex(2).build());

        lessonRepository.save(Lesson.builder()
                .module(m3).title("Data Structures & List Comprehensions")
                .lessonType("TEXT").estimatedDuration("35 mins").orderIndex(0).previewAvailable(false).mandatory(true)
                .content("Master list comprehensions and dictionary operations for high-performance Python code.\n\n```python\neven_squares = [x**2 for x in range(20) if x % 2 == 0]\nskill_map = {f'skill_{i}': val for i, val in enumerate(['Python', 'Django', 'FastAPI'])}\nprint(even_squares, skill_map)\n```")
                .build());

        // Module 4
        CourseModule m4 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 4: REST APIs & Web Scraping")
                .description("Build production REST APIs using FastAPI and extract web data using BeautifulSoup.")
                .orderIndex(3).build());

        lessonRepository.save(Lesson.builder()
                .module(m4).title("Building REST APIs with FastAPI")
                .lessonType("VIDEO").videoUrl("https://www.youtube.com/watch?v=GN6ICac3OXY")
                .estimatedDuration("40 mins").orderIndex(0).previewAvailable(true).mandatory(true)
                .content("Learn modern async API development in Python using FastAPI.\n\n```python\nfrom fastapi import FastAPI\napp = FastAPI()\n\n@app.get('/api/courses')\ndef get_courses():\n    return [{'id': 1, 'title': 'Python Enterprise Masterclass'}]\n```")
                .build());

        // Module 5
        CourseModule m5 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 5: Real-World Enterprise Capstone & Certificate")
                .description("Complete the full-stack Python capstone evaluation to receive your official completion badge.")
                .orderIndex(4).build());

        lessonRepository.save(Lesson.builder()
                .module(m5).title("Full-Stack Enterprise Python Capstone & Final Certificate")
                .lessonType("TEXT").estimatedDuration("45 mins").orderIndex(0).previewAvailable(false).mandatory(true)
                .content("Congratulations on reaching the final module! Complete your project submission to unlock your official SkillSphere Python Credential Badge & PDF Certificate!")
                .build());
    }

    private void seedCommunicationCurriculum(Course course) {
        if (lessonRepository.countByModuleCourseId(course.getId()) > 0) return;
        List<CourseModule> existing = moduleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(course.getId());
        if (!existing.isEmpty()) moduleRepository.deleteAll(existing);

        CourseModule m1 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 1: Foundations of Executive Communication")
                .description("Master clarity, executive presence, and active listening.")
                .orderIndex(0).build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("The 7 Cs of Leadership Communication")
                .lessonType("VIDEO").videoUrl("https://www.youtube.com/watch?v=HAnw168huqA")
                .estimatedDuration("20 mins").orderIndex(0).previewAvailable(true).mandatory(true)
                .content("Explore the 7 Cs of Effective Communication: Clear, Concise, Concrete, Correct, Coherent, Complete, and Courteous.")
                .build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("Body Language, Eye Contact & Vocal Dynamics")
                .lessonType("TEXT").estimatedDuration("25 mins").orderIndex(1).previewAvailable(true).mandatory(true)
                .content("Non-verbal body language accounts for over 50% of audience engagement. Practice open posture, vocal modulation, and pausing for emphasis.")
                .build());
    }

    private void seedJavaCurriculum(Course course) {
        if (lessonRepository.countByModuleCourseId(course.getId()) > 0) return;
        List<CourseModule> existing = moduleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(course.getId());
        if (!existing.isEmpty()) moduleRepository.deleteAll(existing);

        CourseModule m1 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 1: Core Java & OOP Principles")
                .description("Classes, objects, inheritance, polymorphism, and interface abstractions.")
                .orderIndex(0).build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("Java OOP: Inheritance & Polymorphism")
                .lessonType("VIDEO").videoUrl("https://www.youtube.com/watch?v=eIrMbAQSU34")
                .estimatedDuration("30 mins").orderIndex(0).previewAvailable(true).mandatory(true)
                .content("Object-Oriented Programming principles in Java 21: Encapsulation, Abstraction, Inheritance, and Polymorphism.")
                .build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("Java Collections Framework & Streams API")
                .lessonType("TEXT").estimatedDuration("35 mins").orderIndex(1).previewAvailable(true).mandatory(true)
                .content("Learn List, Set, Map, and functional stream operations in enterprise Java applications.")
                .build());
    }

    private void seedContentMarketingCurriculum(Course course) {
        if (lessonRepository.countByModuleCourseId(course.getId()) > 0) return;
        List<CourseModule> existing = moduleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(course.getId());
        if (!existing.isEmpty()) moduleRepository.deleteAll(existing);

        CourseModule m1 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 1: Persuasive Copywriting & Content Strategy")
                .description("Copywriting frameworks (AIDA, PAS) and high-converting content funnels.")
                .orderIndex(0).build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("AIDA & PAS Copywriting Architectures")
                .lessonType("VIDEO").videoUrl("https://www.youtube.com/watch?v=rWlHqUXrXqU")
                .estimatedDuration("25 mins").orderIndex(0).previewAvailable(true).mandatory(true)
                .content("Attention, Interest, Desire, Action (AIDA) and Problem, Agitate, Solution (PAS) copy frameworks.")
                .build());
    }

    private void seedDigitalMarketingCurriculum(Course course) {
        if (lessonRepository.countByModuleCourseId(course.getId()) > 0) return;
        List<CourseModule> existing = moduleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(course.getId());
        if (!existing.isEmpty()) moduleRepository.deleteAll(existing);

        CourseModule m1 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 1: Technical SEO & Search Engine Algorithms")
                .description("Google search crawlers, keyword research, On-Page & Technical SEO.")
                .orderIndex(0).build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("Google Crawling & Technical SEO")
                .lessonType("VIDEO").videoUrl("https://www.youtube.com/watch?v=xsVTqzratPs")
                .estimatedDuration("30 mins").orderIndex(0).previewAvailable(true).mandatory(true)
                .content("How search engine bots crawl, index, and rank web pages for high organic traffic.")
                .build());
    }

    private void seed3DAnimationCurriculum(Course course) {
        if (lessonRepository.countByModuleCourseId(course.getId()) > 0) return;
        List<CourseModule> existing = moduleRepository.findByCourseIdOrderByOrderIndexAscIdAsc(course.getId());
        if (!existing.isEmpty()) moduleRepository.deleteAll(existing);

        CourseModule m1 = moduleRepository.save(CourseModule.builder()
                .course(course).title("Module 1: 3D Polygon Modeling & Texturing")
                .description("Mesh topology, extrusions, PBR materials, and camera keyframes.")
                .orderIndex(0).build());

        lessonRepository.save(Lesson.builder()
                .module(m1).title("3D Polygon Mesh Topology & Shaders")
                .lessonType("VIDEO").videoUrl("https://www.youtube.com/watch?v=nIoXOplUvAw")
                .estimatedDuration("30 mins").orderIndex(0).previewAvailable(true).mandatory(true)
                .content("3D modeling pipeline: extrusions, UV unwrapping, material shaders, and keyframe animation.")
                .build());
    }

    private User seedUserIfMissing(String email, String fullName, String username, String rawPassword, com.skillsphere.enums.Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            log.info("Seeding missing default user: {} ({})", email, role);
            User user = User.builder()
                    .fullName(fullName)
                    .username(username)
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .provider(com.skillsphere.enums.Provider.LOCAL)
                    .enabled(true)
                    .emailVerified(true)
                    .build();
            return userRepository.save(user);
        });
    }
}
