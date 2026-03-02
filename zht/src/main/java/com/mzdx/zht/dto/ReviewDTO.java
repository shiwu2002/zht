package com.mzdx.zht.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewDTO {
    
    @NotNull(message = "交换ID不能为空")
    private Long exchangeId;
    
    @NotNull(message = "被评价者ID不能为空")
    private Long reviewedId;
    
    @NotNull(message = "评分不能为空")
    @Min(value = 1, message = "评分最低为1")
    @Max(value = 5, message = "评分最高为5")
    private Integer rating;
    
    private String content;
}
