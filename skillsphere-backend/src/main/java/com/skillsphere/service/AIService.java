package com.skillsphere.service;

import com.skillsphere.dto.AIChatRequest;
import com.skillsphere.dto.AIChatResponse;
import com.skillsphere.entity.User;

public interface AIService {
    AIChatResponse chat(AIChatRequest request, User user);
}
