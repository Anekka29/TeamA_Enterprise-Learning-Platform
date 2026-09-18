package com.skillsphere.service.impl;

import com.skillsphere.ai.provider.AIProvider;
import com.skillsphere.dto.AIChatRequest;
import com.skillsphere.dto.AIChatResponse;
import com.skillsphere.entity.AIChatHistory;
import com.skillsphere.entity.User;
import com.skillsphere.repository.AIChatHistoryRepository;
import com.skillsphere.service.AIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIServiceImpl implements AIService {

    private final AIProvider aiProvider;
    private final AIChatHistoryRepository chatHistoryRepository;

    @Value("${ai.history.limit:10}")
    private int historyLimit;

    @Override
    public AIChatResponse chat(AIChatRequest request, User user) {
        log.info("Starting AIServiceImpl.chat() for user: {}, conversationId: {}", user.getId(), request.getConversationId());
        String conversationId = request.getConversationId();
        if (conversationId == null || conversationId.isBlank()) {
            conversationId = UUID.randomUUID().toString();
            log.info("Generated new conversationId: {}", conversationId);
        }

        // Get conversation history
        List<AIChatHistory> history = chatHistoryRepository.findByUserAndConversationIdOrderByCreatedAtAsc(user, conversationId);
        log.info("Found {} history entries for conversationId: {}", history.size(), conversationId);

        // Build conversation history list for AI provider
        List<String> conversationHistory = new ArrayList<>();
        int startIndex = Math.max(0, history.size() - historyLimit);
        for (int i = startIndex; i < history.size(); i++) {
            conversationHistory.add(history.get(i).getUserMessage());
            conversationHistory.add(history.get(i).getAssistantResponse());
        }
        log.info("Prepared {} history messages for AI provider", conversationHistory.size());

        // Call AI provider to get response
        log.info("Calling AI provider to generate response");
        String assistantResponse = aiProvider.generateResponse(conversationHistory, request.getMessage());

        // Save chat history
        log.info("Saving chat history to DB");
        AIChatHistory chatHistory = new AIChatHistory();
        chatHistory.setUser(user);
        chatHistory.setConversationId(conversationId);
        chatHistory.setUserMessage(request.getMessage());
        chatHistory.setAssistantResponse(assistantResponse);
        chatHistoryRepository.save(chatHistory);
        log.info("Chat history saved successfully");

        return new AIChatResponse(assistantResponse, conversationId);
    }
}
