package com.skillsphere.security;

import com.skillsphere.entity.User;
import com.skillsphere.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        log.info("===== OAuth2AuthenticationSuccessHandler.onAuthenticationSuccess START =====");
        try {
            log.info("Authentication object: {}", authentication);
            log.info("Principal class: {}", authentication.getPrincipal().getClass().getName());
            
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            log.info("OAuth2User attributes: {}", oAuth2User.getAttributes());
            
            String email = oAuth2User.getAttribute("email");
            log.info("Extracted email from OAuth2User: {}", email);
            
            User user = userRepository.findByEmail(email).orElseThrow(() -> {
                log.error("User not found in DB for email: {}", email);
                return new RuntimeException("User not found during OAuth success");
            });
            
            log.info("Found user in DB: {}", user);
            
            String token = jwtService.generateToken(user.getEmail());
            log.info("Generated JWT token (first 20 chars): {}", token.substring(0, Math.min(20, token.length())));
            
            String redirectUrl = UriComponentsBuilder.fromUriString("http://localhost:5173/oauth2/redirect")
                    .queryParam("token", token)
                    .queryParam("email", user.getEmail())
                    .queryParam("role", user.getRole().name())
                    .build().toUriString();
            log.info("Final redirect URL: {}", redirectUrl);

            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
            log.info("===== OAuth success handler COMPLETED - redirect sent =====");
        } catch (Exception e) {
            log.error("===== ERROR in OAuth2AuthenticationSuccessHandler =====", e);
            throw new ServletException("OAuth2 success handler failed", e);
        }
    }
}
