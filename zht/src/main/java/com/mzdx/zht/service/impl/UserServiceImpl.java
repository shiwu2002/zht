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

/**
 * 用户服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
    private final WxMaService wxMaService;
    private final JwtUtil jwtUtil;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public String login(LoginDTO loginDTO) {
        try {
            // 调用微信接口获取openid和session_key
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
                user.setCreditScore(100); // 初始信用分100
                user.setStatus(1);
                this.save(user);
            } else {
                // 更新用户信息
                user.setNickname(loginDTO.getNickname());
                user.setAvatar(loginDTO.getAvatar());
                this.updateById(user);
            }
            
            // 生成JWT token
            return jwtUtil.generateToken(user.getId(), openid);
            
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
}
