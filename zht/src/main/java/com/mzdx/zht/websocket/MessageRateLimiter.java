package com.mzdx.zht.websocket;

import com.google.common.util.concurrent.RateLimiter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 消息限流器
 * 防止用户发送消息过于频繁
 */
@Slf4j
@Component
public class MessageRateLimiter {
    
    // 每个用户每秒最多发送10条消息
    private final Map<Long, RateLimiter> limiters = new ConcurrentHashMap<>();
    private static final double PERMITS_PER_SECOND = 10.0;
    
    /**
     * 尝试获取许可
     * @param userId 用户ID
     * @return 是否获取成功
     */
    public boolean tryAcquire(Long userId) {
        RateLimiter limiter = limiters.computeIfAbsent(
            userId, 
            k -> RateLimiter.create(PERMITS_PER_SECOND)
        );
        
        boolean acquired = limiter.tryAcquire();
        if (!acquired) {
            log.warn("用户{}发送消息过于频繁，已限流", userId);
        }
        return acquired;
    }
    
    /**
     * 清理不活跃用户的限流器
     */
    public void cleanup(Long userId) {
        limiters.remove(userId);
    }
    
    /**
     * 获取当前限流器数量
     */
    public int getLimiterCount() {
        return limiters.size();
    }
}
