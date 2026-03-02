package com.mzdx.zht.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_report")
public class Report {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long reporterId;
    private Long targetId;
    private Integer targetType;
    private String reason;
    private String description;
    private Integer status;
    private String handleResult;
    //逻辑删除字段 0-正常 1-删除
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
