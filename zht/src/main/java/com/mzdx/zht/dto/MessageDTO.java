package com.mzdx.zht.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class MessageDTO {
    
    @NotNull(message = "接收者ID不能为空")
    private Long receiverId;
    private Long itemId;
    
    @NotBlank(message = "消息内容不能为空")
    private String content;
    private Integer type;
}
