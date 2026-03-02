package com.mzdx.zht.interceptor;

import com.mzdx.zht.common.ResultCode;
import com.mzdx.zht.exception.BusinessException;
import com.mzdx.zht.utils.JwtUtil;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }
        
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            throw new BusinessException(ResultCode.TOKEN_MISSING);
        }
        
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        if (!jwtUtil.validateToken(token)) {
            throw new BusinessException(ResultCode.TOKEN_INVALID);
        }
        
        Long userId = jwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);
        
        return true;
    }
}
