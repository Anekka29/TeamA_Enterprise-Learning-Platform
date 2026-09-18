package com.skillsphere.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        log.info("=== Preparing to send password reset email to: {} ===", toEmail);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "SkillSphere Nexus");
            helper.setTo(toEmail);
            helper.setReplyTo(fromEmail);
            helper.setSubject("Password Reset Request - SkillSphere Nexus");

            // HTML version
            String htmlContent = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset - SkillSphere Nexus</title>
                </head>
                <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f6f8;">
                    <table role="presentation" cellspacing="0" cellpadding="0" width="100%%" style="background-color: #f4f6f8; padding: 20px 0;">
                        <tr>
                            <td align="center">
                                <table role="presentation" cellspacing="0" cellpadding="0" width="600" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); overflow: hidden;">
                                    <!-- Header -->
                                    <tr>
                                        <td style="background-color: #10B981; padding: 30px 20px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">SkillSphere Nexus</h1>
                                        </td>
                                    </tr>
                                    <!-- Body -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 22px;">Hello,</h2>
                                            <p style="color: #4a5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                                We received a request to reset the password for your SkillSphere Nexus account. Click the button below to set a new password:
                                            </p>
                                            <!-- Button -->
                                            <div style="text-align: center; margin: 40px 0;">
                                                <a href="%s" style="display: inline-block; background-color: #10B981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                                    Reset Password
                                                </a>
                                            </div>
                                            <!-- Expiry Notice -->
                                            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                                                This password reset link will expire in <strong>15 minutes</strong>.
                                            </p>
                                            <!-- Ignore Notice -->
                                            <p style="color: #718096; font-size: 14px; line-height: 1.6; margin: 0 0 30px 0;">
                                                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                                            </p>
                                            <!-- Security Notice -->
                                            <div style="background-color: #f7fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #10B981;">
                                                <p style="color: #4a5568; font-size: 14px; margin: 0;">
                                                    <strong>Security Tip:</strong> Never share this link with anyone. SkillSphere will never ask for your password via email.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    <!-- Footer -->
                                    <tr>
                                        <td style="padding: 20px 30px; background-color: #edf2f7; text-align: center;">
                                            <p style="color: #718096; font-size: 13px; margin: 0 0 8px 0;">
                                                SkillSphere Nexus &copy; 2024
                                            </p>
                                            <p style="color: #718096; font-size: 13px; margin: 0;">
                                                For support, contact us at support@skillspherenexus.com
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(resetLink);

            // Plain text version
            String plainTextContent = """
                SkillSphere Nexus - Password Reset
                
                Hello,
                
                We received a request to reset your password. Use the link below to choose a new password:
                
                %s
                
                This link will expire in 15 minutes.
                
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                
                Security Tip: Never share this link with anyone. SkillSphere will never ask for your password via email.
                
                ---
                SkillSphere Nexus
                support@skillspherenexus.com
                """.formatted(resetLink);

            helper.setText(plainTextContent, htmlContent);
            log.info("Email content created (HTML + plain text), calling mailSender.send()...");
            mailSender.send(message);
            log.info("=== Email sent successfully to: {} ===", toEmail);
        } catch (MessagingException e) {
            log.error("MessagingException while sending password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        } catch (Exception e) {
            log.error("Exception while sending password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }
}
