package com.mzdx.zht.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 评价视图对象（VO）
 * 用于展示评价信息，包含评价者的完整数据（昵称、头像等）
 */
@Data
public class ReviewVO {
    
    /**
     * 评价 ID
     */
    private Long id;
    
    /**
     * 交换记录 ID
     */
    private Long exchangeId;
    
    /**
     * 评价者 ID
     */
    private Long reviewerId;
    
    /**
     * 评价者昵称
     */
    private String reviewerNickname;
    
    /**
     * 评价者头像 URL
     */
    private String reviewerAvatar;
    
    /**
     * 被评价者 ID
     */
    private Long reviewedId;
    
    /**
     * 评分（1-5）
     */
    private Integer rating;
    
    /**
     * 评价内容
     */
    private String content;
    
    /**
     * 评价创建时间
     */
    private LocalDateTime createTime;
}
