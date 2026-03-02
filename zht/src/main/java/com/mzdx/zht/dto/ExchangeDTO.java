package com.mzdx.zht.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ExchangeDTO {
    
    @NotNull(message = "请求物品ID不能为空")
    private Long requestItemId;
    
    @NotNull(message = "提供物品ID不能为空")
    private Long offerItemId;
    
    private String message;
}
