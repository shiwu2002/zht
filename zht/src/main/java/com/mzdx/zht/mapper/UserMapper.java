package com.mzdx.zht.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.mzdx.zht.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
