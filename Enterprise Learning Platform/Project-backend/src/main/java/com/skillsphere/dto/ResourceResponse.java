package com.skillsphere.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private Long id;
    private Long lessonId;
    private String title;
    private String description;
    private String url;
    private String type;
    private Integer orderIndex;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLessonId() {
        return lessonId;
    }

    public void setLessonId(Long lessonId) {
        this.lessonId = lessonId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(Integer orderIndex) {
        this.orderIndex = orderIndex;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public static ResourceResponseBuilder builder() {
        return new ResourceResponseBuilder();
    }

    public static class ResourceResponseBuilder {
        private Long id;
        private Long lessonId;
        private String title;
        private String description;
        private String url;
        private String type;
        private Integer orderIndex;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        ResourceResponseBuilder() {
        }

        public ResourceResponseBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ResourceResponseBuilder lessonId(Long lessonId) {
            this.lessonId = lessonId;
            return this;
        }

        public ResourceResponseBuilder title(String title) {
            this.title = title;
            return this;
        }

        public ResourceResponseBuilder description(String description) {
            this.description = description;
            return this;
        }

        public ResourceResponseBuilder url(String url) {
            this.url = url;
            return this;
        }

        public ResourceResponseBuilder type(String type) {
            this.type = type;
            return this;
        }

        public ResourceResponseBuilder orderIndex(Integer orderIndex) {
            this.orderIndex = orderIndex;
            return this;
        }

        public ResourceResponseBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ResourceResponseBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public ResourceResponse build() {
            return new ResourceResponse(id, lessonId, title, description, url, type, orderIndex, createdAt, updatedAt);
        }
    }
}
