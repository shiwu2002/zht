package com.mzdx.zht.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDTO {
    
    @NotBlank(message = "code不能为空")
    private String code;
    private String phone;
    private String nickname;
    private String avatar;
}
