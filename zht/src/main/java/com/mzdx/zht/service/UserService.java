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
     * @param loginDTO 登录参数
     * @return 包含 token 和用户信息的 Map
     */
    Object login(LoginDTO loginDTO);
    
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
     * 发送邮箱验证码
     * @param userId 用户 ID
     * @param email 邮箱地址
     */
    void sendEmailCode(Long userId, String email);
    
    /**
     * 验证邮箱
     * @param userId 用户 ID
     * @param code 验证码
     * @return 验证结果
     */
    boolean verifyEmail(Long userId, String code);
    
    /**
     * 绑定邮箱
     * @param userId 用户 ID
     * @param email 邮箱地址
     * @param code 验证码
     * @return 绑定结果
     */
    boolean bindEmail(Long userId, String email, String code);
    
    /**
     * 获取用户信用分
     */
    Integer getCreditScore(Long userId);
    
    /**
     * 更新用户信用分
     */
    boolean updateCreditScore(Long userId, Integer score);
}
