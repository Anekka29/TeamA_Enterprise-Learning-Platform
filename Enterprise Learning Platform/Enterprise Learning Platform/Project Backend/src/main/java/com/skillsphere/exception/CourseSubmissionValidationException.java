package com.skillsphere.exception;

import java.util.Map;

public class CourseSubmissionValidationException extends RuntimeException {
    private final Map<String, String> errors;

    public CourseSubmissionValidationException(String message, Map<String, String> errors) {
        super(message);
        this.errors = errors;
    }

    public Map<String, String> getErrors() {
        return errors;
    }
}
