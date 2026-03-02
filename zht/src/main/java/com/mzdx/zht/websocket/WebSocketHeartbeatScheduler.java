package com.mzdx.zht.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * WebSocket心跳检测调度器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketHeartbeatScheduler {
    
    private final WebSocketSessionManager sessionManager;
    
    @Scheduled(fixedRate = 30000)
    public void checkHeartbeat() {
        List<WebSocketSessionManager.SessionInfo> onlineUsers = sessionManager.getOnlineUsers();
        LocalDateTime now = LocalDateTime.now();
        
        for (WebSocketSessionManager.SessionInfo info : onlineUsers) {
            try {
                long minutesSinceLastActive = Duration.between(info.getLastActiveTime(), now).toMinutes();
                
                if (minutesSinceLastActive >= 2) {
                    WebSocketSession session = sessionManager.getSession(info.getUserId());
                    if (session != null && session.isOpen()) {
                        try {
                            session.sendMessage(new TextMessage("{\"type\":\"heartbeat\"}"));
                            log.debug("发送心跳包给用户: {}", info.getUserId());
                        } catch (IOException e) {
                            log.error("发送心跳包失败，用户ID: {}", info.getUserId(), e);
                            sessionManager.removeSession(info.getUserId());
                        }
                    } else {
                        sessionManager.removeSession(info.getUserId());
                    }
                }
                
                if (minutesSinceLastActive >= 5) {
                    log.warn("用户{}超时未活动，断开连接", info.getUserId());
                    WebSocketSession session = sessionManager.getSession(info.getUserId());
                    if (session != null && session.isOpen()) {
                        try {
                            session.close();
                        } catch (IOException e) {
                            log.error("关闭会话失败", e);
                        }
                    }
                    sessionManager.removeSession(info.getUserId());
                }
            } catch (Exception e) {
                log.error("心跳检测异常，用户ID: {}", info.getUserId(), e);
            }
        }
    }
}
