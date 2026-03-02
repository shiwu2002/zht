package com.mzdx.zht.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_review")
public class Review {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long exchangeId;
    private Long reviewerId;
    private Long reviewedId;
    private Integer rating;
    private String content;
    //逻辑删除字段 0-正常 1-删除
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
