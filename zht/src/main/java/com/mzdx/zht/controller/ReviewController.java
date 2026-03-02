package com.mzdx.zht.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mzdx.zht.common.Result;
import com.mzdx.zht.dto.ReviewDTO;
import com.mzdx.zht.entity.Review;
import com.mzdx.zht.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 评价控制器
 */
@Tag(name = "评价管理")
@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @Operation(summary = "添加评价")
    @PostMapping("/add")
    public Result<Boolean> addReview(@RequestAttribute("userId") Long userId,
                                     @RequestBody ReviewDTO reviewDTO) {
        boolean result = reviewService.addReview(reviewDTO, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "获取用户评价列表")
    @GetMapping("/user/{userId}")
    public Result<Page<Review>> getUserReviews(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size) {
        Page<Review> page = reviewService.getUserReviews(userId, current, size);
        return Result.success(page);
    }
    
    @Operation(summary = "获取交换评价")
    @GetMapping("/exchange/{exchangeId}")
    public Result<Review> getExchangeReview(@RequestAttribute("userId") Long userId,
                                            @PathVariable Long exchangeId) {
        Review review = reviewService.getExchangeReview(exchangeId, userId);
        return Result.success(review);
    }
}
