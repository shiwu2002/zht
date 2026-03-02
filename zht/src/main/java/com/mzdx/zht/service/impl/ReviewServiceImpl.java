package com.mzdx.zht.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.common.ResultCode;
import com.mzdx.zht.dto.ReviewDTO;
import com.mzdx.zht.entity.Review;
import com.mzdx.zht.entity.User;
import com.mzdx.zht.exception.BusinessException;
import com.mzdx.zht.mapper.ReviewMapper;
import com.mzdx.zht.service.ReviewService;
import com.mzdx.zht.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 评价服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl extends ServiceImpl<ReviewMapper, Review> implements ReviewService {
    
    private final UserService userService;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addReview(ReviewDTO reviewDTO, Long reviewerId) {
        // 检查是否已评价
        Review existReview = this.getOne(new LambdaQueryWrapper<Review>()
                .eq(Review::getExchangeId, reviewDTO.getExchangeId())
                .eq(Review::getReviewerId, reviewerId));
        
        if (existReview != null) {
            throw new BusinessException(ResultCode.REVIEW_ALREADY_EXISTS);
        }
        
        Review review = BeanUtil.copyProperties(reviewDTO, Review.class);
        review.setReviewerId(reviewerId);
        
        boolean result = this.save(review);
        
        // 更新被评价用户的信用分
        if (result) {
            User user = userService.getById(reviewDTO.getReviewedId());
            if (user != null) {
                int scoreChange = reviewDTO.getRating() >= 4 ? 5 : -5;
                int newScore = Math.max(0, Math.min(100, user.getCreditScore() + scoreChange));
                userService.updateCreditScore(reviewDTO.getReviewedId(), newScore);
            }
        }
        
        return result;
    }
    
    @Override
    public Page<Review> getUserReviews(Long userId, Integer current, Integer size) {
        Page<Review> page = new Page<>(current, size);
        return this.page(page, new LambdaQueryWrapper<Review>()
                .eq(Review::getReviewedId, userId)
                .orderByDesc(Review::getCreateTime));
    }
    
    @Override
    public Review getExchangeReview(Long exchangeId, Long reviewerId) {
        return this.getOne(new LambdaQueryWrapper<Review>()
                .eq(Review::getExchangeId, exchangeId)
                .eq(Review::getReviewerId, reviewerId));
    }
}
