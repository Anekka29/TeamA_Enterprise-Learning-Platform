package com.skillsphere.security;

import com.skillsphere.entity.User;
import com.skillsphere.enums.Role;
import com.skillsphere.enums.Provider;
import com.skillsphere.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        log.info("===== CustomOAuth2UserService.loadUser START =====");
        try {
            OAuth2User oAuth2User = super.loadUser(userRequest);
            log.info("Successfully loaded OAuth2 user from Google");
            
            String email = oAuth2User.getAttribute("email");
            String name = oAuth2User.getAttribute("name");
            String picture = oAuth2User.getAttribute("picture");
            String sub = oAuth2User.getAttribute("sub");
            
            log.info("OAuth2 attributes: email={}, name={}, picture={}, sub={}", email, name, picture, sub);
            
            Optional<User> userOptional = userRepository.findByEmail(email);
            log.info("User found in DB? {}", userOptional.isPresent());
            
            if (userOptional.isEmpty()) {
                log.info("Creating new Google user");
                User newUser = User.builder()
                        .email(email)
                        .fullName(name != null ? name : "Google User")
                        .username(generateUniqueUsername(email))
                        .password(passwordEncoder.encode("GOOGLE_AUTH_USER"))
                        .college("Not Provided")
                        .department("Not Provided")
                        .year("Not Provided")
                        .phoneNumber("")
                        .role(Role.STUDENT)
                        .provider(Provider.GOOGLE)
                        .providerId(sub)
                        .profileImage(picture)
                        .emailVerified(true)
                        .enabled(true)
                        .build();
                
                log.info("New user object before save: {}", newUser);
                userRepository.save(newUser);
                log.info("===== New user CREATED with ID: {} =====", newUser.getId());
            } else {
                User existingUser = userOptional.get();
                log.info("Existing user details: {}", existingUser);
                // Always update these fields even if provider is already GOOGLE
                existingUser.setProvider(Provider.GOOGLE);
                existingUser.setProviderId(sub);
                existingUser.setProfileImage(picture);
                existingUser.setEmailVerified(true);
                userRepository.save(existingUser);
                log.info("===== Existing user updated =====");
            }
            
            log.info("===== CustomOAuth2UserService.loadUser END =====");
            return oAuth2User;
        } catch (Exception e) {
            log.error("===== ERROR in CustomOAuth2UserService =====", e);
            throw new OAuth2AuthenticationException(new OAuth2Error("oauth2_error", e.getMessage(), null), e);
        }
    }

    private String generateUniqueUsername(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
}
