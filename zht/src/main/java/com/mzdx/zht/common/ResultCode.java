package com.mzdx.zht.common;

import lombok.Getter;

/**
 * 状态码枚举
 */
@Getter
public enum ResultCode {
    
    SUCCESS(200, "操作成功"),
    ERROR(500, "操作失败"),
    
    // 用户相关 1xxx
    USER_NOT_FOUND(1001, "用户不存在"),
    USER_ALREADY_EXISTS(1002, "用户已存在"),
    USER_LOGIN_ERROR(1003, "用户名或密码错误"),
    USER_NOT_LOGIN(1004, "用户未登录"),
    USER_NO_PERMISSION(1005, "用户无权限"),
    USER_ACCOUNT_FORBIDDEN(1006, "账号已被禁用"),
    USER_PHONE_EXISTS(1007, "手机号已被注册"),
    USER_LOGIN_FAILED(1008, "登录失败"),
    
    // Token相关 2xxx
    TOKEN_INVALID(2001, "Token无效"),
    TOKEN_EXPIRED(2002, "Token已过期"),
    TOKEN_MISSING(2003, "Token缺失"),
    
    // 物品相关 3xxx
    ITEM_NOT_FOUND(3001, "物品不存在"),
    ITEM_ALREADY_EXCHANGED(3002, "物品已被交换"),
    ITEM_OWNER_ERROR(3003, "不能操作自己的物品"),
    ITEM_STATUS_ERROR(3004, "物品状态异常"),
    ITEM_NO_PERMISSION(3005, "无权限操作此物品"),
    
    // 交换相关 4xxx
    EXCHANGE_NOT_FOUND(4001, "交换记录不存在"),
    EXCHANGE_STATUS_ERROR(4002, "交换状态异常"),
    EXCHANGE_ALREADY_EXISTS(4003, "已存在交换申请"),
    EXCHANGE_CANNOT_CANCEL(4004, "当前状态不允许取消"),
    EXCHANGE_ITEM_UNAVAILABLE(4005, "物品不可用"),
    EXCHANGE_SELF_NOT_ALLOWED(4006, "不能与自己交换"),
    EXCHANGE_NO_PERMISSION(4007, "无权限操作此交换"),
    
    // 消息相关 5xxx
    MESSAGE_SEND_ERROR(5001, "消息发送失败"),
    
    // 评价相关 5xxx
    REVIEW_ALREADY_EXISTS(5101, "已评价过该交换"),
    
    // 文件相关 6xxx
    FILE_UPLOAD_ERROR(6001, "文件上传失败"),
    FILE_TYPE_ERROR(6002, "文件类型不支持"),
    FILE_SIZE_ERROR(6003, "文件大小超出限制"),
    
    // 参数相关 7xxx
    PARAM_ERROR(7001, "参数错误"),
    PARAM_MISSING(7002, "参数缺失"),
    
    // 系统相关 9xxx
    SYSTEM_ERROR(9001, "系统异常"),
    DATABASE_ERROR(9002, "数据库异常"),
    NETWORK_ERROR(9003, "网络异常");
    
    private final Integer code;
    private final String message;
    
    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
