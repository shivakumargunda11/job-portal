package com.careerconnect.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;
    private final long maxFileSizeBytes;

    // Allowed extensions
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("pdf", "doc", "docx");

    // File magic bytes signatures
    private static final byte[] PDF_MAGIC = new byte[]{0x25, 0x50, 0x44, 0x46}; // %PDF-
    private static final byte[] DOC_MAGIC = new byte[]{(byte) 0xD0, (byte) 0xCF, 0x11, (byte) 0xE0, (byte) 0xA1, (byte) 0xB1, 0x1A, (byte) 0xE1}; // OLE2
    private static final byte[] DOCX_MAGIC = new byte[]{0x50, 0x4B, 0x03, 0x04}; // ZIP archive PK..

    public FileStorageService(
            @Value("${app.upload.dir:uploads/resumes}") String uploadDirPath,
            @Value("${app.upload.max-file-size:5242880}") long maxFileSizeBytes) {
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        this.maxFileSizeBytes = maxFileSizeBytes;
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize upload directory: " + this.uploadDir, e);
        }
    }

    public static class StoredFileInfo {
        private final String storedFileName;
        private final String originalFileName;
        private final String contentType;
        private final long size;

        public StoredFileInfo(String storedFileName, String originalFileName, String contentType, long size) {
            this.storedFileName = storedFileName;
            this.originalFileName = originalFileName;
            this.contentType = contentType;
            this.size = size;
        }

        public String getStoredFileName() { return storedFileName; }
        public String getOriginalFileName() { return originalFileName; }
        public String getContentType() { return contentType; }
        public long getSize() { return size; }
    }

    public StoredFileInfo storeResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Resume file is required. Please select a valid file.");
        }

        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("File size exceeds the 5 MB limit. Please upload a smaller file.");
        }

        String rawOriginalName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume");
        if (rawOriginalName.contains("..")) {
            throw new IllegalArgumentException("Filename contains invalid relative path sequence: " + rawOriginalName);
        }

        String extension = getFileExtension(rawOriginalName).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("Invalid file type: ." + extension + ". Only PDF, DOC, and DOCX files are allowed.");
        }

        // Validate content by inspection of magic bytes / content signature
        validateFileContent(file, extension);

        // Generate unique, collision-resistant filename
        String uniqueFileName = UUID.randomUUID().toString() + "_" + sanitizeFileName(rawOriginalName);
        Path targetPath = this.uploadDir.resolve(uniqueFileName);

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store uploaded file: " + rawOriginalName, e);
        }

        String detectedContentType = file.getContentType();
        if (detectedContentType == null || detectedContentType.isBlank() || detectedContentType.equals("application/octet-stream")) {
            if ("pdf".equals(extension)) detectedContentType = "application/pdf";
            else if ("doc".equals(extension)) detectedContentType = "application/msword";
            else if ("docx".equals(extension)) detectedContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }

        return new StoredFileInfo(uniqueFileName, rawOriginalName, detectedContentType, file.getSize());
    }

    public Resource loadAsResource(String filename) {
        try {
            Path filePath = this.uploadDir.resolve(filename).normalize();
            if (!filePath.startsWith(this.uploadDir)) {
                throw new IllegalArgumentException("Cannot access file outside designated upload directory");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("File not found or unreadable: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("File path is invalid: " + filename, e);
        }
    }

    private void validateFileContent(MultipartFile file, String extension) {
        try (InputStream is = file.getInputStream()) {
            byte[] header = new byte[8];
            int read = is.read(header);
            if (read < 4) {
                throw new IllegalArgumentException("Uploaded file is corrupted or too small to be valid.");
            }

            if ("pdf".equals(extension)) {
                if (!matchesHeader(header, PDF_MAGIC)) {
                    throw new IllegalArgumentException("File content is not a valid PDF document.");
                }
            } else if ("doc".equals(extension)) {
                if (!matchesHeader(header, DOC_MAGIC)) {
                    throw new IllegalArgumentException("File content is not a valid DOC document.");
                }
            } else if ("docx".equals(extension)) {
                if (!matchesHeader(header, DOCX_MAGIC)) {
                    throw new IllegalArgumentException("File content is not a valid DOCX document.");
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Failed to read and validate resume file content: " + e.getMessage());
        }
    }

    private boolean matchesHeader(byte[] data, byte[] magic) {
        if (data.length < magic.length) return false;
        for (int i = 0; i < magic.length; i++) {
            if (data[i] != magic[i]) return false;
        }
        return true;
    }

    private String getFileExtension(String filename) {
        int dotIdx = filename.lastIndexOf('.');
        if (dotIdx > 0 && dotIdx < filename.length() - 1) {
            return filename.substring(dotIdx + 1);
        }
        return "";
    }

    private String sanitizeFileName(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
