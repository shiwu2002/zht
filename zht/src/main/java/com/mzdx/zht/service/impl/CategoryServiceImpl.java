package com.mzdx.zht.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.mzdx.zht.entity.Category;
import com.mzdx.zht.mapper.CategoryMapper;
import com.mzdx.zht.service.CategoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 分类服务实现类
 */
@Slf4j
@Service
public class CategoryServiceImpl extends ServiceImpl<CategoryMapper, Category> implements CategoryService {
    
    @Override
    public List<Category> getAllCategories() {
        return this.list(new LambdaQueryWrapper<Category>()
                .orderByAsc(Category::getSort));
    }
    
    @Override
    public List<Category> getHotCategories() {
        return this.list(new LambdaQueryWrapper<Category>()
                .orderByDesc(Category::getSort)
                .last("LIMIT 10"));
    }
}
