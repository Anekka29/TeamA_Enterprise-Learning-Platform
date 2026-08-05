package com.skillsphere.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
public class OAuth2RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestUri = request.getRequestURI();

        if (requestUri.startsWith("/oauth2/authorization") || requestUri.startsWith("/login/oauth2/code")) {
            log.info("=== OAuth2 Request Received ===");
            log.info("Request URI: {}", requestUri);
            log.info("Request URL: {}", request.getRequestURL());
            log.info("Method: {}", request.getMethod());
            log.info("Query String: {}", request.getQueryString());
            log.info("Remote Address: {}", request.getRemoteAddr());
            log.info("==============================");
        }

        filterChain.doFilter(request, response);
    }
}
