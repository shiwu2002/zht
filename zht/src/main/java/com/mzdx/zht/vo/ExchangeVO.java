package com.mzdx.zht.vo;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExchangeVO {
    private Long id;
    private Long itemId;
    private String itemTitle;
    private String itemImage;
    private Long applicantId;
    private String applicantNickname;
    private String applicantAvatar;
    private Long ownerId;
    private String ownerNickname;
    private String ownerAvatar;
    private String message;
    private Integer status;
    private String rejectReason;
    private LocalDateTime completedTime;
    private LocalDateTime createTime;
}
