package com.mzdx.zht.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.mzdx.zht.entity.Category;

import java.util.List;

/**
 * 分类服务接口
 */
public interface CategoryService extends IService<Category> {
    
    /**
     * 获取所有分类
     */
    List<Category> getAllCategories();
    
    /**
     * 获取热门分类
     */
    List<Category> getHotCategories();
}
