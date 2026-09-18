package com.skillsphere.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2ClientLogger implements CommandLineRunner {

    private final ClientRegistrationRepository clientRegistrationRepository;

    @Override
    public void run(String... args) {
        ClientRegistration googleRegistration = clientRegistrationRepository.findByRegistrationId("google");
        if (googleRegistration != null) {
            log.info("=== Google OAuth2 ClientRegistration Details ===");
            log.info("Registration ID: {}", googleRegistration.getRegistrationId());
            log.info("Client ID: {}", googleRegistration.getClientId());
            log.info("Redirect URI Template: {}", googleRegistration.getRedirectUri());
            log.info("Authorization URI: {}", googleRegistration.getProviderDetails().getAuthorizationUri());
            log.info("Token URI: {}", googleRegistration.getProviderDetails().getTokenUri());
            log.info("User Info URI: {}", googleRegistration.getProviderDetails().getUserInfoEndpoint().getUri());
            log.info("================================================");
        } else {
            log.warn("No Google OAuth2 ClientRegistration found!");
        }
    }
}
