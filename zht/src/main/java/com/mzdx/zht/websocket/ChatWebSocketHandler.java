package com.mzdx.zht.websocket;

import cn.hutool.json.JSONUtil;
import com.mzdx.zht.dto.MessageDTO;
import com.mzdx.zht.entity.Message;
import com.mzdx.zht.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * WebSocket聊天处理器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {
    
    private final MessageService messageService;
    private final WebSocketSessionManager sessionManager;
    private final MessageRateLimiter rateLimiter;
    
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Long userId = (Long) session.getAttributes().get("userId");
        String remoteAddress = (String) session.getAttributes().get("remoteAddress");
        String userAgent = (String) session.getAttributes().get("userAgent");
        
        if (userId != null) {
            sessionManager.addSession(userId, session, remoteAddress, userAgent);
            log.info("WebSocket连接建立: userId={}, sessionId={}, 在线人数={}", 
                userId, session.getId(), sessionManager.getOnlineCount());
            
            // 推送离线消息
            pushOfflineMessages(userId, session);
        }
    }
    
    /**
     * 推送离线消息给用户
     */
    private void pushOfflineMessages(Long userId, WebSocketSession session) {
        try {
            List<Message> offlineMessages = messageService.getOfflineMessages(userId);
            
            if (!offlineMessages.isEmpty()) {
                for (Message message : offlineMessages) {
                    String messageJson = String.format(
                        "{\"type\":\"offline_message\",\"id\":%d,\"senderId\":%d,\"content\":\"%s\",\"createTime\":\"%s\"}",
                        message.getId(),
                        message.getSenderId(),
                        escapeJson(message.getContent()),
                        message.getCreateTime()
                    );
                    
                    session.sendMessage(new TextMessage(messageJson));
                }
                
                log.info("推送离线消息完成: userId={}, count={}", userId, offlineMessages.size());
            }
        } catch (Exception e) {
            log.error("推送离线消息失败: userId={}, error={}", userId, e.getMessage(), e);
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
    
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Long senderId = getUserId(session);
        if (senderId == null) {
            return;
        }
        
        // 更新最后活动时间
        sessionManager.updateLastActiveTime(senderId);
        
        try {
            // 解析消息
            Map<String, Object> payload = JSONUtil.toBean(message.getPayload(), Map.class);
            String type = (String) payload.get("type");
            
            // 处理心跳响应
            if ("pong".equals(type)) {
                log.debug("收到用户{}的心跳响应", senderId);
                return;
            }
            
            // 限流检查
            if (!rateLimiter.tryAcquire(senderId)) {
                Map<String, Object> error = new HashMap<>();
                error.put("type", "error");
                error.put("code", "RATE_LIMIT");
                error.put("message", "发送消息过于频繁，请稍后再试");
                session.sendMessage(new TextMessage(JSONUtil.toJsonStr(error)));
                return;
            }
            
            // 解析业务消息
            MessageDTO messageDTO = JSONUtil.toBean(message.getPayload(), MessageDTO.class);
            String messageId = (String) payload.get("messageId");
            
            // 保存消息到数据库并尝试实时推送
            messageService.sendMessage(messageDTO, senderId);
            
            // 发送确认回执给发送者
            Map<String, Object> ack = new HashMap<>();
            ack.put("type", "ack");
            ack.put("messageId", messageId);
            ack.put("status", "success");
            ack.put("timestamp", System.currentTimeMillis());
            session.sendMessage(new TextMessage(JSONUtil.toJsonStr(ack)));
            
            log.info("用户{}发送消息给用户{}", senderId, messageDTO.getReceiverId());
            
        } catch (Exception e) {
            log.error("处理WebSocket消息失败", e);
            
            // 发送错误回执
            Map<String, Object> errorAck = new HashMap<>();
            errorAck.put("type", "ack");
            errorAck.put("status", "error");
            errorAck.put("message", e.getMessage());
            session.sendMessage(new TextMessage(JSONUtil.toJsonStr(errorAck)));
        }
    }
    
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        Long userId = getUserId(session);
        if (userId != null) {
            sessionManager.removeSession(userId);
            rateLimiter.cleanup(userId);
            log.info("用户{}断开WebSocket连接，状态: {}", userId, status);
        }
    }
    
    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket传输错误", exception);
    }
    
    /**
     * 从会话中获取用户ID
     */
    private Long getUserId(WebSocketSession session) {
        Object userIdObj = session.getAttributes().get("userId");
        if (userIdObj != null) {
            return Long.parseLong(userIdObj.toString());
        }
        return null;
    }
}
