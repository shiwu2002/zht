package com.mzdx.zht.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.mzdx.zht.common.Result;
import com.mzdx.zht.dto.ReviewDTO;
import com.mzdx.zht.entity.Review;
import com.mzdx.zht.entity.User;
import com.mzdx.zht.service.ReviewService;
import com.mzdx.zht.service.UserService;
import com.mzdx.zht.vo.ReviewVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 评价控制器
 */
@Tag(name = "评价管理")
@RestController
@RequestMapping("/review")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;
    
    @Operation(summary = "添加评价")
    @PostMapping("/add")
    public Result<Boolean> addReview(@RequestAttribute("userId") Long userId,
                                     @RequestBody ReviewDTO reviewDTO) {
        boolean result = reviewService.addReview(reviewDTO, userId);
        return Result.success(result);
    }
    
    @Operation(summary = "获取用户评价列表")
    @GetMapping("/user/{userId}")
    public Result<Page<ReviewVO>> getUserReviews(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "1") Integer current,
            @RequestParam(defaultValue = "10") Integer size) {
        Page<ReviewVO> page = reviewService.getUserReviews(userId, current, size);
        return Result.success(page);
    }
    
    @Operation(summary = "获取交换评价")
    @GetMapping("/exchange/{exchangeId}")
    public Result<ReviewVO> getExchangeReview(@RequestAttribute("userId") Long userId,
                                              @PathVariable Long exchangeId) {
        Review review = reviewService.getExchangeReview(exchangeId, userId);
        if (review == null) {
            return Result.success(null);
        }
        // 转换为 VO，包含评价者信息
        ReviewVO reviewVO = new ReviewVO();
        reviewVO.setId(review.getId());
        reviewVO.setExchangeId(review.getExchangeId());
        reviewVO.setReviewerId(review.getReviewerId());
        reviewVO.setReviewedId(review.getReviewedId());
        reviewVO.setRating(review.getRating());
        reviewVO.setContent(review.getContent());
        reviewVO.setCreateTime(review.getCreateTime());
        // 获取评价者信息
        com.mzdx.zht.entity.User reviewer = userService.getById(review.getReviewerId());
        if (reviewer != null) {
            reviewVO.setReviewerNickname(reviewer.getNickname());
            reviewVO.setReviewerAvatar(reviewer.getAvatar());
        }
        return Result.success(reviewVO);
    }

    @Operation(summary = "获取交换的所有评价")
    @GetMapping("/exchange/list/{exchangeId}")
    public Result<java.util.List<ReviewVO>> getExchangeReviews(@PathVariable Long exchangeId) {
        java.util.List<ReviewVO> reviews = reviewService.getExchangeReviews(exchangeId);
        return Result.success(reviews);
    }
}
