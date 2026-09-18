package com.skillsphere.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaUploadController {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    private static final long MAX_AUDIO_SIZE = 10 * 1024 * 1024; // 10MB
    private static final long MAX_DOC_SIZE = 30 * 1024 * 1024; // 30MB

    private static final List<String> ALLOWED_IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final List<String> ALLOWED_IMAGE_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");

    private static final List<String> ALLOWED_VIDEO_EXTENSIONS = Arrays.asList("mp4", "mov", "webm");
    private static final List<String> ALLOWED_VIDEO_MIME_TYPES = Arrays.asList("video/mp4", "video/quicktime", "video/webm");

    private static final List<String> ALLOWED_AUDIO_EXTENSIONS = Arrays.asList("mp3", "wav", "ogg");
    private static final List<String> ALLOWED_AUDIO_MIME_TYPES = Arrays.asList("audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3");

    private static final List<String> ALLOWED_DOC_EXTENSIONS = Arrays.asList("pdf", "docx", "ppt", "pptx", "zip");
    private static final List<String> ALLOWED_DOC_MIME_TYPES = Arrays.asList(
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/zip",
            "application/x-zip-compressed"
    );

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid file name"));
        }

        // Validate extension
        String extension = getFileExtension(originalFilename).toLowerCase();
        String contentType = file.getContentType();

        boolean isImage = ALLOWED_IMAGE_EXTENSIONS.contains(extension) && contentType != null && ALLOWED_IMAGE_MIME_TYPES.contains(contentType.toLowerCase());
        boolean isVideo = ALLOWED_VIDEO_EXTENSIONS.contains(extension) && contentType != null && ALLOWED_VIDEO_MIME_TYPES.contains(contentType.toLowerCase());
        boolean isAudio = ALLOWED_AUDIO_EXTENSIONS.contains(extension) && contentType != null && ALLOWED_AUDIO_MIME_TYPES.contains(contentType.toLowerCase());
        boolean isDoc = ALLOWED_DOC_EXTENSIONS.contains(extension) && contentType != null && ALLOWED_DOC_MIME_TYPES.contains(contentType.toLowerCase());

        if (!isImage && !isVideo && !isAudio && !isDoc) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Unsupported file type. Supported types: Images (JPG, PNG, WEBP), Videos (MP4, MOV, WEBM), Audio (MP3, WAV, OGG), Documents (PDF, DOCX, PPT, PPTX, ZIP)"
            ));
        }

        // Validate size
        long fileSize = file.getSize();
        if (isImage && fileSize > MAX_IMAGE_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Image file exceeds maximum limit of 5MB"));
        }
        if (isVideo && fileSize > MAX_VIDEO_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Video file exceeds maximum limit of 50MB"));
        }
        if (isAudio && fileSize > MAX_AUDIO_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Audio file exceeds maximum limit of 10MB"));
        }
        if (isDoc && fileSize > MAX_DOC_SIZE) {
            return ResponseEntity.badRequest().body(Map.of("message", "Document file exceeds maximum limit of 30MB"));
        }

        try {
            // Ensure upload directory exists
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Generate unique name
            String uniqueFilename = UUID.randomUUID().toString() + "_" + StringUtils.cleanPath(originalFilename);
            Path targetLocation = uploadPath.resolve(uniqueFilename);

            // Save file
            Files.copy(file.getInputStream(), targetLocation);

            // Construct serving URL
            String fileDownloadUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/")
                    .path(uniqueFilename)
                    .toUriString();

            return ResponseEntity.ok(Map.of(
                    "url", fileDownloadUrl,
                    "filename", uniqueFilename,
                    "size", fileSize,
                    "contentType", contentType
            ));

        } catch (IOException e) {
            log.error("Failed to store file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Could not store file: " + e.getMessage()));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam("url") String fileUrl) {
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "File URL is required"));
        }

        try {
            String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
            if (filename.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid file URL"));
            }

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path targetLocation = uploadPath.resolve(filename).normalize();

            // Directory traversal protection
            if (!targetLocation.startsWith(uploadPath)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Access denied"));
            }

            boolean deleted = Files.deleteIfExists(targetLocation);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "File not found on disk"));
            }

        } catch (Exception e) {
            log.error("Failed to delete file", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Could not delete file: " + e.getMessage()));
        }
    }

    private String getFileExtension(String filename) {
        int lastIndex = filename.lastIndexOf('.');
        if (lastIndex == -1) {
            return "";
        }
        return filename.substring(lastIndex + 1);
    }
}
