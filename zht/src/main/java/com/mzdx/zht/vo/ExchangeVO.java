package com.mzdx.zht.vo;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 交换信息视图对象（VO）
 * 用于展示交换记录的详细信息，包含物品和用户的完整数据
 */
@Data
public class ExchangeVO {
    
    /**
     * 交换记录 ID
     */
    private Long id;
    
    /**
     * 请求方物品 ID（申请人想要交换的物品）
     */
    private Long itemId;
    
    /**
     * 请求方物品标题
     */
    private String itemTitle;
    
    /**
     * 请求方物品图片 URL（第一张封面图）
     */
    private String itemImage;
    
    /**
     * 提供方物品 ID（被申请交换的物品，即物品拥有者的物品）
     */
    private Long offerItemId;
    
    /**
     * 提供方物品标题（被申请交换的物品标题）
     */
    private String offerItemTitle;
    
    /**
     * 提供方物品图片 URL（被申请交换的物品封面图）
     */
    private String offerItemImage;
    
    /**
     * 申请人 ID（发起交换请求的用户）
     */
    private Long applicantId;
    
    /**
     * 申请人昵称
     */
    private String applicantNickname;
    
    /**
     * 申请人头像 URL
     */
    private String applicantAvatar;
    
    /**
     * 物品拥有者 ID（被申请交换的用户）
     */
    private Long ownerId;
    
    /**
     * 物品拥有者昵称
     */
    private String ownerNickname;
    
    /**
     * 物品拥有者头像 URL
     */
    private String ownerAvatar;
    
    /**
     * 交换留言/备注信息
     */
    private String message;
    
    /**
     * 交换状态：0-待确认，1-已确认，2-已完成，3-已拒绝，4-已取消
     */
    private Integer status;
    
    /**
     * 拒绝原因（当状态为 3 时填写）
     */
    private String rejectReason;
    
    /**
     * 交换完成时间
     */
    private LocalDateTime completedTime;
    
    /**
     * 交换创建时间
     */
    private LocalDateTime createTime;
}
