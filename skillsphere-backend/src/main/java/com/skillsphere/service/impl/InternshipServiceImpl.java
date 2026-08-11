package com.skillsphere.service.impl;

import com.skillsphere.entity.Internship;
import com.skillsphere.entity.InternshipApplication;
import com.skillsphere.entity.User;
import com.skillsphere.exception.UserNotFoundException;
import com.skillsphere.repository.InternshipApplicationRepository;
import com.skillsphere.repository.InternshipRepository;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.InternshipService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InternshipServiceImpl implements InternshipService {

    private final InternshipRepository internshipRepository;
    private final InternshipApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @PostConstruct
    public void initSeedInternships() {
        try {
            if (internshipRepository.count() == 0) {
                log.info("Seeding initial high-quality partner internships into database...");
                
                List<Internship> seedList = new ArrayList<>();

                seedList.add(Internship.builder()
                        .title("React Frontend Developer Intern")
                        .company("DevFlow Technologies")
                        .companyLogo("💻")
                        .category("Frontend")
                        .locationType("Remote")
                        .locationCity("Bengaluru")
                        .stipendMin(20000.0)
                        .stipendMax(25000.0)
                        .durationMonths(3)
                        .icon("💻")
                        .description("Join our product UI development team to build next-generation glassmorphic user controls, optimize state flows, and integrate interactive data charts.")
                        .responsibilities(List.of(
                                "Develop responsive UI components in React.js and Bootstrap 5",
                                "Integrate REST API endpoints with Axios and custom state hooks",
                                "Conduct cross-browser usability testing and performance tuning"
                        ))
                        .requiredSkills(List.of("React.js", "JavaScript (ES6)", "Bootstrap 5", "REST Integration", "Git"))
                        .perks(List.of("Certificate of Completion", "Letter of Recommendation", "Flexible Hours", "Pre-Placement Offer (PPO)"))
                        .deadline("2026-09-30")
                        .openingsCount(5)
                        .postedByName("DevFlow Hiring Manager")
                        .active(true)
                        .build());

                seedList.add(Internship.builder()
                        .title("Java Spring Backend Intern")
                        .company("FinSphere Systems")
                        .companyLogo("☕")
                        .category("Backend")
                        .locationType("Hybrid")
                        .locationCity("Mumbai")
                        .stipendMin(25000.0)
                        .stipendMax(30000.0)
                        .durationMonths(6)
                        .icon("☕")
                        .description("Collaborate on scalable enterprise data APIs, optimize MySQL entity queries, and write integration tests for bank transactional reconciliation servers.")
                        .responsibilities(List.of(
                                "Build secure REST controllers and service components in Spring Boot",
                                "Design relational DB schemas and write optimized Spring Data JPA queries",
                                "Implement unit and integration tests using JUnit 5 and Mockito"
                        ))
                        .requiredSkills(List.of("Java Core", "Spring Boot JPA", "SQL Database", "REST APIs", "JUnit Testing"))
                        .perks(List.of("Industry Certificate", "Letter of Recommendation", "Pre-Placement Offer (PPO)"))
                        .deadline("2026-10-15")
                        .openingsCount(3)
                        .postedByName("FinSphere Tech Recruiter")
                        .active(true)
                        .build());

                seedList.add(Internship.builder()
                        .title("UI/UX & Product Design Intern")
                        .company("CreativeFlow Lab")
                        .companyLogo("🎨")
                        .category("UI/UX")
                        .locationType("Remote")
                        .locationCity("Delhi NCR")
                        .stipendMin(15000.0)
                        .stipendMax(20000.0)
                        .durationMonths(3)
                        .icon("🎨")
                        .description("Work closely with frontend engineers to construct interactive wireframes in Figma, design responsive navigation models, and review usability heuristics.")
                        .responsibilities(List.of(
                                "Construct high-fidelity interactive prototypes and design tokens in Figma",
                                "Conduct user research and usability feedback sessions",
                                "Define typography scales, color contrast guidelines, and micro-interactions"
                        ))
                        .requiredSkills(List.of("Figma", "Wireframing", "User Research", "Grid Typography", "Color Contrast"))
                        .perks(List.of("Design Portfolio Feature", "Certificate", "Flexible Schedule"))
                        .deadline("2026-09-15")
                        .openingsCount(4)
                        .postedByName("CreativeFlow Design Lead")
                        .active(true)
                        .build());

                seedList.add(Internship.builder()
                        .title("AI & Machine Learning Research Intern")
                        .company("DeepMind AI Labs")
                        .companyLogo("🤖")
                        .category("AI/ML")
                        .locationType("Remote")
                        .locationCity("Hyderabad")
                        .stipendMin(30000.0)
                        .stipendMax(40000.0)
                        .durationMonths(6)
                        .icon("🤖")
                        .description("Participate in cutting-edge neural network research, fine-tune transformer models, and optimize dataset pipelines for natural language tasks.")
                        .responsibilities(List.of(
                                "Implement computer vision and NLP model architectures in PyTorch",
                                "Fine-tune Hugging Face LLM models for domain-specific dataset queries",
                                "Document experimental results and benchmark GPU inference latency"
                        ))
                        .requiredSkills(List.of("Python", "PyTorch", "TensorFlow", "Scikit-Learn", "NLP", "Pandas"))
                        .perks(List.of("Co-Authorship on Paper", "High Stipend", "Pre-Placement Offer (PPO)"))
                        .deadline("2026-10-31")
                        .openingsCount(2)
                        .postedByName("DeepMind AI Director")
                        .active(true)
                        .build());

                seedList.add(Internship.builder()
                        .title("Full-Stack Software Engineering Intern")
                        .company("Nexus Tech Solutions")
                        .companyLogo("🚀")
                        .category("Full-Stack")
                        .locationType("Hybrid")
                        .locationCity("Pune")
                        .stipendMin(22000.0)
                        .stipendMax(28000.0)
                        .durationMonths(3)
                        .icon("🚀")
                        .description("Develop end-to-end full-stack web applications connecting React single-page interfaces with Spring Boot microservices.")
                        .responsibilities(List.of(
                                "Build modular React UI components connected via REST API services",
                                "Develop robust backend services with Spring Boot and PostgreSQL",
                                "Deploy cloud containers using Docker and CI/CD pipelines"
                        ))
                        .requiredSkills(List.of("React.js", "Java Spring Boot", "PostgreSQL", "Docker", "REST APIs"))
                        .perks(List.of("Certificate of Excellence", "Mentorship", "Pre-Placement Offer (PPO)"))
                        .deadline("2026-10-01")
                        .openingsCount(6)
                        .postedByName("Nexus Hiring Lead")
                        .active(true)
                        .build());

                internshipRepository.saveAll(seedList);
                log.info("Successfully seeded 5 initial partner internships.");
            }
        } catch (Exception e) {
            log.error("Error seeding internships: ", e);
        }
    }

    @Override
    public List<Internship> getAllActiveInternships() {
        return internshipRepository.findByActiveTrueOrderByIdDesc();
    }

    @Override
    public List<Internship> getAllInternshipsAdmin() {
        return internshipRepository.findAll();
    }

    @Override
    public Internship getInternshipById(Long id) {
        return internshipRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Internship opening not found with id: " + id));
    }

    @Override
    @Transactional
    public Internship createInternship(Internship internship, User poster) {
        if (poster != null) {
            internship.setPostedByUserId(poster.getId());
            internship.setPostedByName(poster.getFullName() != null ? poster.getFullName() : poster.getUsername());
        }
        internship.setActive(true);
        return internshipRepository.save(internship);
    }

    @Override
    @Transactional
    public InternshipApplication applyForInternship(Long internshipId, String userEmail, InternshipApplication appDetails) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));
        
        Internship internship = getInternshipById(internshipId);

        if (applicationRepository.existsByUserAndInternship(user, internship)) {
            return applicationRepository.findByUserAndInternship(user, internship)
                    .orElseThrow(() -> new RuntimeException("Application already exists"));
        }

        if (appDetails == null) {
            appDetails = new InternshipApplication();
        }

        appDetails.setUser(user);
        appDetails.setInternship(internship);
        appDetails.setStatus("APPLIED");
        appDetails.setAppliedAt(LocalDateTime.now());

        if (appDetails.getFullName() == null || appDetails.getFullName().isBlank()) {
            appDetails.setFullName(user.getFullName() != null ? user.getFullName() : user.getUsername());
        }
        if (appDetails.getEmail() == null || appDetails.getEmail().isBlank()) {
            appDetails.setEmail(user.getEmail());
        }
        if (appDetails.getResumeUrl() == null || appDetails.getResumeUrl().isBlank()) {
            appDetails.setResumeUrl("SkillSphere ATS Resume Sync");
        }

        return applicationRepository.save(appDetails);
    }

    @Override
    public List<InternshipApplication> getStudentApplications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userEmail));
        return applicationRepository.findByUserOrderByIdDesc(user);
    }

    @Override
    public List<InternshipApplication> getMentorApplications(String mentorEmail) {
        User mentor = userRepository.findByEmail(mentorEmail).orElse(null);
        if (mentor != null) {
            List<InternshipApplication> mentorApps = applicationRepository.findByInternship_PostedByUserIdOrderByIdDesc(mentor.getId());
            if (!mentorApps.isEmpty()) {
                return mentorApps;
            }
        }
        // Fallback: return all applications for mentor review
        return applicationRepository.findAll();
    }

    @Override
    public List<InternshipApplication> getAllApplicationsAdmin() {
        return applicationRepository.findAll();
    }

    @Override
    @Transactional
    public InternshipApplication updateApplicationStatus(Long applicationId, String status, String reviewNotes) {
        InternshipApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found with id: " + applicationId));
        
        app.setStatus(status.toUpperCase());
        if (reviewNotes != null && !reviewNotes.isBlank()) {
            app.setReviewNotes(reviewNotes);
        }
        return applicationRepository.save(app);
    }
}
