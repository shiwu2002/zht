package com.mzdx.zht.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mzdx.zht.entity.Review;
import com.mzdx.zht.dto.ReviewDTO;

/**
 * 评价服务接口
 */
public interface ReviewService extends IService<Review> {
    
    /**
     * 添加评价
     */
    boolean addReview(ReviewDTO reviewDTO, Long reviewerId);
    
    /**
     * 获取用户评价列表
     */
    Page<Review> getUserReviews(Long userId, Integer current, Integer size);
    
    /**
     * 获取交换评价
     */
    Review getExchangeReview(Long exchangeId, Long reviewerId);
}
