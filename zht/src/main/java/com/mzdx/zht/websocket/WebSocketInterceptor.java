package com.mzdx.zht.websocket;

import com.mzdx.zht.utils.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

/**
 * WebSocket握手拦截器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketInterceptor implements HandshakeInterceptor {
    
    private final JwtUtil jwtUtil;
    
    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String token = servletRequest.getServletRequest().getParameter("token");
            
            if (token != null && jwtUtil.validateToken(token)) {
                Long userId = jwtUtil.getUserIdFromToken(token);
                attributes.put("userId", userId);
                
                // 记录客户端信息供ChatWebSocketHandler使用
                String remoteAddress = servletRequest.getRemoteAddress() != null ? 
                    servletRequest.getRemoteAddress().getAddress().getHostAddress() : "unknown";
                String userAgent = servletRequest.getHeaders().getFirst("User-Agent");
                
                attributes.put("remoteAddress", remoteAddress);
                attributes.put("userAgent", userAgent);
                
                log.info("WebSocket握手成功，用户ID: {}, 远程地址: {}", userId, remoteAddress);
                return true;
            }
        }
        
        log.warn("WebSocket握手失败：token无效");
        return false;
    }
    
    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                              WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            // 握手过程中发生异常
            log.error("WebSocket握手异常: {}", exception.getMessage(), exception);
            return;
        }
        
        // 记录握手成功的详细信息
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String remoteAddress = servletRequest.getRemoteAddress().getAddress().getHostAddress();
            String userAgent = servletRequest.getHeaders().getFirst("User-Agent");
            
            log.info("WebSocket握手完成 - 远程地址: {}, User-Agent: {}", remoteAddress, userAgent);
        }
        
        // 可以在这里添加握手成功后的统计、监控等逻辑
        // 例如：记录在线用户数、发送系统通知等
    }
}
