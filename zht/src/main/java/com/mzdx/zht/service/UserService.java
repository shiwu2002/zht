package com.mzdx.zht.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mzdx.zht.entity.User;
import com.mzdx.zht.dto.LoginDTO;
import com.mzdx.zht.vo.UserVO;

/**
 * 用户服务接口
 */
public interface UserService extends IService<User> {
    
    /**
     * 微信小程序登录
     */
    String login(LoginDTO loginDTO);
    
    /**
     * 获取用户信息
     */
    UserVO getUserInfo(Long userId);
    
    /**
     * 更新用户信息
     */
    boolean updateUserInfo(User user);
    
    /**
     * 绑定手机号
     */
    boolean bindPhone(Long userId, String phone);
    
    /**
     * 获取用户信用分
     */
    Integer getCreditScore(Long userId);
    
    /**
     * 更新用户信用分
     */
    boolean updateCreditScore(Long userId, Integer score);
}
