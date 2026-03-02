package com.mzdx.zht.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.mzdx.zht.entity.Favorite;
import com.mzdx.zht.vo.ItemVO;

/**
 * 收藏服务接口
 */
public interface FavoriteService extends IService<Favorite> {
    
    /**
     * 添加收藏
     */
    boolean addFavorite(Long itemId, Long userId);
    
    /**
     * 取消收藏
     */
    boolean removeFavorite(Long itemId, Long userId);
    
    /**
     * 检查是否已收藏
     */
    boolean isFavorite(Long itemId, Long userId);
    
    /**
     * 获取我的收藏
     */
    Page<ItemVO> getMyFavorites(Long userId, Integer current, Integer size);
}
