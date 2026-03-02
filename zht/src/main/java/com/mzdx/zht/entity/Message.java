package com.mzdx.zht.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("tb_message")
public class Message {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long senderId;
    private Long receiverId;
    private Long itemId;
    private String content;
    private Integer type;
    private Integer isRead;
    //逻辑删除字段 0-正常 1-删除
    @TableLogic
    private Integer deleted;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
}
