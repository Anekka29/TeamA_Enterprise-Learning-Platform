package com.skillsphere.ai.provider;

import java.util.List;

public interface AIProvider {
    String generateResponse(List<String> conversationHistory, String userMessage);
}
