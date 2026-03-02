package com.mzdx.zht.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("tb_item")
public class Item {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String images;
    private Long categoryId;
    private String tags;
    private Integer exchangeType;
    private BigDecimal price;
    private String exchangeCondition;
    private String location;
    private Double longitude;
    private Double latitude;
    private Integer status;
    private Integer viewCount;
    private Integer favoriteCount;
    //逻辑删除字段 0-正常 1-删除
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
