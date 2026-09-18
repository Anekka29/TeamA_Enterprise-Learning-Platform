package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardItem {
    private Integer rank;
    private Long studentId;
    private String name;
    private Integer xp;
    private String initial;
    private Boolean active;
    private String status;
}
