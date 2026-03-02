package com.mzdx.zht.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mzdx.zht.entity.Message;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MessageMapper extends BaseMapper<Message> {
}
