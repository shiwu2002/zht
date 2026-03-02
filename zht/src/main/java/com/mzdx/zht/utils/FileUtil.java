package com.mzdx.zht.utils;

import com.mzdx.zht.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
public class FileUtil {
    
    @Value("${file.upload.path}")
    private String uploadPath;
    
    @Value("${file.upload.base-url}")
    private String baseUrl;
    
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "bmp", "webp"
    );
    
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
    
    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("文件不能为空");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(6003, "文件大小不能超过10MB");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new BusinessException("文件名不能为空");
        }
        
        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new BusinessException(6002, "不支持的文件类型");
        }
        
        String newFileName = UUID.randomUUID() + "." + extension;
        
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }
        
        try {
            Path filePath = Paths.get(uploadPath, newFileName);
            Files.copy(file.getInputStream(), filePath);
            log.info("文件上传成功：{}", newFileName);
            return baseUrl + newFileName;
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new BusinessException(6001, "文件上传失败");
        }
    }
    
    public String uploadImage(MultipartFile file) {
        return uploadFile(file);
    }
    
    public List<String> uploadFiles(MultipartFile[] files) {
        return Arrays.stream(files).map(this::uploadFile).toList();
    }
    
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf(".");
        if (lastDotIndex == -1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }
    
    public void deleteImage(String fileUrl) {
        deleteFile(fileUrl);
    }
    
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || !fileUrl.startsWith(baseUrl)) {
            return;
        }
        
        String fileName = fileUrl.substring(baseUrl.length());
        Path filePath = Paths.get(uploadPath, fileName);
        
        try {
            Files.deleteIfExists(filePath);
            log.info("文件删除成功：{}", fileName);
        } catch (IOException e) {
            log.error("文件删除失败", e);
        }
    }
}
