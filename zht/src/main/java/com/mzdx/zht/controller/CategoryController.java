package com.mzdx.zht.controller;

import com.mzdx.zht.common.Result;
import com.mzdx.zht.entity.Category;
import com.mzdx.zht.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 分类控制器
 */
@Tag(name = "分类管理")
@RestController
@RequestMapping("/category")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    
    @Operation(summary = "获取所有分类")
    @GetMapping("/list")
    public Result<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return Result.success(categories);
    }
    
    @Operation(summary = "获取热门分类")
    @GetMapping("/hot")
    public Result<List<Category>> getHotCategories() {
        List<Category> categories = categoryService.getHotCategories();
        return Result.success(categories);
    }
}
