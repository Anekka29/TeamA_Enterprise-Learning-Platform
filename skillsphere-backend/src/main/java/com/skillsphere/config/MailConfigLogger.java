package com.skillsphere.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MailConfigLogger implements CommandLineRunner {

    @Value("${spring.mail.host:NOT SET}")
    private String mailHost;

    @Value("${spring.mail.port:0}")
    private int mailPort;

    @Value("${spring.mail.username:NOT SET}")
    private String mailUsername;

    @Value("${spring.mail.password:NOT SET}")
    private String mailPassword;

    @Override
    public void run(String... args) {
        log.info("=== Mail Configuration Verification ===");
        log.info("Mail Host: {}", mailHost);
        log.info("Mail Port: {}", mailPort);
        
        // Trim whitespace for verification
        String trimmedUsername = mailUsername.trim();
        String trimmedPassword = mailPassword.trim();
        
        log.info("Mail Username (raw): '{}' (length: {})", mailUsername, mailUsername.length());
        log.info("Mail Username (trimmed): '{}' (length: {})", trimmedUsername, trimmedUsername.length());
        log.info("Mail Password Loaded: {}", (mailPassword != null && !mailPassword.isBlank()) ? "YES" : "NO");
        log.info("Mail Password (raw length): {}", mailPassword.length());
        log.info("Mail Password (trimmed length): {}", trimmedPassword.length());
        log.info("========================================");
    }
}
