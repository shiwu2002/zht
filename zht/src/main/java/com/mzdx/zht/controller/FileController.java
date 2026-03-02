package com.mzdx.zht.controller;

import com.mzdx.zht.common.Result;
import com.mzdx.zht.utils.FileUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件控制器
 */
@Tag(name = "文件管理")
@RestController
@RequestMapping("/api/file")
@RequiredArgsConstructor
public class FileController {
    
    private final FileUtil fileUtil;
    
    @Operation(summary = "上传图片")
    @PostMapping("/upload")
    public Result<String> uploadImage(@RequestParam("file") MultipartFile file) {
        String url = fileUtil.uploadImage(file);
        return Result.success(url);
    }
    
    @Operation(summary = "删除图片")
    @DeleteMapping("/delete")
    public Result<Boolean> deleteImage(@RequestParam String fileName) {
        fileUtil.deleteImage(fileName);
        return Result.success(true);
    }
}
