package com.mzdx.zht.websocket;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * WebSocket会话管理器
 * 负责管理所有WebSocket连接和在线用户统计
 */
@Slf4j
@Component
public class WebSocketSessionManager {
    
    private final AtomicInteger onlineCount = new AtomicInteger(0);
    private final Map<Long, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<Long, SessionInfo> sessionInfoMap = new ConcurrentHashMap<>();
    
    /**
     * 会话信息
     */
    @Data
    public static class SessionInfo {
        private Long userId;
        private String remoteAddress;
        private String userAgent;
        private LocalDateTime connectTime;
        private LocalDateTime lastActiveTime;
    }
    
    /**
     * 添加会话
     */
    public void addSession(Long userId, WebSocketSession session, String remoteAddress, String userAgent) {
        sessions.put(userId, session);
        
        SessionInfo info = new SessionInfo();
        info.setUserId(userId);
        info.setRemoteAddress(remoteAddress);
        info.setUserAgent(userAgent);
        info.setConnectTime(LocalDateTime.now());
        info.setLastActiveTime(LocalDateTime.now());
        sessionInfoMap.put(userId, info);
        
        int count = onlineCount.incrementAndGet();
        log.info("用户{}上线，当前在线人数: {}", userId, count);
    }
    
    /**
     * 移除会话
     */
    public void removeSession(Long userId) {
        sessions.remove(userId);
        sessionInfoMap.remove(userId);
        int count = onlineCount.decrementAndGet();
        log.info("用户{}下线，当前在线人数: {}", userId, count);
    }
    
    /**
     * 获取会话
     */
    public WebSocketSession getSession(Long userId) {
        return sessions.get(userId);
    }
    
    /**
     * 更新最后活动时间
     */
    public void updateLastActiveTime(Long userId) {
        SessionInfo info = sessionInfoMap.get(userId);
        if (info != null) {
            info.setLastActiveTime(LocalDateTime.now());
        }
    }
    
    /**
     * 获取在线人数
     */
    public int getOnlineCount() {
        return onlineCount.get();
    }
    
    /**
     * 获取所有在线用户
     */
    public List<SessionInfo> getOnlineUsers() {
        return new ArrayList<>(sessionInfoMap.values());
    }
    
    /**
     * 检查用户是否在线
     */
    public boolean isOnline(Long userId) {
        WebSocketSession session = sessions.get(userId);
        return session != null && session.isOpen();
    }
    
    /**
     * 获取会话信息
     */
    public SessionInfo getSessionInfo(Long userId) {
        return sessionInfoMap.get(userId);
    }
}
