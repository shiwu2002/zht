package com.mzdx.zht.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * 聊天消息 DTO，包含发送者和接收者的头像信息
 */
@Data
public class ChatMessageDTO {

    private Long id;
    private Long senderId;
    private Long receiverId;
    private Long itemId;
    private String content;
    private Integer type;
    private Integer isRead;
    private LocalDateTime createTime;

    /**
     * 发送者头像
     */
    private String senderAvatar;

    /**
     * 发送者昵称
     */
    private String senderNickname;

    /**
     * 接收者头像
     */
    private String receiverAvatar;

    /**
     * 接收者昵称
     */
    private String receiverNickname;
}
