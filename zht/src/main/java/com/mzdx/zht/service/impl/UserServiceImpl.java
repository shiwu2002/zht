package com.mzdx.zht.service.impl;

import cn.binarywang.wx.miniapp.api.WxMaService;
import cn.binarywang.wx.miniapp.bean.WxMaJscode2SessionResult;
import cn.hutool.core.bean.BeanUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.common.ResultCode;
import com.mzdx.zht.dto.LoginDTO;
import com.mzdx.zht.entity.User;
import com.mzdx.zht.exception.BusinessException;
import com.mzdx.zht.mapper.UserMapper;
import com.mzdx.zht.service.UserService;
import com.mzdx.zht.utils.JwtUtil;
import com.mzdx.zht.vo.UserVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.data.redis.core.RedisTemplate;
import java.util.concurrent.TimeUnit;
import java.util.Random;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
    private final WxMaService wxMaService;
    private final JwtUtil jwtUtil;
    private final JavaMailSender mailSender;
    private final RedisTemplate<String, String> redisTemplate;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    // 验证码有效期（分钟）
    private static final int CODE_EXPIRE_MINUTES = 5;
    // 每天发送次数限制
    private static final int DAILY_SEND_LIMIT = 5;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Object login(LoginDTO loginDTO) {
        try {
            // 调用微信接口获取 openid 和 session_key
            WxMaJscode2SessionResult session = wxMaService.getUserService()
                    .getSessionInfo(loginDTO.getCode());
            String openid = session.getOpenid();

            // 查询用户是否存在
            User user = this.getOne(new LambdaQueryWrapper<User>()
                    .eq(User::getOpenid, openid));

            if (user == null) {
                // 新用户注册
                user = new User();
                user.setOpenid(openid);
                user.setNickname(loginDTO.getNickname());
                user.setAvatar(loginDTO.getAvatar());
                user.setCreditScore(100); // 初始信用分 100
                user.setStatus(1);
                this.save(user);
            } else {
                // 更新用户信息（只有当传入的值不为空时才更新）
                if (loginDTO.getNickname() != null && !loginDTO.getNickname().isEmpty()) {
                    user.setNickname(loginDTO.getNickname());
                }
                if (loginDTO.getAvatar() != null && !loginDTO.getAvatar().isEmpty()) {
                    user.setAvatar(loginDTO.getAvatar());
                }
                this.updateById(user);
            }

            // 生成 JWT token
            String token = jwtUtil.generateToken(user.getId(), openid);

            // 返回 token 和用户信息
            UserVO userVO = BeanUtil.copyProperties(user, UserVO.class);
            Map<String, Object> result = new HashMap<>();
            result.put("token", token);
            result.put("user", userVO);
            return result;

        } catch (Exception e) {
            log.error("微信登录失败", e);
            throw new BusinessException(ResultCode.USER_LOGIN_FAILED);
        }
    }
    
    @Override
    public UserVO getUserInfo(Long userId) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        return BeanUtil.copyProperties(user, UserVO.class);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateUserInfo(User user) {
        if (user.getId() == null) {
            throw new BusinessException(ResultCode.PARAM_ERROR);
        }
        return this.updateById(user);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean bindPhone(Long userId, String phone) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        user.setPhone(phone);
        return this.updateById(user);
    }
    
    @Override
    public Integer getCreditScore(Long userId) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        return user.getCreditScore();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateCreditScore(Long userId, Integer score) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        user.setCreditScore(score);
        return this.updateById(user);
    }
    
    @Override
    public void sendEmailCode(Long userId, String email) {
        // 验证邮箱格式
        if (!isValidEmail(email)) {
            throw new BusinessException("邮箱格式不正确");
        }
        
        // 检查邮箱是否已被其他用户绑定
        User existUser = this.getOne(new LambdaQueryWrapper<User>()
                .eq(User::getEmail, email)
                .ne(User::getId, userId));
        if (existUser != null) {
            throw new BusinessException("该邮箱已被其他用户绑定");
        }
        
        // Redis key
        String codeKey = "email:code:" + email;
        String countKey = "email:count:" + email;
        
        // 检查每日发送次数限制
        String countStr = redisTemplate.opsForValue().get(countKey);
        int count = countStr != null ? Integer.parseInt(countStr) : 0;
        if (count >= DAILY_SEND_LIMIT) {
            throw new BusinessException("今日发送次数已达上限");
        }
        
        // 生成 6 位验证码
        String code = generateCode();
        
        try {
            // 发送邮件
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("闲置物品交换平台 - 邮箱验证码");
            message.setText("您的验证码是：" + code + "，有效期为" + CODE_EXPIRE_MINUTES + "分钟。请勿将验证码泄露给他人。");
            
            mailSender.send(message);
            
            // 存储验证码到 Redis，有效期 5 分钟
            redisTemplate.opsForValue().set(codeKey, code, CODE_EXPIRE_MINUTES, TimeUnit.MINUTES);
            
            // 增加发送次数计数，有效期 24 小时
            redisTemplate.opsForValue().increment(countKey);
            redisTemplate.expire(countKey, 24, TimeUnit.HOURS);
            
            log.info("邮件验证码发送成功，邮箱：{}", email);
            
        } catch (Exception e) {
            log.error("邮件验证码发送失败，邮箱：{}", email, e);
            throw new BusinessException("邮件发送失败，请稍后重试");
        }
    }
    
    @Override
    public boolean verifyEmail(Long userId, String code) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            throw new BusinessException("请先绑定邮箱");
        }
        
        // 从 Redis 获取验证码
        String codeKey = "email:code:" + user.getEmail();
        String storedCode = redisTemplate.opsForValue().get(codeKey);
        
        if (storedCode == null) {
            throw new BusinessException("验证码已过期");
        }
        
        if (!storedCode.equals(code)) {
            throw new BusinessException("验证码错误");
        }
        
        // 验证成功，更新用户邮箱验证状态
        user.setEmailVerified(1);
        this.updateById(user);
        
        // 删除验证码
        redisTemplate.delete(codeKey);
        
        log.info("邮箱验证成功，用户 ID：{}, 邮箱：{}", userId, user.getEmail());
        return true;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean bindEmail(Long userId, String email, String code) {
        User user = this.getById(userId);
        if (user == null) {
            throw new BusinessException(ResultCode.USER_NOT_FOUND);
        }
        
        // 验证邮箱格式
        if (!isValidEmail(email)) {
            throw new BusinessException("邮箱格式不正确");
        }
        
        // 检查邮箱是否已被其他用户绑定
        User existUser = this.getOne(new LambdaQueryWrapper<User>()
                .eq(User::getEmail, email)
                .ne(User::getId, userId));
        if (existUser != null) {
            throw new BusinessException("该邮箱已被其他用户绑定");
        }
        
        // 验证验证码
        String codeKey = "email:code:" + email;
        String storedCode = redisTemplate.opsForValue().get(codeKey);
        
        if (storedCode == null) {
            throw new BusinessException("验证码已过期");
        }
        
        if (!storedCode.equals(code)) {
            throw new BusinessException("验证码错误");
        }
        
        // 绑定邮箱
        user.setEmail(email);
        user.setEmailVerified(1);
        this.updateById(user);
        
        // 删除验证码
        redisTemplate.delete(codeKey);
        
        log.info("邮箱绑定成功，用户 ID：{}, 邮箱：{}", userId, email);
        return true;
    }
    
    /**
     * 验证邮箱格式
     */
    private boolean isValidEmail(String email) {
        if (email == null || email.isEmpty()) {
            return false;
        }
        String regex = "^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\\.[a-zA-Z0-9_-]+)+$";
        return email.matches(regex);
    }
    
    /**
     * 生成 6 位验证码
     */
    private String generateCode() {
        Random random = new Random();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 6; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
