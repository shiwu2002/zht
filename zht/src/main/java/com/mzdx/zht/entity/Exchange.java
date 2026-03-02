package com.mzdx.zht.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_exchange")
public class Exchange {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long requestItemId;
    private Long offerItemId;
    private Long requestUserId;
    private Long offerUserId;
    private String message;
    private Integer status;
    private String rejectReason;
    private LocalDateTime completedTime;
    //逻辑删除字段 0-正常 1-删除
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
