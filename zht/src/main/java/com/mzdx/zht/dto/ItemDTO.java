package com.mzdx.zht.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ItemDTO {
    
    private Long id;
    
    @NotBlank(message = "标题不能为空")
    private String title;
    
    @NotBlank(message = "描述不能为空")
    private String description;
    
    @NotNull(message = "图片不能为空")
    private List<String> images;
    
    @NotNull(message = "分类不能为空")
    private Long categoryId;
    
    private String tags;
    
    @NotNull(message = "交换类型不能为空")
    private Integer exchangeType;
    
    private BigDecimal price;
    private String exchangeCondition;
    
    @NotBlank(message = "位置不能为空")
    private String location;
    
    private Double longitude;
    private Double latitude;
}
