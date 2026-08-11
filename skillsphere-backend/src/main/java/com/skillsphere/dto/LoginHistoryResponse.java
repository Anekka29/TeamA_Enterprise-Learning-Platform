package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistoryResponse {
    private Long id;
    private String ipAddress;
    private String userAgent;
    private String location;
    private Boolean successful;
    private LocalDateTime loginAt;
}
