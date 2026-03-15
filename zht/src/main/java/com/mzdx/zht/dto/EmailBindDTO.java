package com.mzdx.zht.dto;

import lombok.Data;

/**
 * 邮箱绑定 DTO
 */
@Data
public class EmailBindDTO {
    
    /**
     * 邮箱地址
     */
    private String email;
    
    /**
     * 验证码
     */
    private String code;
}
