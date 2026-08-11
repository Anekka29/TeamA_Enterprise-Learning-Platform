package com.skillsphere.ai.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillsphere.exception.AIServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeminiProvider implements AIProvider {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String apiUrl;

    @Value("${openrouter.model:openai/gpt-3.5-turbo}")
    private String openRouterModel;

    private static final String SYSTEM_PROMPT = 
        "You are SkillSphere AI Agent, a powerful, versatile, and highly intelligent AI assistant (like ChatGPT). " +
        "You can answer questions across ALL domains including programming & computer science, software architecture, debugging, general knowledge (GK), science, mathematics, history, geography, literature, career guidance, and general everyday queries. " +
        "Always provide accurate, well-explained, and friendly responses formatted nicely in Markdown. " +
        "At the very end of your response, provide 3 to 4 logical follow-up questions or next topics the user might ask next under the header '### 💡 Suggested Next Questions:'. Make each suggested question concise and relevant.";

    @Override
    public String generateResponse(List<String> conversationHistory, String userMessage) {
        if (apiKey == null || apiKey.isBlank()) {
            log.error("AI API key is blank or null");
            throw new AIServiceException("AI API key is not configured");
        }

        boolean isOpenRouter = apiKey.startsWith("sk-or-") || (apiUrl != null && apiUrl.contains("openrouter.ai"));
        log.info("AI Provider executing - Mode: {}, Key prefix: {}", 
                isOpenRouter ? "OpenRouter" : "Native Gemini",
                apiKey.length() > 8 ? apiKey.substring(0, 8) + "..." : "[short]");

        if (isOpenRouter) {
            return generateOpenRouterResponse(conversationHistory, userMessage);
        } else {
            return generateNativeGeminiResponse(conversationHistory, userMessage);
        }
    }

    private String generateOpenRouterResponse(List<String> conversationHistory, String userMessage) {
        String targetUrl = (apiUrl != null && apiUrl.contains("openrouter.ai")) 
                ? apiUrl 
                : "https://openrouter.ai/api/v1/chat/completions";

        List<String> modelsToTry = new ArrayList<>();
        if (openRouterModel != null && !openRouterModel.isBlank()) {
            modelsToTry.add(openRouterModel);
        }
        modelsToTry.add("google/gemini-2.0-flash-exp:free");
        modelsToTry.add("meta-llama/llama-3.3-70b-instruct:free");
        modelsToTry.add("deepseek/deepseek-r1:free");
        modelsToTry.add("mistralai/mistral-7b-instruct:free");
        modelsToTry.add("openai/gpt-3.5-turbo");

        Exception lastException = null;

        for (String modelName : modelsToTry) {
            try {
                log.info("Attempting OpenRouter call with model: {}", modelName);
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", modelName);

                List<Map<String, String>> messages = new ArrayList<>();
                
                // System prompt for universal AI agent
                Map<String, String> systemMsg = new HashMap<>();
                systemMsg.put("role", "system");
                systemMsg.put("content", SYSTEM_PROMPT);
                messages.add(systemMsg);

                // Add history entries
                for (int i = 0; i < conversationHistory.size(); i++) {
                    String role = (i % 2 == 0) ? "user" : "assistant";
                    Map<String, String> msg = new HashMap<>();
                    msg.put("role", role);
                    msg.put("content", conversationHistory.get(i));
                    messages.add(msg);
                }

                // Current message
                Map<String, String> currentMsg = new HashMap<>();
                currentMsg.put("role", "user");
                currentMsg.put("content", userMessage);
                messages.add(currentMsg);

                requestBody.put("messages", messages);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + apiKey.trim());
                headers.set("HTTP-Referer", "http://localhost:5173");
                headers.set("X-Title", "SkillSphere AI Agent");

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                ResponseEntity<String> response = restTemplate.exchange(targetUrl, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode choices = root.path("choices");
                    if (choices.isArray() && choices.size() > 0) {
                        JsonNode firstChoice = choices.get(0);
                        String text = firstChoice.path("message").path("content").asText();
                        if (!text.isBlank()) {
                            log.info("Successfully generated response using model {} (length: {})", modelName, text.length());
                            return text;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Model {} failed with error: {}. Trying next model...", modelName, e.getMessage());
                lastException = e;
            }
        }

        log.error("All OpenRouter models failed. Last error: ", lastException);
        throw new AIServiceException("AI Agent is temporarily busy. Please try sending your message again.");
    }

    private String generateNativeGeminiResponse(List<String> conversationHistory, String userMessage) {
        try {
            String url = apiUrl + "?key=" + apiKey;
            log.info("Native Gemini API URL: {}", url);

            Map<String, Object> requestBody = new HashMap<>();
            
            // System instruction for Gemini
            Map<String, Object> systemPart = new HashMap<>();
            systemPart.put("text", SYSTEM_PROMPT);
            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", List.of(systemPart));
            requestBody.put("systemInstruction", systemInstruction);

            List<Map<String, Object>> contents = new ArrayList<>();

            for (int i = 0; i < conversationHistory.size(); i++) {
                String role = i % 2 == 0 ? "user" : "model";
                Map<String, Object> part = new HashMap<>();
                part.put("text", conversationHistory.get(i));
                Map<String, Object> content = new HashMap<>();
                content.put("role", role);
                content.put("parts", List.of(part));
                contents.add(content);
            }

            Map<String, Object> userPart = new HashMap<>();
            userPart.put("text", userMessage);
            Map<String, Object> userContent = new HashMap<>();
            userContent.put("role", "user");
            userContent.put("parts", List.of(userPart));
            contents.add(userContent);

            requestBody.put("contents", contents);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText();
                    if (!text.isBlank()) {
                        return text;
                    }
                }
            }
            throw new AIServiceException("Failed to parse Gemini response");

        } catch (Exception e) {
            log.error("Unexpected error in Native Gemini call", e);
            throw new AIServiceException("Failed to generate AI response: " + e.getMessage());
        }
    }
}
