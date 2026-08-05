package com.skillsphere.service;

import com.skillsphere.dto.LoginRequest;
import com.skillsphere.dto.LoginResponse;
import com.skillsphere.dto.RegisterRequest;

public interface AuthService {

    LoginResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    void forgotPassword(String email);

    boolean validateResetToken(String token);

    void resetPassword(String token, String newPassword);
}
