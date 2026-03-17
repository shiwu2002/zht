package com.mzdx.zht.service.impl;

import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.dto.ChatMessageDTO;
import com.mzdx.zht.dto.MessageDTO;
import com.mzdx.zht.entity.Message;
import com.mzdx.zht.entity.User;
import com.mzdx.zht.mapper.MessageMapper;
import com.mzdx.zht.service.MessageService;
import com.mzdx.zht.service.UserService;
import com.mzdx.zht.websocket.WebSocketSessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 消息服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl extends ServiceImpl<MessageMapper, Message> implements MessageService {

    private final WebSocketSessionManager sessionManager;
    private final UserService userService;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean sendMessage(MessageDTO messageDTO, Long senderId) {
        Message message = BeanUtil.copyProperties(messageDTO, Message.class);
        message.setSenderId(senderId);
        message.setIsRead(0);
        
        // 保存消息到数据库
        boolean saved = this.save(message);
        
        if (saved) {
            // 尝试实时推送消息
            boolean pushed = pushMessageToUser(message);
            
            if (pushed) {
                log.info("消息实时推送成功: senderId={}, receiverId={}, messageId={}", 
                    senderId, message.getReceiverId(), message.getId());
            } else {
                log.info("用户不在线，消息已保存为离线消息: receiverId={}, messageId={}", 
                    message.getReceiverId(), message.getId());
            }
        }
        
        return saved;
    }
    
    /**
     * 推送消息给在线用户
     * @param message 消息对象
     * @return 是否推送成功
     */
    private boolean pushMessageToUser(Message message) {
        Long receiverId = message.getReceiverId();
        WebSocketSession session = sessionManager.getSession(receiverId);
        
        if (session == null || !session.isOpen()) {
            return false;
        }
        
        try {
            // 构建消息JSON
            String messageJson = String.format(
                "{\"type\":\"message\",\"id\":%d,\"senderId\":%d,\"content\":\"%s\",\"createTime\":\"%s\"}",
                message.getId(),
                message.getSenderId(),
                escapeJson(message.getContent()),
                message.getCreateTime()
            );
            
            session.sendMessage(new TextMessage(messageJson));
            return true;
        } catch (Exception e) {
            log.error("推送消息失败: receiverId={}, error={}", receiverId, e.getMessage());
            return false;
        }
    }
    
    /**
     * 转义JSON字符串中的特殊字符
     */
    private String escapeJson(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }
    
    /**
     * 获取用户的离线消息
     * @param userId 用户ID
     * @return 离线消息列表
     */
    public List<Message> getOfflineMessages(Long userId) {
        List<Message> messages = this.list(new LambdaQueryWrapper<Message>()
                .eq(Message::getReceiverId, userId)
                .eq(Message::getIsRead, 0)
                .orderByAsc(Message::getCreateTime));
        
        log.info("获取离线消息: userId={}, count={}", userId, messages.size());
        return messages;
    }
    
    @Override
    public List<Message> getConversationList(Long userId) {
        // 获取最近的会话列表（简化实现）
        return this.list(new LambdaQueryWrapper<Message>()
                .and(wrapper -> wrapper.eq(Message::getSenderId, userId)
                        .or()
                        .eq(Message::getReceiverId, userId))
                .orderByDesc(Message::getCreateTime)
                .last("LIMIT 50"));
    }
    
    @Override
    public Page<ChatMessageDTO> getChatHistory(Long userId, Long targetUserId, Integer current, Integer size) {
        Page<Message> messagePage = new Page<>(current, size);
        LambdaQueryWrapper<Message> wrapper = new LambdaQueryWrapper<>();

        wrapper.and(w -> w
                .and(w1 -> w1.eq(Message::getSenderId, userId).eq(Message::getReceiverId, targetUserId))
                .or(w2 -> w2.eq(Message::getSenderId, targetUserId).eq(Message::getReceiverId, userId))
        ).orderByDesc(Message::getCreateTime);

        Page<Message> page = this.page(messagePage, wrapper);

        // 转换为 ChatMessageDTO 并填充头像信息
        Page<ChatMessageDTO> dtoPage = new Page<>(page.getCurrent(), page.getSize(), page.getTotal());
        List<ChatMessageDTO> dtoList = convertToDTOWithAvatars(page.getRecords(), userId, targetUserId);
        dtoPage.setRecords(dtoList);

        return dtoPage;
    }

    /**
     * 将 Message 列表转换为 ChatMessageDTO 列表，并填充发送者和接收者的头像信息
     * @param messages 消息列表
     * @param userId 当前登录用户 ID
     * @param targetUserId 对话目标用户 ID
     * @return ChatMessageDTO 列表
     */
    private List<ChatMessageDTO> convertToDTOWithAvatars(List<Message> messages, Long userId, Long targetUserId) {
        // 收集需要查询的用户 ID（去重）
        Set<Long> userIds = new HashSet<>();
        for (Message message : messages) {
            userIds.add(message.getSenderId());
            userIds.add(message.getReceiverId());
        }

        // 批量查询用户信息
        List<User> users = userService.listByIds(userIds);
        Map<Long, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, u -> u, (k1, k2) -> k1));

        // 转换为 DTO
        return messages.stream()
                .map(message -> {
                    ChatMessageDTO dto = BeanUtil.copyProperties(message, ChatMessageDTO.class);

                    User sender = userMap.get(message.getSenderId());
                    if (sender != null) {
                        dto.setSenderAvatar(sender.getAvatar());
                        dto.setSenderNickname(sender.getNickname());
                    }

                    User receiver = userMap.get(message.getReceiverId());
                    if (receiver != null) {
                        dto.setReceiverAvatar(receiver.getAvatar());
                        dto.setReceiverNickname(receiver.getNickname());
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean markAsRead(Long messageId) {
        Message message = this.getById(messageId);
        if (message != null) {
            message.setIsRead(1);
            return this.updateById(message);
        }
        return false;
    }
    
    @Override
    public Integer getUnreadCount(Long userId) {
        return Math.toIntExact(this.count(new LambdaQueryWrapper<Message>()
                .eq(Message::getReceiverId, userId)
                .eq(Message::getIsRead, 0)));
    }
}
