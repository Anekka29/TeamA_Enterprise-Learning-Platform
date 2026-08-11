package com.skillsphere.controller;

import com.skillsphere.dto.AIChatRequest;
import com.skillsphere.dto.AIChatResponse;
import com.skillsphere.entity.User;
import com.skillsphere.exception.AIServiceException;
import com.skillsphere.repository.UserRepository;
import com.skillsphere.service.AIService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
public class AIController {

    private final AIService aiService;
    private final UserRepository userRepository;

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(@Valid @RequestBody AIChatRequest request) {
        log.info("Received POST /api/ai/chat request - message length: {}, conversationId: {}", request.getMessage() != null ? request.getMessage().length() : 0, request.getConversationId());
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("Authenticated user email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
        log.info("User found: {}", user.getId());

        AIChatResponse response = aiService.chat(request, user);
        log.info("Returning response with conversationId: {}", response.getConversationId());
        return ResponseEntity.ok(response);
    }

    @ExceptionHandler(AIServiceException.class)
    public ResponseEntity<String> handleAIServiceException(AIServiceException e) {
        log.error("Handling AIServiceException: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
    }
}
