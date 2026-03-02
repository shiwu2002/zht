package com.mzdx.zht.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mzdx.zht.entity.Message;
import com.mzdx.zht.dto.MessageDTO;

import java.util.List;

/**
 * 消息服务接口
 */
public interface MessageService extends IService<Message> {
    
    /**
     * 发送消息
     */
    boolean sendMessage(MessageDTO messageDTO, Long senderId);
    
    /**
     * 获取会话列表
     */
    List<Message> getConversationList(Long userId);
    
    /**
     * 获取聊天记录
     */
    Page<Message> getChatHistory(Long userId, Long targetUserId, Integer current, Integer size);
    
    /**
     * 标记消息已读
     */
    boolean markAsRead(Long messageId);
    
    /**
     * 获取未读消息数
     */
    Integer getUnreadCount(Long userId);
    
    /**
     * 获取用户的离线消息
     */
    List<Message> getOfflineMessages(Long userId);
}
